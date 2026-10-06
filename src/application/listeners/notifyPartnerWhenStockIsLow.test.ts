import assert from "node:assert/strict";
import { test } from "node:test";

import { BloodGroup } from "../../domain/values-object/bloodGroup.ts";
import { Email } from "../../domain/values-object/email.ts";

import { inMemoryMailer } from "../../infrastructure/in-memory/inMemoryMailer.ts";
import { inMemoryEventBus } from "../../infrastructure/in-memory/inMemoryEventBus.ts";

import { onBloodStockBecameLowNotifyPartner } from "./notifyPartnerWhenStockIsLow.ts";
import { onBloodStockBecameLow } from "./notifyDonorsWhenStockIsLow.ts";
import { inMemoryCandidateRepository } from "../../infrastructure/in-memory/inMemoryCandidateRepository.ts";
import { Weight } from "../../domain/values-object/weight.ts";

test("notifies the partner when blood stock becomes low", async () => {
    const bus = inMemoryEventBus();
    const { mailer, sent } = inMemoryMailer();

    const partnerEmail = Email.of("partner@example.com");

    onBloodStockBecameLowNotifyPartner(bus, {
        mailer,
        partnerEmail,
    });

    await bus.publish({
        type: "BloodStockBecameLow",
        bloodGroup: BloodGroup.of("O-"),
    });

    assert.equal(sent.length, 1);
    assert.equal(sent[0].to.toString(), "partner@example.com");
    assert.equal(sent[0].subject, "Stock de sang faible");
    assert.match(sent[0].body, /O-/);
});

test("notifies both donors and partner when blood stock becomes low", async () => {
    const bus = inMemoryEventBus();
    const { mailer, sent } = inMemoryMailer();

    const candidates = inMemoryCandidateRepository([
        {
            id: "donor-1",
            age: 30,
            weight: Weight.of(65),
            sexe: "female",
            annualDonations: 0,
            lastDonationAt: null,
            bloodGroup: BloodGroup.of("O-"),
            email: Email.of("donor@example.com"),
        },
    ]);

    // Listener déjà présent depuis l'US14
    onBloodStockBecameLow(bus, {
        candidates,
        mailer,
    });

    // Nouveau listener de l'US15
    onBloodStockBecameLowNotifyPartner(bus, {
        mailer,
        partnerEmail: Email.of("partner@example.com"),
    });

    await bus.publish({
        type: "BloodStockBecameLow",
        bloodGroup: BloodGroup.of("O-"),
    });

    assert.equal(sent.length, 2);

    assert.equal(
        sent[0].to.toString(),
        "donor@example.com",
    );

    assert.equal(
        sent[1].to.toString(),
        "partner@example.com",
    );
});