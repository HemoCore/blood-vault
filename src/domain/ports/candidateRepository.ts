import type { Candidate } from "../models/candidate.ts";
import {BloodGroup} from "../values-object/bloodGroup.ts";

export interface CandidateRepository {
  byId(id: string): Promise<Candidate | undefined>;
  save(candidate: Candidate): Promise<void>;
  byBloodGroup(bloodGroup: BloodGroup): Promise<Candidate[]>;
}