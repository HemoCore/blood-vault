import {Candidate} from "./domain/models/candidate.ts";
import {canDonate} from "./domain/services/eligibility.ts";
import { systemClock } from "./infrastructure/clock/systemClock";
import {Clock} from "./domain/ports/clock.ts";


export function checkingOnBookingSite(
    candidate: Candidate,
    clock: Clock,
): boolean {
    return canDonate(candidate, clock.now());
}