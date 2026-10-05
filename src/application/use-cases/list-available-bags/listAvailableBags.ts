import type { DonationRepository } from "../../../domain/ports/DonationRepository.ts";
import type { BloodGroup } from "../../../domain/values-object/bloodGroup.ts";
import {AvailableBag} from "../../dtos/availableBags.ts";

export async function listAvailableBags(
    donations: DonationRepository,
    now: Date = new Date(),
): Promise<AvailableBag[]> {
    const allDonations = await donations.all();

    return allDonations
        .filter((donation) => donation.bagExpiresAt.getTime() > now.getTime())
        .sort((left, right) => left.bagExpiresAt.getTime() - right.bagExpiresAt.getTime())
        .map(({ bloodGroup, bagExpiresAt }) => ({ bloodGroup, bagExpiresAt }));
}

export const availableBags = listAvailableBags;
export const listAvailablePouches = listAvailableBags;
