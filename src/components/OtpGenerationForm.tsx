"use client";

import { useState, useEffect } from "react";
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateOtp } from "@/lib/actions/otp.actions";
import { Ticket, CheckCircle, Copy, RefreshCw, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

const OtpGenerationSchema = z.object({
  votesAllowed: z.coerce.number().min(1, "Votes allowed must be at least 1."),
  voterName: z.string().optional(),
});

type OtpGenerationFormValues = z.infer<typeof OtpGenerationSchema>;

export default function OtpGenerationForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [generatedVotes, setGeneratedVotes] = useState<number | null>(null);
  const searchParams = useSearchParams();

  const form = useForm<OtpGenerationFormValues>({
    resolver: zodResolver(OtpGenerationSchema),
    defaultValues: {
      votesAllowed: 1,
      voterName: "",
    }
  });

  useEffect(() => {
    const votesFromQuery = searchParams.get("votes");
    const voterFromQuery = searchParams.get("voter");
    if (votesFromQuery) {
      form.setValue("votesAllowed", parseInt(votesFromQuery, 100) || 1);
    }
    if (voterFromQuery) {
      form.setValue("voterName", voterFromQuery);
    }
  }, [searchParams, form]);

  const { control } = form;
  const { errors } = useFormState({ control });

  const onSubmit = async (data: OtpGenerationFormValues) => {
    setIsLoading(true);
    setGeneratedOtp(null);
    setGeneratedVotes(null);
    const formData = new FormData();
    formData.append("votesAllowed", data.votesAllowed.toString());

    const result = await generateOtp(formData);
    if (result.success && result.otp) {
      setGeneratedOtp(result.otp);
      setGeneratedVotes(result.votesAllowed);
      toast({
        title: "OTP Generated Successfully!",
        description: `OTP: ${result.otp} for ${result.votesAllowed} votes.`,
        variant: "default",
        className: "bg-accent text-accent-foreground"
      });
    } else {
      const errorMsg = typeof result.error === 'string' ? result.error : result.error?.votesAllowed?.join(", ") || "Failed to generate OTP.";
      toast({
        title: "OTP Generation Failed",
        description: errorMsg,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const copyOtp = () => {
    if (generatedOtp) {
      navigator.clipboard.writeText(generatedOtp);
      toast({ title: "OTP Copied!", description: "OTP has been copied to clipboard.", variant: "default" });
    }
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center"><Ticket className="mr-2 h-7 w-7 text-primary" /> Generate OTP</CardTitle>
        <CardDescription>Create a One-Time Password for a voter with a specific number of votes.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
           {form.getValues("voterName") && (
            <div className="p-3 bg-primary/10 rounded-md">
              <p className="text-sm text-primary font-medium">Generating OTP for: <span className="font-bold">{form.getValues("voterName")}</span></p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="votesAllowed" className="text-base">Number of Votes Allowed</Label>
            <Input id="votesAllowed" type="number" {...form.register("votesAllowed")} className="text-base h-11" />
            {errors.votesAllowed && <p className="text-sm text-destructive">{errors.votesAllowed.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex-col space-y-4">
          <Button type="submit" disabled={isLoading} className="w-full text-lg py-6">
            {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</> : <><RefreshCw className="mr-2 h-5 w-5" /> Generate OTP</>}
          </Button>

          {generatedOtp && generatedVotes && (
            <div className="w-full p-4 border rounded-md bg-muted/50 text-center space-y-3">
              <p className="text-sm text-muted-foreground">OTP Generated:</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-3xl font-bold text-primary tracking-widest">{generatedOtp}</p>
                <Button variant="ghost" size="icon" onClick={copyOtp} aria-label="Copy OTP">
                  <Copy className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Allows <span className="font-semibold">{generatedVotes}</span> vote(s). Expires in 15 minutes.</p>
              <CheckCircle className="h-6 w-6 text-accent mx-auto" />
            </div>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
