import { randomUUID } from "node:crypto";
import { canDonate } from "../../../domain/services/eligibility.ts";
import { CandidateRepository } from "../../../domain/ports/candidateRepository";
import { Clock } from "../../../domain/ports/clock";
import { Donation } from "../../../domain/models/donation.ts";
import { DonationVolume } from "../../../domain/values-object/donationVolume.ts";
import { DonationRepository } from "../../../domain/ports/DonationRepository";
import { IdGenerator } from "../../../domain/ports/idGenerator.ts";
import { DonationType } from "../../../domain/values-object/donationType.ts";

export type RecordDonationResult =    
        | { status: "not-found" }
        | { status: "ineligible" }
        | { status: "invalid-type" }
        | { status: "recorded"; donation: Donation };

export async function recordDonation(
    candidateId: string,
    volume: DonationVolume,
    candidates: CandidateRepository,
    donations: DonationRepository,
    clock: Clock,
    uuid: IdGenerator,
    donationTypeName = "WHOLE_BLOOD"
): Promise<RecordDonationResult> {
    let donationType: DonationType;
    try {
        donationType = DonationType.of(donationTypeName);
    } catch {
        return { status: "invalid-type" };
    }

    const candidate = await candidates.byId(candidateId);

    if(!candidate) return { status: "not-found"};

    const donatedAt = clock.now();

    if (!canDonate(candidate, donatedAt, donationType)) {
        return { status: "ineligible" };
    }

    const donationId = uuid.next();

    const donation: Donation = {
        id: donationId,
        candidateId: candidate.id,
        donatedAt,
        bloodGroup: candidate.bloodGroup,
        volume,
        donationType,
        bagExpiresAt: donationType.bagExpiresAtFrom(donatedAt),
    };

    await candidates.save({
        ...candidate,
        annualDonations: candidate.annualDonations + 1,
        lastDonationAt: donatedAt,
    });

    await donations.add(donation);

    return {status: "recorded", donation};
}