"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useRouter } from "next/navigation";

import { Redis } from "@upstash/redis";
import { Button } from "@/components/ui/button";
import { EditForm } from "./EditForm";
import { useToast } from "@/components/ui/use-toast";
import * as zod from "zod";
import { CreateScheduleRequest } from "@upstash/qstash";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const redis = new Redis({
  url: "https://united-lamprey-34660.upstash.io",
  token:
    "AYdkASQgMjg0NTE4OGUtODZkYi00NTE2LWIyNTUtMjE4NDVlNmJmZjY3NWE5YWYxYmEyOTA0NDIxMTk3Y2FjNmQwZTA3ZmUzZjg=",
});

export const EditDialog = ({
  sessionToken,
  url,
  schedule,
  create,
}: {
  sessionToken: string;
  url: string;
  schedule: string;
  create: boolean;
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const handleSubmit = async (
    scheduleRequest: CreateScheduleRequest,
    create: boolean
  ) => {
    await fetch("/api/updateSchedule", {
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
    // if (typeof window !== "undefined") {
    //   window.location.reload();
    // }
    router.refresh();
  };

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
      redis.hset(`session_data:${sessionToken}`, { url: data.url });
      // resetPingData();
    }
    if (data.schedule !== schedule) {
      redis.hset(`session_data:${sessionToken}`, { schedule: data.schedule });
    }
    toast({
      title: "Success!",
      description: "Your healthcheck has been updated.",
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={create ? "default" : "outline"}
          className="whitespace-nowrap"
        >
          {create ? "Create Schedule" : "Edit"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Healthcheck</DialogTitle>
          <DialogDescription>
            Make changes to the healthcheck here. Click save when youre done.
          </DialogDescription>
        </DialogHeader>
        <EditForm
          onSubmit={create ? onSubmitCreate : onSubmitEdit}
          url={url}
          schedule={schedule}
          form={form}
          isValid={form.formState.isValid}
          create={create}
        />
      </DialogContent>
    </Dialog>
  );
};
