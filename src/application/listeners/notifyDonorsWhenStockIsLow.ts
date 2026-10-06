import type { EventBus } from "../../domain/ports/eventBus.ts";
import type { CandidateRepository } from "../../domain/ports/candidateRepository.ts";
import type { Mailer } from "../../domain/ports/mailer.ts";

interface Dependencies {
    candidates: CandidateRepository;
    mailer: Mailer;
}

export function onBloodStockBecameLow(
    bus: EventBus,
    { candidates, mailer }: Dependencies,
): void {

    bus.on("BloodStockBecameLow", async (event) => {
        if (event.type !== "BloodStockBecameLow") {
            return;
        }

        const donors = await candidates.byBloodGroup(
            event.bloodGroup
        );

        for (const donor of donors) {
            await mailer.send({
                to: donor.email,
                subject: "Stock de sang faible",
                body: `Le stock de ${event.bloodGroup.toString()} est faible. Vous pouvez venir donner.`,
            });
        }
    });
}