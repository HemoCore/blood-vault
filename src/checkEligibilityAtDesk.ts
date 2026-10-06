import type { Candidate } from "./domain/models/candidate.ts";
import type { Clock } from "./domain/ports/clock.ts";
import { canDonate } from "./domain/services/eligibility.ts";

export function checkEligibilityAtDesk(
    candidate: Candidate,
    clock: Clock,
): boolean {
    return canDonate(candidate, clock.now());
}