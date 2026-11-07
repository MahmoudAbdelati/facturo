"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { demoAccount, demoEnabled } from "@/lib/demo";
import { safeRedirectPath } from "@/lib/safe-path";

export type LoginState = { error: string; email: string } | undefined;

export async function authenticate(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  try {
    await signIn("credentials", {
      email,
      password: formData.get("password"),
      redirectTo: safeRedirectPath(formData.get("redirectTo")),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // The email comes back so the form can keep it after React resets the fields.
      return {
        email,
        error:
          error.type === "CredentialsSignin"
            ? "That email and password don't match."
            : "Something went wrong. Try again.",
      };
    }
    throw error;
  }
}

/** "Try the demo": signs in to the shared demo workspace without typing anything. */
export async function logInAsDemo(formData: FormData) {
  if (!demoEnabled) redirect("/login");

  await signIn("credentials", {
    ...demoAccount,
    redirectTo: safeRedirectPath(formData.get("redirectTo")),
  });
}

export async function logOut() {
  await signOut({ redirectTo: "/" });
}
