"use client";

import { useEffect, useState } from "react";
import type { Candidate } from "@/lib/types";
import { getVoteResults } from "@/lib/actions/vote.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Users, Vote, Loader2 } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

interface VoteResultData {
  candidates: Candidate[];
  totalVotesCast: number;
}

const chartConfig = {
  votes: {
    label: "Votes",
    color: "hsl(var(--primary))",
  },
} satisfies import("@/components/ui/chart").ChartConfig;


export default function VoteResultsDisplay() {
  const [results, setResults] = useState<VoteResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchResults() {
      setIsLoading(true);
      const response = await getVoteResults();
      if (response.success) {
        setResults({ candidates: response.candidates, totalVotesCast: response.totalVotesCast });
      } else {
        toast({ title: "Error", description: "Failed to load vote results.", variant: "destructive" });
      }
      setIsLoading(false);
    }
    fetchResults();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-lg">Loading results...</p>
      </div>
    );
  }

  if (!results || results.candidates.length === 0) {
    return (
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><BarChart3 className="mr-2 h-7 w-7 text-primary" /> Vote Results</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">No voting data available yet.</p>
          <p className="text-sm text-muted-foreground">Results will appear here once votes are cast.</p>
        </CardContent>
      </Card>
    );
  }
  
  const chartData = results.candidates
    .map(c => ({ name: c.name, votes: c.voteCount }))
    .sort((a,b) => b.votes - a.votes) // Sort for better chart display
    .slice(0,10); // Display top 10 for chart brevity

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center"><Vote className="mr-3 h-8 w-8 text-primary" />Overall Voting Summary</CardTitle>
          <CardDescription>Total votes cast in the event.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-5xl font-bold text-primary">{results.totalVotesCast}</p>
          <p className="text-muted-foreground">Total Votes Recorded</p>
        </CardContent>
      </Card>

      {results.candidates.length > 0 && (
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center"><BarChart3 className="mr-2 h-7 w-7 text-primary" /> Candidate Leaderboard</CardTitle>
            <CardDescription>Vote distribution among candidates.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} cursorStyle={{ fill: 'hsl(var(--muted))' }} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="votes" fill="var(--color-votes)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><Users className="mr-2 h-7 w-7 text-primary" /> Detailed Vote Counts</CardTitle>
          <CardDescription>Individual vote counts for all candidates.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Rank</TableHead>
                <TableHead>Candidate Name</TableHead>
                <TableHead className="text-right">Votes Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.candidates.sort((a, b) => b.voteCount - a.voteCount).map((candidate, index) => (
                <TableRow key={candidate.id} className={index < 3 ? "bg-primary/5" : ""}>
                  <TableCell className="font-medium text-lg">{index + 1}</TableCell>
                  <TableCell className="text-lg">{candidate.name}</TableCell>
                  <TableCell className="text-right font-bold text-xl text-primary">{candidate.voteCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
