import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import type { CreateScheduleRequest } from "@upstash/qstash";

const token =
  "eyJVc2VySUQiOiJmOTAzN2EwNS1jYWE2LTRhZjctYTVhOS1jNWM1NWZkY2UyMGMiLCJQYXNzd29yZCI6IjFhMTg1NmNkOGFlYjQ2YWZiMmRmOWJhNzQ1ODMxNTIxIn0=";

const redis = new Redis({
  url: "https://united-lamprey-34660.upstash.io",
  token:
    "AYdkASQgMjg0NTE4OGUtODZkYi00NTE2LWIyNTUtMjE4NDVlNmJmZjY3NWE5YWYxYmEyOTA0NDIxMTk3Y2FjNmQwZTA3ZmUzZjg=",
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

const createSchedule = async (schedule: CreateScheduleRequest) => {
  const res = await fetch(
    `https://qstash.upstash.io/v2/schedules/https://healthcheck.upstash.app/edge/ping`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Upstash-Cron": "* * * * *",
      },
      body: JSON.stringify({ url: schedule.destination }),
    }
  );

  const createdScheduleId = await res.json();

  return createdScheduleId;
};
export async function POST(request: NextRequest) {
  //get the body of the post request
  const body = await request.json();
  console.log(body);
  const currentScheduleId = (await redis.get("current_schedule_id")) as string;

  if (!currentScheduleId) return NextResponse.json("NO");

  const lastSchedule = await getSchedule(currentScheduleId);
  console.log(currentScheduleId);
  console.log(lastSchedule);

  await removeSchedule(lastSchedule.scheduleId);

  // const removedSchedule = await removeSchedule(lastSchedule.scheduleId);
  const newSchedule = await createSchedule(body);
  console.log(`NEW SCHEDULE: `, newSchedule);
  await redis.set("current_schedule_id", newSchedule.scheduleId);

  const finalSchedules = await listSchedules();
  console.log(finalSchedules);
  return NextResponse.json({ finalSchedules });
}
