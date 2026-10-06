import assert from "node:assert/strict";
import { test } from "node:test";

import { BloodGroup } from "../../domain/values-object/bloodGroup.ts";
import { Weight } from "../../domain/values-object/weight.ts";
import { Email } from "../../domain/values-object/email.ts";

import { inMemoryCandidateRepository } from "../../infrastructure/in-memory/inMemoryCandidateRepository.ts";
import { inMemoryMailer } from "../../infrastructure/in-memory/inMemoryMailer.ts";
import { inMemoryEventBus } from "../../infrastructure/in-memory/inMemoryEventBus.ts";

import { onBloodStockBecameLow } from "./notifyDonorsWhenStockIsLow.ts";

test("notifies only donors with the blood group that became low", async () => {
    const candidates = inMemoryCandidateRepository([
        {
            id: "donor-o-negative",
            age: 30,
            weight: Weight.of(65),
            sexe: "female",
            annualDonations: 0,
            lastDonationAt: null,
            bloodGroup: BloodGroup.of("O-"),
            email: Email.of("o-negative@example.com"),
        },
        {
            id: "donor-a-positive",
            age: 35,
            weight: Weight.of(70),
            sexe: "male",
            annualDonations: 0,
            lastDonationAt: null,
            bloodGroup: BloodGroup.of("A+"),
            email: Email.of("a-positive@example.com"),
        },
    ]);

    const { mailer, sent } = inMemoryMailer();
    const bus = inMemoryEventBus();

    onBloodStockBecameLow(bus, {
        candidates,
        mailer,
    });

    await bus.publish({
        type: "BloodStockBecameLow",
        bloodGroup: BloodGroup.of("O-"),
    });

    assert.equal(sent.length, 1);
    assert.equal(
        sent[0].to.toString(),
        "o-negative@example.com",
    );

    assert.equal(
        sent[0].subject,
        "Stock de sang faible",
    );

    assert.match(sent[0].body, /O-/);
});