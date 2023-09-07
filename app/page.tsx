"use client";

import Image from "next/image";
import {
  Line,
  LineChart,
  CartesianGrid,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
} from "recharts";
import { useState, useContext, useEffect } from "react";
import { Redis } from "@upstash/redis";
import ping from "pingman";

const redis = new Redis({
  url: "https://united-lamprey-34660.upstash.io",
  token:
    "AYdkASQgMjg0NTE4OGUtODZkYi00NTE2LWIyNTUtMjE4NDVlNmJmZjY3NWE5YWYxYmEyOTA0NDIxMTk3Y2FjNmQwZTA3ZmUzZjg=",
});

type PingObject = {
  time: string;
  ping: number;
};
export default function Home() {
  const url = "google.com";
  const [pingData, setPingData] = useState<PingObject[]>([]);

  useEffect(() => {
    // const intervalId = setInterval(getPingData, 2000);
    const intervalId = setInterval(() => {}, 5000);

    return () => clearInterval(intervalId);
  });

  const getPingData = async () => {
    const len = (await redis.json.arrlen(`ping_data:${url}`))[0];
    if (!len) return;

    const start = Math.max(0, len - 20);

    const data = (await redis.json.get(
      `ping_data:${url}`,
      `$[${start}:]`
    )) as PingObject[];
    console.log(data);

    setPingData(data);
  };
  return (
    <div className="w-full flex-col h-48 flex items-center justify-center gap-10 mt-20">
      <button
        onClick={async () => {
          const res = await fetch("/api/ping");
          console.log(await res.json());
        }}
        className="mt-24"
      >
        PING
      </button>

      <div className="p-4 border border-slate-300 rounded-xl">
        <LineChart
          width={730}
          height={250}
          data={pingData}
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
    </div>
  );
}
