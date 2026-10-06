import assert from "node:assert/strict";
import { test } from "node:test";

import { BloodGroup } from "../../domain/values-object/bloodGroup.ts";

import { inMemoryCandidateRepository } from "../../infrastructure/in-memory/inMemoryCandidateRepository.ts";
import { inMemoryMailer } from "../../infrastructure/in-memory/inMemoryMailer.ts";
import { inMemoryEventBus } from "../../infrastructure/in-memory/inMemoryEventBus.ts";

import { onBloodStockBecameLow } from "./notifyDonorsWhenStockIsLow.ts";
import { aCandidate } from "../../testing/builders.ts";

test("notifies only donors with the blood group that became low", async () => {
    const candidates = inMemoryCandidateRepository([
        aCandidate()
            .withBloodGroup("O-")
            .withEmail("o-negative@example.com")
            .build(),

        aCandidate()
            .withBloodGroup("A+")
            .withEmail("a-positive@example.com")
            .build(),
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