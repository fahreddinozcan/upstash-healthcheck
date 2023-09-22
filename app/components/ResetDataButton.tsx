"use client";

import { Button } from "@/components/ui/button";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: "https://united-lamprey-34660.upstash.io",
  token:
    "AYdkASQgMjg0NTE4OGUtODZkYi00NTE2LWIyNTUtMjE4NDVlNmJmZjY3NWE5YWYxYmEyOTA0NDIxMTk3Y2FjNmQwZTA3ZmUzZjg=",
});

export const ResetDataButton = ({
  sessionToken,
  url,
}: {
  sessionToken: string;
  url: string;
}) => {
  const resetPingData = async () => {
    const res = await redis.json.clear(`ping_data:${sessionToken}:${url}`, "$");
    return res;
  };
  return (
    <Button
      variant={"destructive"}
      onClick={() => {
        resetPingData();
      }}
    >
      Reset
    </Button>
  );
};
