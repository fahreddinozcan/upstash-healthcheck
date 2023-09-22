import { Redis } from "@upstash/redis";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Chart } from "./Chart";
import { Toaster } from "@/components/ui/toaster";
import { EditDialog } from "./EditDialog";
import { SendPingButton } from "./SendPingButtton";
import { ResetDataButton } from "./ResetDataButton";
import { cookies } from "next/headers";
import { setCookie } from "./Cookies";

const redis = new Redis({
  url: "https://united-lamprey-34660.upstash.io",
  token:
    "AYdkASQgMjg0NTE4OGUtODZkYi00NTE2LWIyNTUtMjE4NDVlNmJmZjY3NWE5YWYxYmEyOTA0NDIxMTk3Y2FjNmQwZTA3ZmUzZjg=",
});

export async function getSessionToken() {
  const cookieStore = cookies();

  let sessionTokenData = cookieStore.get("session_token");

  if (sessionTokenData) {
    let sessionToken = sessionTokenData.value;
    return { sessionToken };
  }

  // let sessionToken = (Date.now() - Math.floor(Math.random() * 100)).toString();

  // setCookie({ token: sessionToken });
  const resCookies = await fetch(
    `https://healthcheck.upstash.app/api/getCookies`
  );
  const data = await resCookies.json();

  return { sessionToken: data };
}

export async function MainCard() {
  // const resCookies = await fetch(
  //   `https://healthcheck.upstash.app/api/getCookies`
  // );
  // const data = await resCookies.json();
  const { sessionToken } = await getSessionToken();

  const sessionData = await redis.hgetall(`session_data:${sessionToken}`);
  // if (!sessionData) {
  //   return "Selam";
  // }

  // const { url, schedule, scheduleId } = sessionData as Record<string, string>;

  const urlData = sessionData?.url as string;
  const scheduleData = sessionData?.schedule as string;
  const scheduleIdData = sessionData?.scheduleId as string;

  return (
    <>
      <Toaster />
      <div className="w-full flex-col flex items-center justify-center gap-10 mt-20">
        <Card className="w-min p-4 mt-5">
          <CardHeader>
            <CardTitle>Health Check</CardTitle>

            <Description
              url={urlData}
              cron={scheduleData}
              scheduleId={scheduleIdData}
            />
          </CardHeader>
          <CardContent>
            <Chart
              url={urlData}
              scheduleId={scheduleIdData}
              sessionToken={sessionToken}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <div className="flex justify-between w-min gap-2">
              {sessionToken && scheduleIdData ? (
                <>
                  <SendPingButton sessionToken={sessionToken} url={urlData} />
                  <EditDialog
                    sessionToken={sessionToken}
                    url={urlData}
                    schedule={scheduleData}
                    create={false}
                  />
                  <ResetDataButton url={urlData} sessionToken={sessionToken} />
                </>
              ) : (
                <EditDialog
                  url={urlData}
                  schedule={scheduleData}
                  sessionToken={sessionToken}
                  create={true}
                />
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

function Description({
  url,
  cron,
  scheduleId,
}: {
  url?: string;
  cron?: string;
  scheduleId?: string;
}) {
  const schedules: Record<string, string> = {
    "* * * * *": "every minute",
    "*/5 * * * *": "every 5 minutes",
    "*/10 * * * *": "every 10 minutes",
    "*/15 * * * *": "every 15 minutes",
    "*/30 * * * *": "every 30 minutes",
    "0 * * * *": "every hour",
  };
  return (
    <>
      <CardDescription>
        {scheduleId && url && cron ? (
          <>
            Currently making healthcheck for{" "}
            <span className="font-bold">{url}</span> with the schedule of{" "}
            <span className="font-bold">
              {schedules[cron]} ({cron})
            </span>
          </>
        ) : (
          <>
            This is an API healthcheck example created by Upstash using QStash,
            Redis and Next.js. Create a schedule to start.
          </>
        )}
      </CardDescription>
    </>
  );
}
