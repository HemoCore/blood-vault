import assert from "node:assert/strict";
import { test } from "node:test";

import { BloodGroup } from "../../domain/values-object/bloodGroup.ts";
import { Weight } from "../../domain/values-object/weight.ts";
import { Email } from "../../domain/values-object/email.ts";

import { inMemoryCandidateRepository } from "../../infrastructure/in-memory/inMemoryCandidateRepository.ts";
import { inMemoryEventBus } from "../../infrastructure/in-memory/inMemoryEventBus.ts";
import { inMemorySms } from "../../infrastructure/in-memory/inMemorySms.ts";

import { onBloodStockBecameLowNotifyDonorsBySms } from "./notifyDonorsBySmsWhenStockIsLow.ts";

test("sends SMS only to donors of the low blood group who provided a phone number", async () => {
    const candidates = inMemoryCandidateRepository([
        {
            id: "donor-o-negative-with-phone",
            age: 30,
            weight: Weight.of(65),
            sexe: "female",
            annualDonations: 0,
            lastDonationAt: null,
            bloodGroup: BloodGroup.of("O-"),
            email: Email.of("donor1@example.com"),
            phone: "0611111111",
        },
        {
            id: "donor-o-negative-without-phone",
            age: 35,
            weight: Weight.of(70),
            sexe: "male",
            annualDonations: 0,
            lastDonationAt: null,
            bloodGroup: BloodGroup.of("O-"),
            email: Email.of("donor2@example.com"),
        },
        {
            id: "donor-a-positive-with-phone",
            age: 40,
            weight: Weight.of(75),
            sexe: "male",
            annualDonations: 0,
            lastDonationAt: null,
            bloodGroup: BloodGroup.of("A+"),
            email: Email.of("donor3@example.com"),
            phone: "0633333333",
        },
    ]);

    const bus = inMemoryEventBus();
    const { sms, sent } = inMemorySms();

    onBloodStockBecameLowNotifyDonorsBySms(bus, {
        candidates,
        sms,
    });

    await bus.publish({
        type: "BloodStockBecameLow",
        bloodGroup: BloodGroup.of("O-"),
    });

    assert.equal(sent.length, 1);

    assert.equal(
        sent[0].to,
        "0611111111",
    );

    assert.match(
        sent[0].body,
        /O-/,
    );
});