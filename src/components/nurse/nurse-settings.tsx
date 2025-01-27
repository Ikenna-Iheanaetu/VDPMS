"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import getCookieForClient from "@/actions/get-cookie-for-client.action";
import { getNurseSettings, updateNurseSettings } from "@/actions/nurse/settings.action";

const nurseSettingsSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  nurseId: z.string().min(5, {
    message: "Nurse ID must be at least 5 characters.",
  }),
  //   department: z.string({
  //     required_error: "Please select a department.",
  //   }),
  shift: z.string({
    required_error: "Please select a shift.",
  }),
  bio: z.string().max(160).min(4),
  //   notifications: z.boolean().default(false),
  //   theme: z.enum(["light", "dark", "system"]),
});

type NurseSettingsValues = z.infer<typeof nurseSettingsSchema>;

const defaultValues: Partial<NurseSettingsValues> = {
  name: "",
  email: "",
  nurseId: "",
  //   department: "General",
  shift: "Day",
  bio: "",
  //   notifications: true,
  //   theme: "system",
};

export default function NurseSettings() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const form = useForm<NurseSettingsValues>({
    resolver: zodResolver(nurseSettingsSchema),
    defaultValues,
  });

  useEffect(() => {
    const initializeForm = async () => {
      try {
        const { data: cookieData } = await getCookieForClient();
        if (!cookieData?.userId) throw new Error("User not authenticated");

        const result = await getNurseSettings(cookieData.userId);
        
        if (result.success && result.data) {
          form.reset(result.data);
        } else {
          throw new Error(result.error || "Failed to load settings");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load settings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeForm();
  }, [toast, form])

  async function onSubmit(data: NurseSettingsValues) {
    setIsLoading(true);
    try {
      const { data: cookieData } = await getCookieForClient();
      if (!cookieData?.userId) throw new Error("User not authenticated");

      const result = await updateNurseSettings(cookieData.userId, data);

      if (result.success) {
        toast({
          title: "Settings Updated",
          description: "Your profile settings have been successfully updated.",
        });
      } else {
        throw new Error(result.error || "Failed to update settings");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nurse Profile Settings</CardTitle>
        <CardDescription>
          Manage your account settings and preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the name that will be displayed on your profile.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Your email address" {...field} />
                  </FormControl>
                  <FormDescription>
                    This email will be used for account-related notifications.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nurseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nurse ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Your nurse ID" {...field} readOnly />
                  </FormControl>
                  <FormDescription>
                    Your unique identification number in the hospital system.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* This feature would come in the future */}
            {/* <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                      <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="Surgery">Surgery</SelectItem>
                      <SelectItem value="Oncology">Oncology</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>The department you primarily work in.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <FormField
              control={form.control}
              name="shift"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shift</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your shift" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Day">Day</SelectItem>
                      <SelectItem value="Night">Night</SelectItem>
                      <SelectItem value="Rotating">Rotating</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Your primary work shift.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little about yourself"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of your experience and specialties.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* This feature would come in the future */}
            {/* <FormField
              control={form.control}
              name="notifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Notifications</FormLabel>
                    <FormDescription>Receive notifications about new appointments and updates.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a theme" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Select your preferred theme for the dashboard.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Settings"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
