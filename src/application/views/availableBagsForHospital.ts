import type { DonationRepository } from "../../domain/ports/DonationRepository.ts";

export interface HospitalBagLine {
    bloodGroup: string;
    expiresAt: string;
}

interface Dependencies {
    donations: DonationRepository;
}

export async function availableBagsForHospital(
    { donations }: Dependencies,
): Promise<HospitalBagLine[]> {
    const donationsList = await donations.all();

    return donationsList.map((donation) => ({
        bloodGroup: donation.bloodGroup.toString(),
        expiresAt: donation.bagExpiresAt.toISOString(),
    }));
}