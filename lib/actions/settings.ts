"use server";

import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { sql } from "@/lib/db";
import { demoAccount, demoEnabled } from "@/lib/demo";
import {
  fieldErrors,
  passwordSchema,
  profileSchema,
  textFields,
  type PasswordField,
  type ProfileField,
  type SettingsFormState,
} from "@/lib/validations/settings";

async function signedInEmail() {
  const session = await auth();
  return session?.user?.email ?? null;
}

export async function updateProfile(
  _prevState: SettingsFormState<ProfileField>,
  formData: FormData,
): Promise<SettingsFormState<ProfileField>> {
  const email = await signedInEmail();
  if (!email) return { status: "error", message: "Your session has ended. Log in again." };

  const parsed = profileSchema.safeParse(textFields(formData, ["name", "company_name", "currency"]));
  if (!parsed.success) return fieldErrors(parsed.error);

  const input = parsed.data;
  try {
    await sql`
      UPDATE users
      SET name = ${input.name}, company_name = ${input.company_name}, currency = ${input.currency}
      WHERE email = ${email}`;
  } catch (error) {
    console.error(error);
    return { status: "error", message: "We couldn't save your settings. Please try again." };
  }

  // The name shows in the top bar and the overview; the business name on every invoice.
  revalidatePath("/", "layout");
  return { status: "success" };
}

export async function changePassword(
  _prevState: SettingsFormState<PasswordField>,
  formData: FormData,
): Promise<SettingsFormState<PasswordField>> {
  const email = await signedInEmail();
  if (!email) return { status: "error", message: "Your session has ended. Log in again." };
  // Everyone who tries the demo shares this login.
  if (demoEnabled && email === demoAccount.email) {
    return { status: "error", message: "The demo account's password can't be changed." };
  }

  const parsed = passwordSchema.safeParse(textFields(formData, ["current", "next", "confirm"]));
  if (!parsed.success) return fieldErrors(parsed.error);

  try {
    const [user] = await sql`SELECT password FROM users WHERE email = ${email}`;
    if (!user || !(await bcrypt.compare(parsed.data.current, user.password))) {
      return {
        status: "error",
        message: "Some fields need attention.",
        errors: { current: ["That isn't your current password."] },
      };
    }
    const hash = await bcrypt.hash(parsed.data.next, 10);
    await sql`UPDATE users SET password = ${hash} WHERE email = ${email}`;
  } catch (error) {
    console.error(error);
    return { status: "error", message: "We couldn't change your password. Please try again." };
  }
  return { status: "success" };
}
