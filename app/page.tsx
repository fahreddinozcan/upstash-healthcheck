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
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Redis } from "@upstash/redis";
import { SelectGroup } from "@radix-ui/react-select";
import { useForm } from "react-hook-form";
import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateScheduleRequest } from "@upstash/qstash";

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
  const [url, setUrl] = useState("********");
  const [schedule, setSchedule] = useState("* * * * *");
  const [pingData, setPingData] = useState<PingObject[]>([]);
  const { toast } = useToast();
  useEffect(() => {
    const intervalId = setInterval(getPingData, 4000);

    return () => clearInterval(intervalId);
  });

  useEffect(() => {
    (async () => {
      const url = (await redis.get("current_ping_url")) as string;
      const schedule = (await redis.get("current_ping_schedule")) as string;

      if (url) {
        setUrl(url);
      }
      if (schedule) {
        setSchedule(schedule);
      }
    })();
  }, []);

  const getPingData = async () => {
    console.log("HERE");
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
    setPingData([]);
    return res;
  };

  const handleSubmit = async (scheduleRequest: CreateScheduleRequest) => {
    const res = await fetch("/api/updateSchedule", {
      method: "POST",
      body: JSON.stringify(scheduleRequest),
    });
    if (url !== scheduleRequest.destination) {
      await redis.json.set(`ping_data:${scheduleRequest.destination}`, "$", []);
    }
    await redis.set("current_ping_url", scheduleRequest.destination);
    console.log(await res.json());
  };
  const formSchema = zod.object({
    url: zod
      .string({ required_error: "Please input an URL." })
      .url({ message: "Please input a valid URL." }),
    schedule: zod.string(),
  });

  const form = useForm<zod.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(data: zod.infer<typeof formSchema>) {
    console.log(data);
    handleSubmit({
      destination: data.url,
      cron: data.schedule,
    });

    if (data.url !== url) {
      setUrl(data.url);
      redis.set("current_ping_url", data.url);
      resetPingData();
    }
    if (data.schedule !== schedule) {
      setSchedule(data.schedule);
      redis.set("current_ping_schedule", data.schedule);
    }
    toast({
      title: "Success!",
      description: "Your healthcheck has been updated.",
    });
  }
  return (
    <>
      <Toaster />
      <div className="w-full flex-col flex items-center justify-center gap-10 mt-20">
        <Card className="w-min p-4 mt-5">
          <CardHeader>
            <CardTitle>Health Check</CardTitle>
            <Description url={url} cron={schedule} />
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
                  console.log({ url });
                  const data = await fetch("/api/ping", {
                    method: "POST",
                    body: JSON.stringify({ url }),
                  });
                  // console.log(data);
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
                      Make changes to the healthcheck here. Click save when
                      youre done.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form
                      className="grid gap-4 py-4"
                      onSubmit={form.handleSubmit(onSubmit)}
                    >
                      <FormField
                        name="url"
                        control={form.control}
                        defaultValue={url}
                        render={({ field }) => {
                          return (
                            <FormItem className="grid grid-cols-4 items-center gap-4">
                              <FormLabel htmlFor="url" className="text-right">
                                URL
                              </FormLabel>
                              <Input
                                id="name"
                                className="col-span-3"
                                {...field}
                              />
                              <FormMessage className="whitespace-nowrap" />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        name="schedule"
                        control={form.control}
                        defaultValue={schedule}
                        render={({ field }) => {
                          return (
                            <FormItem className="grid grid-cols-4 items-center gap-4 w-full">
                              <FormLabel className="text-right">
                                Schedule
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger className="col-span-3">
                                  <SelectValue placeholder="Every * * * * *" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectItem value="* * * * *">
                                      every minute
                                    </SelectItem>
                                    <SelectItem value="*/5 * * * *">
                                      every 5 minutes
                                    </SelectItem>
                                    <SelectItem value="*/10 * * * *">
                                      every 10 minutes
                                    </SelectItem>
                                    <SelectItem value="*/30 * * * *">
                                      every 30 minutes
                                    </SelectItem>
                                    <SelectItem value="0 * * * *">
                                      every hour
                                    </SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <DialogFooter>
                        <DialogTrigger asChild>
                          <Button type="submit">Save</Button>
                        </DialogTrigger>
                      </DialogFooter>
                    </form>
                  </Form>
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
    </>
  );
}

function Description({ url, cron }: { url: string; cron: string }) {
  return (
    <CardDescription>
      Currently making healthcheck for <span className="font-bold">{url}</span>{" "}
      with the cron schedule of <span className="font-bold">{cron}</span>
    </CardDescription>
  );
}
