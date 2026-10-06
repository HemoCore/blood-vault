import type { Clock } from "./domain/ports/clock.ts";
import type { IdGenerator } from "./domain/ports/idGenerator.ts";

import { inMemoryCandidateRepository } from "./infrastructure/in-memory/inMemoryCandidateRepository.ts";
import { inMemoryDonationRepository } from "./infrastructure/in-memory/inMemoryDonationRepository.ts";

interface Wiring {
    clock: Clock;
    uuid: IdGenerator;
}

export function buildApp({
                             clock,
                             uuid,
                         }: Wiring) {
    const candidates = inMemoryCandidateRepository();
    const donations = inMemoryDonationRepository();

    return {
        candidates,
        donations,
        clock,
        uuid,
    };
}

export type App = ReturnType<typeof buildApp>;