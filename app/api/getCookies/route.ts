import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = cookies();

  // let sessionTokenData = cookieStore.get("session_token");

  // if (sessionTokenData) {
  //   let sessionToken = sessionTokenData.value;
  //   return NextResponse.json({ sessionToken });
  // }

  let sessionToken = (Date.now() - Math.floor(Math.random() * 100)).toString();

  cookieStore.set("session_token", sessionToken);

  return NextResponse.json({ sessionToken });
}
