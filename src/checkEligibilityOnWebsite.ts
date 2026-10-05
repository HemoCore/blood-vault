import {Candidate} from "./domain/models/candidate.ts";
import {canDonate} from "./domain/services/eligibility.ts";
import { systemClock } from "./infrastructure/clock/systemClock";

const at = systemClock.now()

export function checkingOnBookingSite(candidate: Candidate): boolean {
    return canDonate(candidate, at);
}