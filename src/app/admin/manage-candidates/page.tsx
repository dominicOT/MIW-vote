import CandidateManagementForm from "@/components/CandidateManagementForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Manage Candidates | VoteVerify",
  description: "Add and view candidates for the voting event.",
};

export default function AdminManageCandidatesPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <CandidateManagementForm />
    </div>
  );
}
