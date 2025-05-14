"use server";

import { db } from "@/lib/firebase/config";
import type { FirestoreCandidateDoc } from "@/lib/types";
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";
import { z } from "zod";

const AddCandidateSchema = z.object({
  name: z.string().min(1, "Candidate name cannot be empty."),
});

export async function addCandidate(formData: FormData) {
  try {
    const parsed = AddCandidateSchema.safeParse({
      name: formData.get("name") as string,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten().fieldErrors };
    }

    const candidateData: FirestoreCandidateDoc = {
      name: parsed.data.name,
      voteCount: 0,
    };

    const docRef = await addDoc(collection(db, "candidates"), candidateData);
    return { success: true, candidateId: docRef.id, name: parsed.data.name };
  } catch (error) {
    console.error("Error adding candidate:", error);
    return { success: false, error: "Failed to add candidate. Please try again." };
  }
}

export async function getCandidates() {
  try {
    const candidatesCol = collection(db, "candidates");
    const q = query(candidatesCol, orderBy("name"));
    const snapshot = await getDocs(q);
    const candidatesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as import("@/lib/types").Candidate));
    return { success: true, candidates: candidatesList };
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return { success: false, error: "Failed to fetch candidates.", candidates: [] };
  }
}
