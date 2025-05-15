"use server";

import { db } from "@/lib/firebase/config";
import type { FirestoreOtpDoc, FirestoreCandidateDoc, FirestoreTotalsDoc } from "@/lib/types";
import { collection, doc, getDoc, getDocs, writeBatch, Timestamp, serverTimestamp } from "firebase/firestore";
import { z } from "zod";

const CastVoteSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 characters."),
  candidateId: z.string().min(1, "Candidate must be selected."),
  votesToCast: z.number().min(1, "At least one vote must be cast."),
});

export async function castVote(otp: string, candidateId: string, votesToCast: number) {
  try {
    const parsed = CastVoteSchema.safeParse({ otp, candidateId, votesToCast });
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten().fieldErrors };
    }

    const { otp: otpValue, candidateId: cId, votesToCast: numVotes } = parsed.data;

    const batch = writeBatch(db);

    // 1. Verify OTP
    const otpDocRef = doc(db, "otps", otpValue);
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
    if (numVotes > otpData.votesAllowed) {
      return { success: false, error: `You can only cast a maximum of ${otpData.votesAllowed} votes with this OTP.` };
    }

    // 2. Verify Candidate
    const candidateDocRef = doc(db, "candidates", cId);
    const candidateDocSnap = await getDoc(candidateDocRef);

    if (!candidateDocSnap.exists()) {
      return { success: false, error: "Selected candidate does not exist." };
    }
    const candidateData = candidateDocSnap.data() as FirestoreCandidateDoc;

    // 3. Update votes
    batch.update(candidateDocRef, {
      voteCount: candidateData.voteCount + numVotes,
    });

    // 4. Mark OTP as used
    batch.update(otpDocRef, {
      isUsed: true,
    });
    
    // 5. Update total votes (optional, can also be calculated on demand)
    const totalsDocRef = doc(db, "metadata", "totals");
    const totalsDocSnap = await getDoc(totalsDocRef);
    let currentTotalVotes = 0;
    if (totalsDocSnap.exists()) {
        currentTotalVotes = (totalsDocSnap.data() as FirestoreTotalsDoc).totalVotesCast || 0;
    }
    batch.set(totalsDocRef, { // Using set with merge: true if document might not exist
        totalVotesCast: currentTotalVotes + numVotes,
        lastUpdated: serverTimestamp()
    }, { merge: true });


    await batch.commit();

    return { success: true, message: "Vote cast successfully!" };
  } catch (error) {
    console.error("Error casting vote:", error);
    return { success: false, error: "Failed to cast vote. Please try again." };
  }
}

export async function getVoteResults() {
  try {
    const candidatesSnapshot = await getDocs(collection(db, "candidates"));
    const candidates = candidatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as import("@/lib/types").Candidate));
    
    const totalsDocSnap = await getDoc(doc(db, "metadata", "totals"));
    const totalVotesCast = totalsDocSnap.exists() ? (totalsDocSnap.data() as FirestoreTotalsDoc).totalVotesCast : 0;

    return { success: true, candidates, totalVotesCast };
  } catch (error) {
    console.error("Error fetching vote results:", error);
    return { success: false, error: "Failed to fetch results.", candidates: [], totalVotesCast: 0 };
  }
}
