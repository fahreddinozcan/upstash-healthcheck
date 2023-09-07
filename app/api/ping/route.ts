import { NextResponse, NextRequest } from "next/server";
import { Redis } from "@upstash/redis";
import axios from "axios";

const redis = new Redis({
  url: "https://united-lamprey-34660.upstash.io",
  token:
    "AYdkASQgMjg0NTE4OGUtODZkYi00NTE2LWIyNTUtMjE4NDVlNmJmZjY3NWE5YWYxYmEyOTA0NDIxMTk3Y2FjNmQwZTA3ZmUzZjg=",
});

export async function GET(_req: NextRequest) {
  const url = "google.com";
  const currentDate = new Date();
  const time =
    currentDate.getHours() +
    ":" +
    currentDate.getMinutes() +
    ":" +
    currentDate.getSeconds();

  const currentTime = Date.now();
  await axios.get(`https://${url}`);
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
