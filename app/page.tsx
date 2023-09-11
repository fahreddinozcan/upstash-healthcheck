"use client";

import Image from "next/image";

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

import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useState, useEffect, Suspense } from "react";
import { Redis } from "@upstash/redis";
import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { CreateScheduleRequest } from "@upstash/qstash";
import { cookies } from "next/headers";
import { Chart } from "./components/Chart";
import { EditForm } from "./components/EditForm";
import { Spinner } from "./components/Spinner";

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
  // const cookieStore = cookies();
  // const sessionId = cookieStore.get("token");

  // console.log(`Session ID: ${sessionId}`);
  const [url, setUrl] = useState("********");
  const [schedule, setSchedule] = useState("* * * * *");
  const [scheduleId, setScheduleId] = useState("");
  const [pingData, setPingData] = useState<PingObject[]>([]);
  const [buttonsLoading, setButtonsLoading] = useState(true);

  const [sessionToken, setSessionToken] = useState("");

  const { toast } = useToast();
  useEffect(() => {
    const intervalId = setInterval(getPingData, 4000);

    return () => clearInterval(intervalId);
  });

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/getCookies");
      const data = await res.json();
      const { sessionToken } = data;
      setSessionToken(sessionToken);

      // console.log(data);
      const sessionData = await redis.hgetall(`session_data:${sessionToken}`);
      // console.log(sessionData);
      // const {url} = sessionData;
      if (!sessionData) {
        setButtonsLoading(false);
        return;
      }
      const { url, schedule, scheduleId } = sessionData as Record<
        string,
        string
      >;

      if (url) {
        setUrl(url);
      }
      if (schedule) {
        setSchedule(schedule);
      }
      if (scheduleId) {
        setScheduleId(scheduleId);
      }
      setButtonsLoading(false);
    })();
  }, []);

  const getPingData = async () => {
    if (!scheduleId) return;
    // console.log("HERE");
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

  const resetPingData = async () => {
    const res = await redis.json.clear(`ping_data:${sessionToken}:${url}`, "$");
    setPingData([]);
    return res;
  };

  const handleSubmit = async (
    scheduleRequest: CreateScheduleRequest,
    create: boolean
  ) => {
    const res = await fetch("/api/updateSchedule", {
      method: "POST",
      body: JSON.stringify({ ...scheduleRequest, sessionToken, create }),
    });
    if (url !== scheduleRequest.destination || create) {
      console.log("URL CHANGED", sessionToken, scheduleRequest.destination);
      await redis.json.set(
        `ping_data:${sessionToken}:${scheduleRequest.destination}`,
        "$",
        []
      );
    }

    await redis.hset(`session_data:${sessionToken}`, {
      url: scheduleRequest.destination,
    });
    // console.log(await res.json());
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

  function onSubmitEdit(data: zod.infer<typeof formSchema>) {
    // console.log(data);
    handleSubmit(
      {
        destination: data.url,
        cron: data.schedule,
      },
      false
    );

    if (data.url !== url) {
      setUrl(data.url);
      redis.hset(`session_data:${sessionToken}`, { url: data.url });
      resetPingData();
    }
    if (data.schedule !== schedule) {
      setSchedule(data.schedule);
      redis.hset(`session_data:${sessionToken}`, { schedule: data.schedule });
    }
    toast({
      title: "Success!",
      description: "Your healthcheck has been updated.",
    });
  }

  function onSubmitCreate(data: zod.infer<typeof formSchema>) {
    // console.log(data);
    handleSubmit(
      {
        destination: data.url,
        cron: data.schedule,
      },
      true
    );
    toast({
      title: "Success!",
      description: "Your healthcheck has been updated.",
    });

    setTimeout(() => {
      window.location.reload();
    }, 3000);
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
            <Chart data={pingData} />
          </CardContent>
          <CardFooter className="flex justify-end">
            <div className="flex justify-between w-min gap-2">
              {buttonsLoading ? (
                <div className="w-full flex items-center justify-center">
                  <Spinner />
                </div>
              ) : sessionToken && scheduleId ? (
                <>
                  <Button
                    variant={"default"}
                    onClick={async () => {
                      const data = await fetch("/api/ping", {
                        method: "POST",
                        body: JSON.stringify({ url, sessionToken }),
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
                      <EditForm
                        onSubmit={onSubmitEdit}
                        url={url}
                        schedule={schedule}
                        form={form}
                        isValid={form.formState.isValid}
                        create={false}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant={"destructive"}
                    onClick={() => {
                      const data = resetPingData();
                      // console.log(data);
                    }}
                  >
                    Reset
                  </Button>
                </>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="default" className="whitespace-nowrap">
                      Create Schedule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create Healthcheck</DialogTitle>
                      <DialogDescription>
                        Create your healthcheck schedule here. Click create when
                        youre done.
                      </DialogDescription>
                    </DialogHeader>
                    <EditForm
                      onSubmit={onSubmitCreate}
                      url={url}
                      schedule={schedule}
                      form={form}
                      isValid={form.formState.isValid}
                      create={true}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

function Description({ url, cron }: { url: string; cron: string }) {
  const schedules: Record<string, string> = {
    "* * * * *": "every minute",
    "*/5 * * * *": "every 5 minutes",
    "*/10 * * * *": "every 10 minutes",
    "*/15 * * * *": "every 15 minutes",
    "*/30 * * * *": "every 30 minutes",
    "0 * * * *": "every hour",
  };
  return (
    <CardDescription>
      Currently making healthcheck for <span className="font-bold">{url}</span>{" "}
      with the schedule of{" "}
      <span className="font-bold">
        {schedules[cron]} ({cron})
      </span>
    </CardDescription>
  );
}
