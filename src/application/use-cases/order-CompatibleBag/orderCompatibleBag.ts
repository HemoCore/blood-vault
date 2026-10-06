import {isCompatible} from "../../../domain/services/bloodCompatibility.ts";
import {BloodGroup} from "../../../domain/values-object/bloodGroup.ts";
import {Clock} from "../../../domain/ports/clock.ts";
import {DonationRepository} from "../../../domain/ports/DonationRepository.ts";


export interface OrderedBag {
    bloodGroup: string;
    expiresAt: string;
}

interface Dependencies {
    donations: DonationRepository;
    clock: Clock;
}

export async function orderCompatibleBag(
    patientBloodGroup: BloodGroup,
    { donations, clock }: Dependencies,
): Promise<OrderedBag | undefined> {
    const now = clock.now();

    const compatibleBags = (await donations.all())
        .filter((donation) => donation.bagExpiresAt > now)
        .filter((donation) =>
            isCompatible(donation.bloodGroup, patientBloodGroup)
        )
        .sort(
            (left, right) =>
                left.bagExpiresAt.getTime() - right.bagExpiresAt.getTime()
        );

    const bag = compatibleBags[0];

    if (!bag) {
        return undefined;
    }

    await donations.remove(bag.id);

    return {
        bloodGroup: bag.bloodGroup.toString(),
        expiresAt: bag.bagExpiresAt.toISOString(),
    };
}