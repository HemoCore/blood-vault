import {Candidate} from "./candidate";
import {canDonate} from "./domain/eligibility";

export function checkEligibilityAtDesk(candidate: Candidate): boolean {
    return canDonate(candidate);
}