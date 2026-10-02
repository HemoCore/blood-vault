import {Candidate} from "./candidate";
import {canDonate} from "./domain/eligibility";
import { systemClock } from "./infrastructure/clock/systemClock";

const at = systemClock.now()

export function checkingOnBookingSite(candidate: Candidate): boolean {
    return canDonate(candidate, at);
}