import type { Candidate } from "../models/candidate.ts";
import { DonationType } from "../values-object/donationType.ts";

const MIN_AGE = 18;
const MAX_AGE = 70;
const MIN_WEIGHT_KG = 50;
const MALE_MAX_DONATIONS = 5;
const FEMALE_MAX_DONATIONS = 3;

export type Eligibility =
    | { eligible: true }
    | { eligible: false; reason: string };

export function isAgeEligible(candidate: Candidate): boolean {
    return candidate.age >= MIN_AGE && candidate.age <= MAX_AGE;
}

export function isWeightEligible(candidate: Candidate): boolean {
    return candidate.weight.toKg() >= MIN_WEIGHT_KG;
}

export function isWithinAnnualDonationLimit(candidate: Candidate): boolean {
    if (candidate.sexe === "male") {
        return candidate.annualDonations <= MALE_MAX_DONATIONS;
    }

    return candidate.annualDonations <= FEMALE_MAX_DONATIONS;
}

export function hasEnoughTimeSinceLastDonation(
    candidate: Candidate,
    currentDate: Date,
    donationType: DonationType = DonationType.WHOLE_BLOOD,
): boolean {
    if (candidate.lastDonationAt === null) {
        return true;
    }

    const elapsedMs =
        currentDate.getTime() - candidate.lastDonationAt.getTime();

    const requiredMs = donationType.minimumIntervalMs;

    return elapsedMs >= requiredMs;
}

export function checkEligibility(
    candidate: Candidate,
    currentDate: Date,
    donationType: DonationType = DonationType.WHOLE_BLOOD,
): Eligibility {
    if (!isAgeEligible(candidate)) {
        return {
            eligible: false,
            reason: "age out of bounds",
        };
    }

    if (!isWeightEligible(candidate)) {
        return {
            eligible: false,
            reason: "weight below minimum",
        };
    }

    if (!isWithinAnnualDonationLimit(candidate)) {
        return {
            eligible: false,
            reason: "annual donation limit reached",
        };
    }

    if (
        !hasEnoughTimeSinceLastDonation(
            candidate,
            currentDate,
            donationType,
        )
    ) {
        return {
            eligible: false,
            reason: "minimum donation interval not respected",
        };
    }

    return {
        eligible: true,
    };
}

export function canDonate(
    candidate: Candidate,
    currentDate: Date,
    donationType: DonationType = DonationType.WHOLE_BLOOD,
): boolean {
    return checkEligibility(
        candidate,
        currentDate,
        donationType,
    ).eligible;
}