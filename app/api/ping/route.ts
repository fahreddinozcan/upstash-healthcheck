import ping from "pingman";
import { NextApiResponse, NextApiRequest } from "next";
import { Redis } from "@upstash/redis";
import { verifySignature } from "@upstash/qstash/nextjs";

export const runtime = "edge";
const redis = new Redis({
  url: "https://united-lamprey-34660.upstash.io",
  token:
    "AYdkASQgMjg0NTE4OGUtODZkYi00NTE2LWIyNTUtMjE4NDVlNmJmZjY3NWE5YWYxYmEyOTA0NDIxMTk3Y2FjNmQwZTA3ZmUzZjg=",
});

// const receiver = new Receiver({
//   currentSigningKey: "sig_69BSYbQhkboLVqEpaX4LkGduzbPN",
//   nextSigningKey: "sig_7czUw2TTv1VCSegkPtraCd5x2cTX",
// });

export default verifySignature(handler);

export async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method !== "POST")
    return response.status(405).json({ message: "Method not allowed" });

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

  return response.status(200).json({ message: "pong" });
}
