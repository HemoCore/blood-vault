import {Candidate} from "./candidate";
import {canDonate} from "./domain/eligibility";

export function checkingOnBookingSite(candidate: Candidate): boolean {
    return canDonate(candidate);
}