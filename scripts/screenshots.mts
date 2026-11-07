// Takes the product screenshots used on the landing page (and the README) from a running app.
//
//   pnpm dev                      (or pnpm build && pnpm start)
//   pnpm screenshots              (BASE_URL=http://localhost:3005 pnpm screenshots for another port)
//
// Drives headless Chrome or Edge over the DevTools protocol, logs in as the demo user and
// writes public/screenshots/<page>-<theme>.webp. CHROME_PATH overrides the browser.

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const OUT_DIR = path.join(import.meta.dirname, "..", "public", "screenshots");
const PORT = 9333;
const VIEWPORT = { width: 1440, height: 900, deviceScaleFactor: 2 };
const THEMES = ["dark", "light"] as const;
const demo = {
  email: process.env.DEMO_EMAIL ?? "demo@facturo.app",
  password: process.env.DEMO_PASSWORD ?? "facturo-demo",
};

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ];
  const found = candidates.find((candidate) => candidate && existsSync(candidate));
  if (!found) throw new Error("No Chrome or Edge found. Set CHROME_PATH.");
  return found;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** A minimal DevTools protocol client for one page. */
async function connect(wsUrl: string) {
  const socket = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  let nextId = 1;
  const pending = new Map<number, { resolve: (value: any) => void; reject: (error: Error) => void }>();
  const listeners = new Map<string, Array<(params: any) => void>>();

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(String(event.data));
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id)!;
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    } else if (message.method) {
      listeners.get(message.method)?.forEach((listener) => listener(message.params));
    }
  });

  const send = (method: string, params: object = {}): Promise<any> =>
    new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });

  const once = (method: string) =>
    new Promise<any>((resolve) => {
      const list = listeners.get(method) ?? [];
      const listener = (params: any) => {
        listeners.set(method, (listeners.get(method) ?? []).filter((l) => l !== listener));
        resolve(params);
      };
      listeners.set(method, [...list, listener]);
    });

  const evaluate = async <T,>(expression: string): Promise<T> => {
    const { result, exceptionDetails } = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? "Evaluation failed");
    return result.value as T;
  };

  /** Navigates and waits until the page has loaded and streamed content and charts have settled. */
  const goto = async (url: string) => {
    const loaded = once("Page.loadEventFired");
    await send("Page.navigate", { url });
    await loaded;
    await waitFor("document.readyState === 'complete' && !document.querySelector('[aria-busy=true]')");
    await evaluate("document.fonts.ready.then(() => true)");
    await sleep(1800); // chart animations
  };

  const waitFor = async (condition: string, timeout = 15000) => {
    const start = Date.now();
    while (!(await evaluate<boolean>(`Boolean(${condition})`))) {
      if (Date.now() - start > timeout) throw new Error(`Timed out waiting for: ${condition}`);
      await sleep(150);
    }
  };

  return { send, evaluate, goto, waitFor, close: () => socket.close() };
}

async function main() {
  const health = await fetch(`${BASE_URL}/login`).catch(() => null);
  if (!health?.ok) throw new Error(`The app isn't running at ${BASE_URL}.`);

  const profile = await mkdtemp(path.join(tmpdir(), "facturo-shots-"));
  const browser = spawn(
    findBrowser(),
    [
      "--headless=new",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profile}`,
      "--hide-scrollbars",
      "--no-first-run",
      "--no-default-browser-check",
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  try {
    let target: { webSocketDebuggerUrl: string } | undefined;
    for (let attempt = 0; attempt < 50 && !target; attempt++) {
      await sleep(200);
      const targets = await fetch(`http://127.0.0.1:${PORT}/json/list`)
        .then((response) => response.json())
        .catch(() => []);
      target = targets.find((t: { type: string }) => t.type === "page");
    }
    if (!target) throw new Error("The browser didn't start.");

    const page = await connect(target.webSocketDebuggerUrl);
    await page.send("Page.enable");
    await page.send("Runtime.enable");
    await page.send("Emulation.setDeviceMetricsOverride", { ...VIEWPORT, mobile: false });

    // Log in through the real form.
    await page.goto(`${BASE_URL}/login`);
    await page.evaluate(`(() => {
      document.querySelector('#email').value = ${JSON.stringify(demo.email)};
      document.querySelector('#password').value = ${JSON.stringify(demo.password)};
      document.querySelector('#email').form.requestSubmit();
      return true;
    })()`);
    await page.waitFor("location.pathname === '/overview'");

    // A sent invoice makes the best detail shot: an amount due and a next action.
    await page.goto(`${BASE_URL}/invoices?status=sent`);
    const invoicePath = await page.evaluate<string>(
      `[...document.querySelectorAll('a[href^="/invoices/"]')]
        .map((a) => a.getAttribute('href'))
        .find((href) => /^\\/invoices\\/[0-9a-f-]{36}$/.test(href))`,
    );
    const clientPath = await page.evaluate<string>(
      `document.querySelector('a[href^="/clients/"]')?.getAttribute('href')`,
    );

    const shots = [
      { name: "overview", path: "/overview" },
      { name: "invoices", path: "/invoices" },
      { name: "invoice", path: invoicePath },
      { name: "client", path: clientPath },
    ];

    await mkdir(OUT_DIR, { recursive: true });
    for (const theme of THEMES) {
      await page.evaluate(`localStorage.setItem('theme', '${theme}')`);
      for (const shot of shots) {
        if (!shot.path) {
          console.warn(`Skipped ${shot.name}: no link found.`);
          continue;
        }
        await page.goto(`${BASE_URL}${shot.path}`);
        // The dev server's indicator badge.
        await page.evaluate(`document.querySelectorAll('nextjs-portal').forEach((el) => el.remove())`);
        const { data } = await page.send("Page.captureScreenshot", { format: "webp", quality: 88 });
        const file = path.join(OUT_DIR, `${shot.name}-${theme}.webp`);
        await writeFile(file, Buffer.from(data, "base64"));
        console.log(`Saved ${path.relative(process.cwd(), file)}`);
      }
    }
    page.close();
  } finally {
    browser.kill();
    await sleep(500);
    await rm(profile, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
