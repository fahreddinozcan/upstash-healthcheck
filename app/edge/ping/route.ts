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

async function handler(_request: NextRequest) {
  const url = "http://google.com";
  const currentDate = new Date();
  const time =
    currentDate.getHours() +
    ":" +
    currentDate.getMinutes() +
    ":" +
    currentDate.getSeconds();

  const currentTime = Date.now();
  await axios.get(url);
  const pingTime = Date.now() - currentTime;

  const pingData = {
    time: time,
    ping: pingTime,
  };

  const res = await redis.json.arrappend(
    `ping_data:${url}`,
    "$",
    JSON.stringify(pingData)
  );
  console.log(res);

  return NextResponse.json({ ping: pingTime, time: time });
}
