import { checkEligibility } from "../../../domain/services/eligibility.ts";
import type { CandidateRepository } from "../../../domain/ports/candidateRepository.ts";
import type { Clock } from "../../../domain/ports/clock.ts";
import type { Donation } from "../../../domain/models/donation.ts";
import { DonationVolume } from "../../../domain/values-object/donationVolume.ts";
import type { DonationRepository } from "../../../domain/ports/DonationRepository.ts";
import type { IdGenerator } from "../../../domain/ports/idGenerator.ts";
import { DonationType } from "../../../domain/values-object/donationType.ts";
import { NotFound, Refused } from "../../../domain/errors.ts";

export type RecordDonationResult = {
    status: "recorded";
    donation: Donation;
};

export async function recordDonation(
    candidateId: string,
    volume: DonationVolume,
    candidates: CandidateRepository,
    donations: DonationRepository,
    clock: Clock,
    uuid: IdGenerator,
    donationTypeName = "whole-blood",
): Promise<RecordDonationResult> {
    let donationType: DonationType;

    try {
        donationType = DonationType.of(donationTypeName);
    } catch {
        throw new Refused("invalid donation type");
    }

    const candidate = await candidates.byId(candidateId);

    if (!candidate) {
        throw new NotFound("unknown donor");
    }

    const donatedAt = clock.now();

    const eligibility = checkEligibility(
        candidate,
        donatedAt,
        donationType,
    );

    if (!eligibility.eligible) {
        throw new Refused(eligibility.reason);
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

    return {
        status: "recorded",
        donation,
    };
}