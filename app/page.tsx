import { Toaster } from "@/components/ui/toaster";
import { Redis } from "@upstash/redis";
import { MainCard } from "./components/MainCard";

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
  return (
    <>
      <Toaster />
      <div className="w-full flex-col flex items-center justify-center gap-10 mt-20">
        <MainCard />
      </div>
    </>
  );
}
