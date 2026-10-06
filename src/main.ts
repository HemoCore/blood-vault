import type { Clock } from "./domain/ports/clock.ts";
import type { IdGenerator } from "./domain/ports/idGenerator.ts";

import { RegisterDonorHandler } from "./application/use-cases/register-donor/registerDonor.ts";

import { inMemoryCandidateRepository } from "./infrastructure/in-memory/inMemoryCandidateRepository.ts";
import { inMemoryDonationRepository } from "./infrastructure/in-memory/inMemoryDonationRepository.ts";
import { inMemoryMailer } from "./infrastructure/in-memory/inMemoryMailer.ts";

interface Wiring {
    clock: Clock;
    uuid: IdGenerator;
}

/**
 * Racine de composition :
 * choisit les implémentations et les branche ensemble.
 *
 * Pas de process.env ici.
 * Pas de serveur HTTP ici.
 * Pas de règle métier ici.
 */
export function buildApp({
                             clock,
                             uuid,
                         }: Wiring) {
    const candidates = inMemoryCandidateRepository();
    const donations = inMemoryDonationRepository();
    const mailer = inMemoryMailer();

    const registerDonor = new RegisterDonorHandler(
        candidates,
        mailer.mailer,
    );

    return {
        candidates,
        donations,
        clock,
        uuid,
        registerDonor,
    };
}

export type App = ReturnType<typeof buildApp>;