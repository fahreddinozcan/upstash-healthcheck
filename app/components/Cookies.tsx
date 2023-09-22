"use server";
import { cookies } from "next/headers";

export async function setCookie({ token }: { token: string }) {
  cookies().set("sessionToken", token);
}
