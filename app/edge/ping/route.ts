import ping from "pingman";
import { NextResponse, NextRequest } from "next/server";
import { Redis } from "@upstash/redis";
import { verifySignatureEdge } from "@upstash/qstash/dist/nextjs";
import axios from "axios";

const redis = new Redis({
  url: "https://united-lamprey-34660.upstash.io",
  token:
    "AYdkASQgMjg0NTE4OGUtODZkYi00NTE2LWIyNTUtMjE4NDVlNmJmZjY3NWE5YWYxYmEyOTA0NDIxMTk3Y2FjNmQwZTA3ZmUzZjg=",
});

export const POST = verifySignatureEdge(handler);

async function handler(request: NextRequest) {
  const { url, sessionToken } = await request.json();

  const currentDate = new Date();
  const time =
    currentDate.getHours().toString().padStart(2, "0") +
    ":" +
    currentDate.getMinutes().toString().padStart(2, "0");

  const currentTime = Date.now();
  await axios.get(`${url}`);
  const pingTime = Date.now() - currentTime;

  const pingData = {
    time: time,
    ping: pingTime,
  };

  const res = await redis.json.arrappend(
    `ping_data:${sessionToken}:${url}`,
    "$",
    JSON.stringify(pingData)
  );

  return NextResponse.json({ ping: pingTime, time: time });
}
