import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import type { CreateScheduleRequest } from "@upstash/qstash";

const token =
  "eyJVc2VySUQiOiJmOTAzN2EwNS1jYWE2LTRhZjctYTVhOS1jNWM1NWZkY2UyMGMiLCJQYXNzd29yZCI6IjFhMTg1NmNkOGFlYjQ2YWZiMmRmOWJhNzQ1ODMxNTIxIn0=";

const redis_url = process.env.UPSTASH_REDIS_REST_URL;
const redis_token = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = new Redis({
  url: redis_url as string,
  token: redis_token as string,
});
const listSchedules = async () => {
  const res = await fetch("https://qstash.upstash.io/v2/schedules", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const schedules = await res.json();
  return schedules;
};

const removeSchedule = async (scheduleId: string) => {
  const res = await fetch(
    `https://qstash.upstash.io/v2/schedules/${scheduleId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res;
};

const getSchedule = async (scheduleId: string) => {
  const res = await fetch(
    `https://qstash.upstash.io/v2/schedules/${scheduleId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const schedule = await res.json();
  return schedule;
};

const createSchedule = async (
  schedule: CreateScheduleRequest,
  sessionToken: string
) => {
  // console.log({ url: schedule.destination });
  const res = await fetch(
    `https://qstash.upstash.io/v2/schedules/https://healthcheck.upstash.app/edge/ping`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Upstash-Cron": schedule.cron,
      },
      body: JSON.stringify({
        url: schedule.destination,
        sessionToken: sessionToken,
      }),
    }
  );

  const createdScheduleId = await res.json();

  return createdScheduleId;
};
export async function POST(request: NextRequest) {
  //get the body of the post request
  const body = await request.json();
  const { sessionToken, create } = body;
  // console.log(body);

  // if (!currentScheduleId) return NextResponse.json("NO");

  if (!create) {
    const currentScheduleId = (await redis.hget(
      `session_data:${sessionToken}`,
      "scheduleId"
    )) as string;
    const lastSchedule = await getSchedule(currentScheduleId);
    // console.log(currentScheduleId);
    // console.log(lastSchedule);

    await removeSchedule(lastSchedule.scheduleId);
  }

  // const removedSchedule = await removeSchedule(lastSchedule.scheduleId);
  const newSchedule = await createSchedule(body, sessionToken);
  // console.log(`NEW SCHEDULE: `, newSchedule);
  await redis.hset(`session_data:${sessionToken}`, {
    scheduleId: newSchedule.scheduleId,
    url: body.destination,
    schedule: body.cron,
  });

  const finalSchedules = await listSchedules();
  // console.log(finalSchedules);
  return NextResponse.json({ finalSchedules });
}
