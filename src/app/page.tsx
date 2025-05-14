"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { verifyOtp } from "@/lib/actions/otp.actions";
import { useState, useEffect } from "react";

const OtpFormSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 characters long." }).regex(/^[a-zA-Z0-9]+$/, { message: "OTP must be alphanumeric." }),
});

export default function OtpVerificationPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  const form = useForm<z.infer<typeof OtpFormSchema>>({
    resolver: zodResolver(OtpFormSchema),
    defaultValues: {
      otp: "",
    },
  });

  async function onSubmit(data: z.infer<typeof OtpFormSchema>) {
    if (!mounted) return; // Prevent submission before client-side hydration
    setIsSubmitting(true);
    try {
      const result = await verifyOtp(data.otp.toUpperCase());
      if (result.success && result.votesAllowed && result.otp) {
        toast({
          title: "OTP Verified!",
          description: "Redirecting to voting page...",
          variant: "default",
        });
        sessionStorage.setItem("voteOtp", JSON.stringify({ otp: result.otp, votesAllowed: result.votesAllowed }));
        router.push("/vote");
      } else {
        toast({
          title: "OTP Verification Failed",
          description: result.error || "An unknown error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <KeyRound className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-3xl">Enter Your OTP</CardTitle>
            <CardDescription>Please enter the One-Time Password sent to you to proceed with voting.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-10 bg-muted rounded"></div>
                <div className="h-10 bg-primary/80 rounded w-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <KeyRound className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl">Enter Your OTP</CardTitle>
          <CardDescription>Please enter the One-Time Password sent to you to proceed with voting.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">One-Time Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter 6-character OTP" 
                        {...field} 
                        className="text-center text-xl tracking-widest h-12"
                        maxLength={6}
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting}>
                <LogIn className="mr-2 h-5 w-5" /> {isSubmitting ? "Verifying..." : "Proceed to Vote"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
