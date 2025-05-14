import type { Timestamp } from 'firebase/firestore';

export interface Otp {
  id: string; // The OTP string itself
  createdAt: Timestamp;
  expiresAt: Timestamp;
  votesAllowed: number;
  isUsed: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  voteCount: number;
}

export interface FirestoreOtpDoc {
  createdAt: Timestamp;
  expiresAt: Timestamp;
  votesAllowed: number;
  isUsed: boolean;
}

export interface FirestoreCandidateDoc {
  name: string;
  voteCount: number;
}

export interface FirestoreTotalsDoc {
  totalVotesCast: number;
}
