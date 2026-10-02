import type { Candidate } from "../candidate.ts";

export interface CandidateRepository {
  byId(id: string): Promise<Candidate | undefined>;
  add(candidate: Candidate): Promise<void>;
}