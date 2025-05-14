"use client";

import { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { addCandidate, getCandidates } from "@/lib/actions/candidate.actions";
import type { Candidate } from "@/lib/types";
import { UserPlus, ListChecks, Users, Loader2 } from "lucide-react";

const CandidateSchema = z.object({
  name: z.string().min(2, "Candidate name must be at least 2 characters."),
});

type CandidateFormValues = z.infer<typeof CandidateSchema>;

export default function CandidateManagementForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);

  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(CandidateSchema),
    defaultValues: { name: "" },
  });

  const fetchCandidates = async () => {
    setIsLoadingCandidates(true);
    const result = await getCandidates();
    if (result.success) {
      setCandidates(result.candidates);
    } else {
      toast({ title: "Error", description: "Failed to load candidates.", variant: "destructive" });
    }
    setIsLoadingCandidates(false);
  };

  useEffect(() => {
    fetchCandidates();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: CandidateFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", data.name);
      const result = await addCandidate(formData);
      if (result.success) {
        toast({
          title: "Candidate Added!",
          description: `${result.name} has been added to the list.`,
          variant: "default",
          className: "bg-accent text-accent-foreground"
        });
        form.reset();
        fetchCandidates(); // Refresh list
      } else {
        const errorMsg = typeof result.error === 'string' ? result.error : result.error?.name?.join(", ") || "Failed to add candidate.";
        toast({
          title: "Failed to Add Candidate",
          description: errorMsg,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="space-y-8">
      <Card className="w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><UserPlus className="mr-2 h-7 w-7 text-primary" /> Add New Candidate</CardTitle>
          <CardDescription>Enter the name of the candidate to add them to the voting list.</CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-2">
            <Label htmlFor="name" className="text-base">Candidate Name</Label>
            <Input id="name" {...form.register("name")} placeholder="Enter candidate's full name" className="text-base h-11" />
            {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending} className="text-lg py-3 w-full sm:w-auto">
              {isPending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Adding...</> : "Add Candidate"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><ListChecks className="mr-2 h-7 w-7 text-primary" /> Current Candidates</CardTitle>
          <CardDescription>List of all candidates currently in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingCandidates ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading candidates...</p>
            </div>
          ) : candidates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Current Votes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate, index) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{candidate.name}</TableCell>
                    <TableCell className="text-right font-semibold text-primary">{candidate.voteCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2" />
              <p>No candidates have been added yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
