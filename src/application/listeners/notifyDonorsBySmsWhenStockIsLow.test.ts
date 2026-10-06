import assert from "node:assert/strict";
import { test } from "node:test";

import { BloodGroup } from "../../domain/values-object/bloodGroup.ts";

import { inMemoryCandidateRepository } from "../../infrastructure/in-memory/inMemoryCandidateRepository.ts";
import { inMemoryEventBus } from "../../infrastructure/in-memory/inMemoryEventBus.ts";
import { inMemorySms } from "../../infrastructure/in-memory/inMemorySms.ts";

import { onBloodStockBecameLowNotifyDonorsBySms } from "./notifyDonorsBySmsWhenStockIsLow.ts";
import { aCandidate } from "../../testing/builders.ts";

test("sends SMS only to donors of the low blood group who provided a phone number", async () => {
    const candidates = inMemoryCandidateRepository([
        aCandidate()
            .withBloodGroup("O-")
            .withPhone("0611111111")
            .build(),

        aCandidate()
            .withBloodGroup("O-")
            .build(),

        aCandidate()
            .withBloodGroup("A+")
            .withPhone("0633333333")
            .build(),
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
    assert.equal(sent[0].to, "0611111111");
    assert.match(sent[0].body, /O-/);
});