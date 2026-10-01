import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
    canDonate,
    hasEnoughTimeSinceLastDonation,
    isAgeEligible,
    isWeightEligible,
    isWithinAnnualDonationLimit,
} from "./eligibility";
import { Candidate } from "../candidate";

const TODAY = new Date("2024-02-26");

function makeCandidate(overrides: Partial<Candidate> = {}): Candidate {
    return {
        age: 30,
        weightKg: 65,
        sexe: "male",
        annualDonations: 0,
        lastDonationAt: null,
        ...overrides,
    };
}

test("isAgeEligible accepts the age boundaries", () => {
    assert.equal(isAgeEligible(makeCandidate({ age: 18 })), true);
    assert.equal(isAgeEligible(makeCandidate({ age: 70 })), true);
});

test("isAgeEligible rejects ages outside the boundaries", () => {
    assert.equal(isAgeEligible(makeCandidate({ age: 17 })), false);
    assert.equal(isAgeEligible(makeCandidate({ age: 71 })), false);
});

test("isWeightEligible accepts 50 kg or more", () => {
    assert.equal(isWeightEligible(makeCandidate({ weightKg: 50 })), true);
    assert.equal(isWeightEligible(makeCandidate({ weightKg: 65 })), true);
});

test("isWeightEligible rejects less than 50 kg", () => {
    assert.equal(isWeightEligible(makeCandidate({ weightKg: 49 })), false);
});

test("isWithinAnnualDonationLimit accepts 5 donations for a man", () => {
    assert.equal(isWithinAnnualDonationLimit(makeCandidate({ sexe: "male", annualDonations: 5 })), true);
});

test("isWithinAnnualDonationLimit rejects 6 donations for a man", () => {
    assert.equal(isWithinAnnualDonationLimit(makeCandidate({ sexe: "male", annualDonations: 6 })), false);
});

test("isWithinAnnualDonationLimit accepts 3 donations for a woman", () => {
    assert.equal(isWithinAnnualDonationLimit(makeCandidate({ sexe: "female", annualDonations: 3 })), true);
});

test("isWithinAnnualDonationLimit rejects 4 donations for a woman", () => {
    assert.equal(isWithinAnnualDonationLimit(makeCandidate({ sexe: "female", annualDonations: 4 })), false);
});

describe("US4: 8 weeks between donations", () => {
    test("no previous donation: can donate", () => {
        const candidate = makeCandidate({ lastDonationAt: null });
        assert.equal(hasEnoughTimeSinceLastDonation(candidate, TODAY), true);
    });

    test("last donation 7 weeks ago: cannot donate", () => {
        const candidate = makeCandidate({ lastDonationAt: new Date("2024-01-01") });
        const today = new Date("2024-02-19"); // 7 semaines après
        assert.equal(hasEnoughTimeSinceLastDonation(candidate, today), false);
    });

    test("last donation 8 weeks ago: can donate", () => {
        const candidate = makeCandidate({ lastDonationAt: new Date("2024-01-01") });
        const today = new Date("2024-02-26"); // 8 semaines après
        assert.equal(hasEnoughTimeSinceLastDonation(candidate, today), true);
    });
});

describe("canDonate", () => {
    test("accepts a candidate meeting all requirements", () => {
        const candidate = makeCandidate({ annualDonations: 5, lastDonationAt: new Date("2024-01-01") });
        assert.equal(canDonate(candidate, TODAY), true);
    });

    test("rejects a candidate failing any requirement", () => {
        assert.equal(canDonate(makeCandidate({ age: 17 }), TODAY), false);
        assert.equal(canDonate(makeCandidate({ weightKg: 49 }), TODAY), false);
        assert.equal(canDonate(makeCandidate({ sexe: "female", annualDonations: 4 }), TODAY), false);
    });

    test("rejects a candidate who donated less than 8 weeks ago", () => {
        const candidate = makeCandidate({ lastDonationAt: new Date("2024-02-19") });
        assert.equal(canDonate(candidate, TODAY), false);
    });
});