"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Candidate } from "@/lib/types";
import { getCandidates } from "@/lib/actions/candidate.actions";
import { castVote } from "@/lib/actions/vote.actions";
import { Vote, UserCheck, ChevronRight } from "lucide-react";

// Define schema dynamically based on votesAllowed
const createVoteFormSchema = (maxVotes: number) => z.object({
  votesToCast: z.coerce.number()
    .min(1, "You must cast at least 1 vote.")
    .max(maxVotes, `You can cast a maximum of ${maxVotes} votes.`),
  candidateId: z.string().min(1, "Please select a candidate."),
});

type VoteFormValues = z.infer<ReturnType<typeof createVoteFormSchema>>;

export default function VotingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpDetails, setOtpDetails] = useState<{ otp: string; votesAllowed: number } | null>(null);

  useEffect(() => {
    const storedOtpDetails = sessionStorage.getItem("voteOtp");
    if (storedOtpDetails) {
      const parsedDetails = JSON.parse(storedOtpDetails);
      setOtpDetails(parsedDetails);
    } else {
      toast({ title: "Access Denied", description: "No valid OTP found. Redirecting...", variant: "destructive" });
      router.replace("/");
    }
  }, [router, toast]);

  useEffect(() => {
    async function fetchCandidates() {
      const result = await getCandidates();
      if (result.success) {
        setCandidates(result.candidates);
      } else {
        toast({ title: "Error", description: "Failed to load candidates.", variant: "destructive" });
      }
      setIsLoading(false);
    }
    if (otpDetails) { // Only fetch candidates if OTP details are present
        fetchCandidates();
    }
  }, [toast, otpDetails]);
  
  const voteFormSchema = otpDetails ? createVoteFormSchema(otpDetails.votesAllowed) : createVoteFormSchema(1) ; // Default schema if otpDetails not yet loaded

  const form = useForm<VoteFormValues>({
    resolver: zodResolver(voteFormSchema),
    defaultValues: {
      votesToCast: 1,
      candidateId: "",
    },
  });

 useEffect(() => {
    // Reset form with new schema when otpDetails changes
    if (otpDetails) {
        form.reset({ votesToCast: 1, candidateId: "" }); // Reset with default values for the new schema
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpDetails, form.reset]);


  async function onSubmit(data: VoteFormValues) {
    if (!otpDetails) {
      toast({ title: "Error", description: "OTP details are missing.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await castVote(otpDetails.otp, data.candidateId, data.votesToCast);
      if (result.success) {
        toast({
          title: "Vote Cast Successfully!",
          description: result.message,
          variant: "default",
          className: "bg-accent text-accent-foreground"
        });
        sessionStorage.removeItem("voteOtp");
        router.push("/result");
      } else {
        const errorMessage = typeof result.error === 'string' ? result.error : "An unknown error occurred.";
        toast({
          title: "Voting Failed",
          description: errorMessage,
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

  if (!otpDetails || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader className="text-center">
             <UserCheck className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-3xl">Cast Your Vote</CardTitle>
            <CardDescription>Loading voting options...</CardDescription>
          </CardHeader>
           <CardContent className="animate-pulse space-y-6">
            <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-10 bg-muted rounded"></div>
            </div>
            <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-10 bg-muted rounded"></div>
            </div>
            <div className="h-12 bg-primary/80 rounded w-full"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <UserCheck className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl">Cast Your Vote</CardTitle>
          <CardDescription>You have <span className="font-bold text-primary">{otpDetails.votesAllowed}</span> vote(s) available with this OTP.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="votesToCast"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Number of Votes</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter number of votes" {...field} className="h-12 text-lg" min={1} max={otpDetails.votesAllowed} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="candidateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Select Candidate</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 text-lg">
                          <SelectValue placeholder="Choose a candidate to vote for" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {candidates.map((candidate) => (
                          <SelectItem key={candidate.id} value={candidate.id} className="text-lg">
                            {candidate.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting || isLoading}>
                <Vote className="mr-2 h-5 w-5" /> {isSubmitting ? "Casting Vote..." : "Cast Vote"} <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
