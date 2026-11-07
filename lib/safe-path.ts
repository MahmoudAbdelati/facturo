/** A same-site path to go to after logging in; anything else (other sites, `//host`) falls back. */
export function safeRedirectPath(value: unknown, fallback = "/overview") {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")
    ? value
    : fallback;
}
