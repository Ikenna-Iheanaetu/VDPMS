/* eslint-disable react/no-unescaped-entities */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  patientId: z.string().regex(/^VUG\/PAT\/\d{2}\/\d{4}$/, {
    message: "Patient ID must be in the format VUG/PAT/XX/XXXX",
  }),
  room: z.string().min(1, {
    message: "Room number is required.",
  }),
  condition: z.enum(["Stable", "Critical", "Emergency"]),
  issue: z.string().min(5, {
    message: "Please provide a brief description of the patient's condition.",
  }),
});

export default function AddPatientForm({
  onAddPatient,
}: {
  onAddPatient: (patient: z.infer<typeof formSchema>) => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      room: "",
      condition: "Emergency",
      issue: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddPatient(values);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Patient ID</FormLabel>
              <FormControl>
                <Input placeholder="VUG/PAT/25/0111" {...field} />
              </FormControl>
              <FormDescription>
                Enter the patient's ID in the format VUG/PAT/XX/XXXX.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="room"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Number</FormLabel>
              <FormControl>
                <Input placeholder="101" {...field} />
              </FormControl>
              <FormDescription>Enter the assigned room number.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condition</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient condition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Stable">Stable</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Select the patient's current condition.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="issue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Patient's Issue</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Briefly describe the patient's condition or reason for admission"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide a short description of the patient's condition or reason
                for emergency admission.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Add Patient</Button>
      </form>
    </Form>
  );
}
