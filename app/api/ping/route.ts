import ping from "pingman";
import { NextResponse, NextRequest } from "next/server";
import { Redis } from "@upstash/redis";
import { Receiver } from "@upstash/qstash";

export const runtime = "edge";
const redis = new Redis({
  url: "https://united-lamprey-34660.upstash.io",
  token:
    "AYdkASQgMjg0NTE4OGUtODZkYi00NTE2LWIyNTUtMjE4NDVlNmJmZjY3NWE5YWYxYmEyOTA0NDIxMTk3Y2FjNmQwZTA3ZmUzZjg=",
});

const receiver = new Receiver({
  currentSigningKey: "sig_69BSYbQhkboLVqEpaX4LkGduzbPN",
  nextSigningKey: "sig_7czUw2TTv1VCSegkPtraCd5x2cTX",
});

export async function GET(request: NextRequest) {
  const isValid = await receiver.verify({
    signature: "string",
    body: "string",
  });
  if (!isValid) {
    console.log("not valid");
    return new NextResponse("Unauthorized", { status: 401 });
  }

  console.log("valid");

  const url = "google.com";
  const currentDate = new Date();
  const time =
    currentDate.getHours() +
    ":" +
    currentDate.getMinutes() +
    ":" +
    currentDate.getSeconds();

  const response = await ping("google.com");

  const pingData = {
    time: time,
    ping: response.time,
  };

  const res = await redis.json.arrappend(
    `ping_data:${url}`,
    "$",
    JSON.stringify(pingData)
  );
  console.log(res);
  return NextResponse.json({ ping: response.time });
}
