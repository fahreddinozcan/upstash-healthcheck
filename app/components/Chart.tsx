"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
} from "recharts";
import { Redis } from "@upstash/redis";
import { useEffect, useState } from "react";

const redis = new Redis({
  url: "https://united-lamprey-34660.upstash.io",
  token:
    "AYdkASQgMjg0NTE4OGUtODZkYi00NTE2LWIyNTUtMjE4NDVlNmJmZjY3NWE5YWYxYmEyOTA0NDIxMTk3Y2FjNmQwZTA3ZmUzZjg=",
});

type PingObject = {
  time: string;
  ping: number;
};

export function Chart({
  sessionToken,
  scheduleId,
  url,
}: {
  sessionToken?: string;
  scheduleId?: string;
  url?: string;
}) {
  const [pingData, setPingData] = useState<PingObject[]>([]);

  useEffect(() => {
    getPingData();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(getPingData, 4000);

    return () => clearInterval(intervalId);
  });

  const getPingData = async () => {
    if (!scheduleId) return;

    const len = (
      await redis.json.arrlen(`ping_data:${sessionToken}:${url}`)
    )[0];

    if (!len) {
      setPingData([]);
      return;
    }

    const start = Math.max(0, len - 20);

    const data = (await redis.json.get(
      `ping_data:${sessionToken}:${url}`,
      `$[${start}:]`
    )) as PingObject[];
    // console.log(data);

    setPingData(data);
  };

  return (
    <div className="mt-4">
      <LineChart
        width={730}
        height={250}
        data={pingData ? pingData : []}
        margin={{ top: 0, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="ping" stroke="#8884d8" />
      </LineChart>
    </div>
  );
}
