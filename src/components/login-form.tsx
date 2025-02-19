"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { userLoginAction } from "@/actions/login.action";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long.",
  }),
  id: z.string().min(1, {
    message: "The ID is required",
  }),
});

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      id: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      setError(''); // Clear previous errors
  
      const login = await userLoginAction(values);
  
      if (login.error) {
        setError(login.error);
        return;
      }
  
      if (!login.user?.role) {
        setError('Invalid user role');
        return;
      }
  
      // Show success feedback before redirect
      toast({
        title: "Login Successful",
        description: `Welcome back, ${login.user.name}!`,
      });
  
      console.log(login)

      // Redirect with error handling
      try {
        router.push(`/${login.user.role.toLowerCase()}`);
      } catch (redirectError) {
        console.error("Redirect failed:", redirectError);
        setError("Failed to redirect after login");
      }
      
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred during login");
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Id</FormLabel>
              <FormControl>
                <Input placeholder="Enter your id" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>
      {/* <div className="mt-4 text-center"> */}
      {/* <Button variant="link" className="text-sm text-primary"> */}
      {/* Forgot password? */}
      {/* </Button> */}
      {/* </div> */}

      {error && <span className="text-red-500">{error}</span>}
    </Form>
  );
}
