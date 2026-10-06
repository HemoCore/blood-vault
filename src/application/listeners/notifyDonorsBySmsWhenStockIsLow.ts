import type { EventBus } from "../../domain/ports/eventBus.ts";
import type { CandidateRepository } from "../../domain/ports/candidateRepository.ts";
import type { Sms } from "../../domain/ports/sms.ts";

interface Dependencies {
    candidates: CandidateRepository;
    sms: Sms;
}

export function onBloodStockBecameLowNotifyDonorsBySms(
    bus: EventBus,
    { candidates, sms }: Dependencies,
): void {
    bus.on("BloodStockBecameLow", async (event) => {
        if (event.type !== "BloodStockBecameLow") {
            return;
        }

        const donors = await candidates.byBloodGroup(
            event.bloodGroup
        );

        for (const donor of donors) {
            if (!donor.phone) {
                continue;
            }

            await sms.send({
                to: donor.phone,
                body: `Le stock de ${event.bloodGroup.toString()} est faible. Vous pouvez venir donner.`,
            });
        }
    });
}