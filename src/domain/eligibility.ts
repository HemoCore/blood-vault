import {Candidate} from "./candidate";
const MIN_AGE = 18;
const MAX_AGE = 70;
const MIN_WEIGHT_KG = 50;
const MALE_MAX_DONATIONS = 5;
const FEMALE_MAX_DONATIONS = 3;
const WEEKS_BETWEEN_DONATIONS = 8;

export function isAgeEligible(candidate: Candidate): boolean {
    return candidate.age >= MIN_AGE && candidate.age <= MAX_AGE
};

export function isWeightEligible(candidate: Candidate): boolean {
    return candidate.weightKg >= MIN_WEIGHT_KG
};

export function isWithinAnnualDonationLimit(candidate: Candidate): boolean {
    if (candidate.sexe === "male") return candidate.annualDonations <= MALE_MAX_DONATIONS; 
    else return candidate.annualDonations <= FEMALE_MAX_DONATIONS;
}

export function canDonate(candidate: Candidate, currentDate:Date): boolean {
    return isAgeEligible(candidate) && isWeightEligible(candidate) &&
        isWithinAnnualDonationLimit(candidate) &&
        hasEnoughTimeSinceLastDonation(candidate,currentDate);
}

export function hasEnoughTimeSinceLastDonation(
    candidate: Candidate,
    currentDate: Date
): boolean {
    if (candidate.lastDonationAt === null) {
        return true;
    }

    const weeksSinceLastDonation =
        (currentDate.getTime() - candidate.lastDonationAt.getTime())
        / (1000 * 60 * 60 * 24 * 7);

    return weeksSinceLastDonation >= WEEKS_BETWEEN_DONATIONS;
}