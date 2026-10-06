import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
    canDonate,
    hasEnoughTimeSinceLastDonation,
    isAgeEligible,
    isWeightEligible,
    isWithinAnnualDonationLimit,
} from "./eligibility.ts";

import { DonationType } from "../values-object/donationType.ts";
import { aCandidate } from "../../testing/builders.ts";

const TODAY = new Date("2024-02-26");

test("isAgeEligible accepts the age boundaries", () => {
    assert.equal(
        isAgeEligible(aCandidate().withAge(18).build()),
        true,
    );

    assert.equal(
        isAgeEligible(aCandidate().withAge(70).build()),
        true,
    );
});

test("isAgeEligible rejects ages outside the boundaries", () => {
    assert.equal(
        isAgeEligible(aCandidate().withAge(17).build()),
        false,
    );

    assert.equal(
        isAgeEligible(aCandidate().withAge(71).build()),
        false,
    );
});

test("isWeightEligible accepts 50 kg or more", () => {
    assert.equal(
        isWeightEligible(aCandidate().withWeight(50).build()),
        true,
    );

    assert.equal(
        isWeightEligible(aCandidate().withWeight(65).build()),
        true,
    );
});

test("isWeightEligible rejects less than 50 kg", () => {
    assert.equal(
        isWeightEligible(aCandidate().withWeight(49).build()),
        false,
    );
});

test("isWithinAnnualDonationLimit accepts 5 donations for a man", () => {
    const candidate = aCandidate()
        .male()
        .withAnnualDonations(5)
        .build();

    assert.equal(isWithinAnnualDonationLimit(candidate), true);
});

test("isWithinAnnualDonationLimit rejects 6 donations for a man", () => {
    const candidate = aCandidate()
        .male()
        .withAnnualDonations(6)
        .build();

    assert.equal(isWithinAnnualDonationLimit(candidate), false);
});

test("isWithinAnnualDonationLimit accepts 3 donations for a woman", () => {
    const candidate = aCandidate()
        .female()
        .withAnnualDonations(3)
        .build();

    assert.equal(isWithinAnnualDonationLimit(candidate), true);
});

test("isWithinAnnualDonationLimit rejects 4 donations for a woman", () => {
    const candidate = aCandidate()
        .female()
        .withAnnualDonations(4)
        .build();

    assert.equal(isWithinAnnualDonationLimit(candidate), false);
});

describe("US4: 8 weeks between donations", () => {
    test("no previous donation: can donate", () => {
        const candidate = aCandidate().build();

        assert.equal(
            hasEnoughTimeSinceLastDonation(candidate, TODAY),
            true,
        );
    });

    test("last donation 7 weeks ago: cannot donate", () => {
        const candidate = aCandidate()
            .lastDonatedAt(new Date("2024-01-01"))
            .build();

        const today = new Date("2024-02-19");

        assert.equal(
            hasEnoughTimeSinceLastDonation(candidate, today),
            false,
        );
    });

    test("last donation 8 weeks ago: can donate", () => {
        const candidate = aCandidate()
            .lastDonatedAt(new Date("2024-01-01"))
            .build();

        const today = new Date("2024-02-26");

        assert.equal(
            hasEnoughTimeSinceLastDonation(candidate, today),
            true,
        );
    });
});

describe("Interval depends on donation type", () => {
    const date = new Date("2024-02-26");

    test("plasma is allowed after 2 weeks", () => {
        const candidate = aCandidate()
            .lastDonatedAt(new Date("2024-02-12"))
            .build();

        assert.equal(
            hasEnoughTimeSinceLastDonation(
                candidate,
                date,
                DonationType.PLASMA,
            ),
            true,
        );
    });

    test("platelets are refused before 4 weeks and allowed at 4 weeks", () => {
        const threeWeeksAgo = aCandidate()
            .lastDonatedAt(new Date("2024-02-05"))
            .build();

        const fourWeeksAgo = aCandidate()
            .lastDonatedAt(new Date("2024-01-29"))
            .build();

        assert.equal(
            hasEnoughTimeSinceLastDonation(
                threeWeeksAgo,
                date,
                DonationType.PLATELETS,
            ),
            false,
        );

        assert.equal(
            hasEnoughTimeSinceLastDonation(
                fourWeeksAgo,
                date,
                DonationType.PLATELETS,
            ),
            true,
        );
    });
});

describe("canDonate", () => {
    test("accepts a candidate meeting all requirements", () => {
        const candidate = aCandidate()
            .male()
            .withAnnualDonations(5)
            .lastDonatedAt(new Date("2024-01-01"))
            .build();

        assert.equal(canDonate(candidate, TODAY), true);
    });

    test("rejects a candidate failing any requirement", () => {
        const tooYoung = aCandidate()
            .withAge(17)
            .build();

        const tooLight = aCandidate()
            .withWeight(49)
            .build();

        const tooManyDonations = aCandidate()
            .female()
            .withAnnualDonations(4)
            .build();

        assert.equal(canDonate(tooYoung, TODAY), false);
        assert.equal(canDonate(tooLight, TODAY), false);
        assert.equal(canDonate(tooManyDonations, TODAY), false);
    });

    test("rejects a candidate who donated less than 8 weeks ago", () => {
        const candidate = aCandidate()
            .lastDonatedAt(new Date("2024-02-19"))
            .build();

        assert.equal(canDonate(candidate, TODAY), false);
    });
});