import { randomUUID } from "node:crypto";
import { canDonate } from "./domain/eligibility";
import { CandidateRepository } from "./domain/port/candidateRepository";
import { Clock } from "./domain/port/clock";
import { Donation } from "./domain/donation";
import { DonationRepository } from "./domain/port/DonationRepository";

export type RecordDonationResult =    
        | { status: "not-found" }
        | { status: "ineligible" }
        | { status: "recorded"; donation: Donation };

const BAG_LIFETIME_MS = 42 * 24 * 60 * 60 * 1000 // 42 jours

export async function recordDonation(candidateId: string, candidates: CandidateRepository, donations: DonationRepository, clock: Clock): Promise<RecordDonationResult> {
    const candidate = await candidates.byId(candidateId);

    if(!candidate) return { status: "not-found"};

    const donatedAt = clock.now();

    if(!canDonate(candidate, donatedAt)) return { status: "ineligible"};

    const donation: Donation = {
        id: randomUUID(),
        candidateId: candidate.id,
        donatedAt,
        bloodGroup: candidate.bloodGroup,
        bagExpiresAt: new Date(donatedAt.getTime() + BAG_LIFETIME_MS),
    };

    await candidates.add({
        ...candidate,
        annualDonations: candidate.annualDonations + 1,
        lastDonationAt: donatedAt,
    });

    await donations.add(donation);

    return {status: "recorded", donation};
}