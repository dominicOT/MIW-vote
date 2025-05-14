"use server";

import { db } from "@/lib/firebase/config";
import type { FirestoreOtpDoc } from "@/lib/types";
import { doc, setDoc, getDoc, Timestamp, serverTimestamp } from "firebase/firestore";
import { z } from "zod";

const GenerateOtpSchema = z.object({
  votesAllowed: z.number().min(1, "Votes allowed must be at least 1."),
});

export async function generateOtp(formData: FormData) {
  try {
    const parsed = GenerateOtpSchema.safeParse({
      votesAllowed: Number(formData.get("votesAllowed")),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten().fieldErrors };
    }

    const { votesAllowed } = parsed.data;
    const otp = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6-char alphanumeric OTP
    const now = Timestamp.now();
    const expiresAt = new Timestamp(now.seconds + 15 * 60, now.nanoseconds); // 15 minutes expiry

    const otpData: FirestoreOtpDoc = {
      createdAt: serverTimestamp() as Timestamp, // Firestore will set this on write
      expiresAt,
      votesAllowed,
      isUsed: false,
    };

    await setDoc(doc(db, "otps", otp), otpData);

    return { success: true, otp, votesAllowed };
  } catch (error) {
    console.error("Error generating OTP:", error);
    return { success: false, error: "Failed to generate OTP. Please try again." };
  }
}

const VerifyOtpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 characters long."),
});

export async function verifyOtp(otpValue: string): Promise<{ success: boolean; error?: string; votesAllowed?: number, otp?: string }> {
  try {
    const parsed = VerifyOtpSchema.safeParse({ otp: otpValue });
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten().fieldErrors.otp?.join(", ") || "Invalid OTP format." };
    }

    const otpDocRef = doc(db, "otps", parsed.data.otp);
    const otpDocSnap = await getDoc(otpDocRef);

    if (!otpDocSnap.exists()) {
      return { success: false, error: "Invalid OTP." };
    }

    const otpData = otpDocSnap.data() as FirestoreOtpDoc;

    if (otpData.isUsed) {
      return { success: false, error: "OTP has already been used." };
    }

    if (Timestamp.now().seconds > otpData.expiresAt.seconds) {
      return { success: false, error: "OTP has expired." };
    }

    return { success: true, votesAllowed: otpData.votesAllowed, otp: parsed.data.otp };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { success: false, error: "Failed to verify OTP. Please try again." };
  }
}
