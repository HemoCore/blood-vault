import type { Candidate } from "../models/candidate.ts";

export interface CandidateRepository {
  byId(id: string): Promise<Candidate | undefined>;
  save(candidate: Candidate): Promise<void>;
}