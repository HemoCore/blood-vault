import type { EventBus } from "../../domain/ports/eventBus.ts";
import type { Mailer } from "../../domain/ports/mailer.ts";
import type { Email } from "../../domain/values-object/email.ts";

interface Dependencies {
    mailer: Mailer;
    partnerEmail: Email;
}

export function onBloodStockBecameLowNotifyPartner(
    bus: EventBus,
    { mailer, partnerEmail }: Dependencies,
): void {
    bus.on("BloodStockBecameLow", async (event) => {
        if (event.type !== "BloodStockBecameLow") {
            return;
        }

        await mailer.send({
            to: partnerEmail,
            subject: "Stock de sang faible",
            body: `Le stock de ${event.bloodGroup.toString()} est faible.`,
        });
    });
}