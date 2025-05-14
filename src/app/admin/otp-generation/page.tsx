import OtpGenerationForm from "@/components/OtpGenerationForm";
import { Suspense } from 'react';
// import OtpGenerationForm from './OtpGenerationForm'; // Adjust the path if needed
import { Loader2 } from "lucide-react";

export default function AdminOtpGenerationPage() {
  return (
    <div>
      <h1>OTP Generation</h1>
      <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="mr-2 h-10 w-10 animate-spin" /> Loading...</div>}>
        <OtpGenerationForm />
      </Suspense>
    </div>
  );
}
