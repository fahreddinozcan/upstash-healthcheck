import ping from "pingman";
import { NextResponse, NextRequest } from "next/server";
import { Redis } from "@upstash/redis";
import { verifySignatureEdge } from "@upstash/qstash/dist/nextjs";

export const runtime = "edge";
const redis = new Redis({
  url: "https://united-lamprey-34660.upstash.io",
  token:
    "AYdkASQgMjg0NTE4OGUtODZkYi00NTE2LWIyNTUtMjE4NDVlNmJmZjY3NWE5YWYxYmEyOTA0NDIxMTk3Y2FjNmQwZTA3ZmUzZjg=",
});

export const POST = verifySignatureEdge(handler);

export async function handler(_request: NextRequest) {
  const url = "google.com";
  const currentDate = new Date();
  const time =
    currentDate.getHours() +
    ":" +
    currentDate.getMinutes() +
    ":" +
    currentDate.getSeconds();

  const resPing = await ping("google.com");

  const pingData = {
    time: time,
    ping: resPing.time,
  };

  const res = await redis.json.arrappend(
    `ping_data:${url}`,
    "$",
    JSON.stringify(pingData)
  );
  console.log(res);

  return NextResponse.json({ message: "pong" });
}
