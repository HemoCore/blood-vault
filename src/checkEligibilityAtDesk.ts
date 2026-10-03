import {Candidate} from "./domain/candidate";
import {canDonate} from "./domain/eligibility";
import { systemClock } from "./infrastructure/clock/systemClock";

const at = systemClock.now()

export function checkEligibilityAtDesk(candidate: Candidate): boolean {
    return canDonate(candidate, at);
}