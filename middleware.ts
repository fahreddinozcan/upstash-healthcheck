import { NextResponse, NextRequest } from "next/server";
import {
  ResponseCookies,
  RequestCookies,
} from "next/dist/server/web/spec-extension/cookies";

function applySetCookie(req: NextRequest, res: NextResponse): void {
  // parse the outgoing Set-Cookie header
  const setCookies = new ResponseCookies(res.headers);
  // Build a new Cookie header for the request by adding the setCookies
  const newReqHeaders = new Headers(req.headers);
  const newReqCookies = new RequestCookies(newReqHeaders);
  setCookies.getAll().forEach((cookie) => newReqCookies.set(cookie));
  // set “request header overrides” on the outgoing response
  NextResponse.next({
    request: { headers: newReqHeaders },
  }).headers.forEach((value, key) => {
    if (
      key === "x-middleware-override-headers" ||
      key.startsWith("x-middleware-request-")
    ) {
      res.headers.set(key, value);
    }
  });
}

export function middleware(req: NextRequest) {
  const hasSessionToken = req.cookies.has("session_token");
  const response = NextResponse.next();

  let sessionToken;
  if (hasSessionToken) {
    sessionToken = req.cookies.get("session_token")?.value as string;
  } else {
    sessionToken = (Date.now() - Math.floor(Math.random() * 100)).toString();
  }

  response.cookies.set("session_token", sessionToken);
  applySetCookie(req, response);
  return response;
}
