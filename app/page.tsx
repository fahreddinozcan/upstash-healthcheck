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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Redis } from "@upstash/redis";
import { SelectGroup } from "@radix-ui/react-select";

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
  const [url, setUrl] = useState("google.com");

  const [pingData, setPingData] = useState<PingObject[]>([]);

  useEffect(() => {
    const intervalId = setInterval(getPingData, 4000);
    // const intervalId = setInterval(() => {}, 5000);

    return () => clearInterval(intervalId);
  });

  const getPingData = async () => {
    const len = (await redis.json.arrlen(`ping_data:${url}`))[0];
    if (!len) {
      setPingData([]);
      return;
    }

    const start = Math.max(0, len - 20);

    const data = (await redis.json.get(
      `ping_data:${url}`,
      `$[${start}:]`
    )) as PingObject[];
    console.log(data);

    setPingData(data);
  };

  const resetPingData = async () => {
    const res = await redis.json.clear(`ping_data:${url}`, "$");
    return res;
  };
  return (
    <div className="w-full flex-col flex items-center justify-center gap-10 mt-20">
      <Card className="w-min p-4 mt-5">
        <CardHeader>
          <CardTitle>Health Check</CardTitle>
          <CardDescription>
            Currently making healthcheck for{" "}
            <span className="font-bold">{url}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-4">
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
        </CardContent>
        <CardFooter className="flex justify-end">
          <div className="flex justify-between w-min gap-2">
            <Button
              variant={"default"}
              onClick={async () => {
                const data = await fetch("/api/ping", { method: "POST" });
                console.log(data);
              }}
              className="whitespace-nowrap"
            >
              Send Ping
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Edit</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Healthcheck</DialogTitle>
                  <DialogDescription>
                    Make changes to the healthcheck here. Click save when youre
                    done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="url" className="text-right">
                      URL
                    </Label>
                    <Input id="name" value={url} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center justify-start gap-4 w-full">
                    <Label htmlFor="username" className="text-right">
                      Schedule
                    </Label>

                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Every * * * * *" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="1-minute">every minute</SelectItem>
                          <SelectItem value="5-minute">
                            every 5 minutes
                          </SelectItem>
                          <SelectItem value="10-minute">
                            every 10 minutes
                          </SelectItem>
                          <SelectItem value="30-minute">
                            every 30 minutes
                          </SelectItem>
                          <SelectItem value="60-minute">every hour</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              variant={"destructive"}
              onClick={() => {
                const data = resetPingData();
                console.log(data);
              }}
            >
              Reset
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
