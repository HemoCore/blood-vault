import type { DonationRepository } from "../../../domain/ports/DonationRepository.ts";
import type { EventBus } from "../../../domain/ports/eventBus.ts";

const LOW_STOCK_THRESHOLD = 10;

export interface DispenseBagCommand {
    bagId: string;
}

export type DispenseBagResult =
    | { status: "dispensed"; bagId: string }
    | { status: "not-found" };

export async function dispenseBag(
    command: DispenseBagCommand,
    donations: DonationRepository,
    eventBus: EventBus,
): Promise<DispenseBagResult> {

    // Stock avant la sortie
    const stockBefore = await donations.all();

    // Trouver la poche à sortir
    const bag = stockBefore.find(
        (donation) => donation.id === command.bagId
    );

    if (!bag) {
        return { status: "not-found" };
    }

    // Compter les poches du même groupe avant la sortie
    const countBefore = stockBefore.filter(
        (donation) =>
            donation.bloodGroup.toString() ===
            bag.bloodGroup.toString()
    ).length;

    // La sortie est enregistrée
    await donations.remove(command.bagId);

    const countAfter = countBefore - 1;

    // Le stock vient-il de passer sous 10 ?
    if (
        countBefore >= LOW_STOCK_THRESHOLD &&
        countAfter < LOW_STOCK_THRESHOLD
    ) {
        await eventBus.publish({
            type: "BloodStockBecameLow",
            bloodGroup: bag.bloodGroup,
        });
    }

    return {
        status: "dispensed",
        bagId: command.bagId,
    };
}