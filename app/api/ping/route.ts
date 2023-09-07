import { NextResponse, NextRequest } from "next/server";
import { Redis } from "@upstash/redis";
import axios from "axios";

const redis = new Redis({
  url: "https://united-lamprey-34660.upstash.io",
  token:
    "AYdkASQgMjg0NTE4OGUtODZkYi00NTE2LWIyNTUtMjE4NDVlNmJmZjY3NWE5YWYxYmEyOTA0NDIxMTk3Y2FjNmQwZTA3ZmUzZjg=",
});

export const runtime = "edge";

export async function GET(req: NextRequest) {
  console.log("GET REQUEST");
  const url = "google.com";
  const currentDate = new Date();
  const time = currentDate.getHours() + ":" + currentDate.getMinutes();

  const currentTime = Date.now();
  await axios.get(`https://${url}`);
  const pingTime = Date.now() - currentTime;

  const pingData = {
    time: time,
    ping: pingTime,
  };

  await redis.json.arrappend(`ping_data:${url}`, "$", JSON.stringify(pingData));

  return NextResponse.json({ ping: pingTime, time: time });
}
