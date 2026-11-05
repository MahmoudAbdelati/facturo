"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      return error.type === "CredentialsSignin"
        ? "That email and password don't match."
        : "Something went wrong. Try again.";
    }
    throw error;
  }
}

export async function logOut() {
  await signOut({ redirectTo: "/" });
}
