import { randomUUID } from "node:crypto";
import { canDonate } from "../../../domain/services/eligibility.ts";
import { CandidateRepository } from "../../../domain/ports/candidateRepository";
import { Clock } from "../../../domain/ports/clock";
import { Donation } from "../../../domain/models/donation.ts";
import { DonationVolume } from "../../../domain/values-object/donationVolume.ts";
import { DonationRepository } from "../../../domain/ports/DonationRepository";

export type RecordDonationResult =    
        | { status: "not-found" }
        | { status: "ineligible" }
        | { status: "recorded"; donation: Donation };

const BAG_LIFETIME_MS = 42 * 24 * 60 * 60 * 1000 // 42 jours

export async function recordDonation(candidateId: string, volume: DonationVolume, candidates: CandidateRepository, donations: DonationRepository, clock: Clock): Promise<RecordDonationResult> {
    const candidate = await candidates.byId(candidateId);

    if(!candidate) return { status: "not-found"};

    const donatedAt = clock.now();

    if(!canDonate(candidate, donatedAt)) return { status: "ineligible"};

    const donation: Donation = {
        id: randomUUID(),
        candidateId: candidate.id,
        donatedAt,
        bloodGroup: candidate.bloodGroup,
        volume,
        bagExpiresAt: new Date(donatedAt.getTime() + BAG_LIFETIME_MS),
    };

    await candidates.save({
        ...candidate,
        annualDonations: candidate.annualDonations + 1,
        lastDonationAt: donatedAt,
    });

    await donations.add(donation);

    return {status: "recorded", donation};
}