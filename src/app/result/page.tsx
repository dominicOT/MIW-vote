import VoteResultsDisplay from "@/components/VoteResultsDisplay";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Vote Results | VoteVerify",
  description: "View the current voting results and statistics.",
};

export default function AdminResultsPage() {
  return (
    <VoteResultsDisplay />
  );
}
