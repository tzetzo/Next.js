"use server";

import * as auth from "@/auth";

export async function signIn() {
  // sign in with github oath provider
  return auth.signIn("github");
}
