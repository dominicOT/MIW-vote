import OtpGenerationForm from "@/components/OtpGenerationForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - OTP Generation | VoteVerify",
  description: "Generate One-Time Passwords for voters.",
};

export default function AdminOtpGenerationPage() {
  return (
    <div className="max-w-md mx-auto">
      <OtpGenerationForm />
    </div>
  );
}
