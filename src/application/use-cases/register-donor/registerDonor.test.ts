import assert from "node:assert/strict";
import { test } from "node:test";

import { inMemoryCandidateRepository } from "../../../infrastructure/in-memory/inMemoryCandidateRepository.ts";
import { inMemoryMailer } from "../../../infrastructure/in-memory/inMemoryMailer.ts";
import { registerDonor } from "./registerDonor.ts";

const COMMAND = {
    id: "donor-1",
    email: "donor@example.com",
    age: 30,
    weightKg: 65,
    sexe: "female",
    bloodGroup: "O+",
};

function setup() {
    const candidates = inMemoryCandidateRepository();
    const { mailer, sent } = inMemoryMailer();
    return { candidates, mailer, sent };
}

test("registers a donor and finds them afterwards", async () => {
    const { candidates, mailer } = setup();

    const result = await registerDonor(COMMAND, candidates, mailer);

    assert.equal(result.status, "registered");
    const found = await candidates.byId("donor-1");
    assert.equal(found?.email.toString(), "donor@example.com");
    assert.equal(found?.bloodGroup.toString(), "O+");
    assert.equal(found?.annualDonations, 0);
    assert.equal(found?.lastDonationAt, null);
});

test("sends the donor card to the donor's address", async () => {
    const { candidates, mailer, sent } = setup();

    await registerDonor(COMMAND, candidates, mailer);

    assert.equal(sent.length, 1);
    assert.equal(sent[0].to, "donor@example.com");
    assert.equal(sent[0].card.donorId, "donor-1");
    assert.equal(sent[0].card.bloodGroup.toString(), "O+");
});

test("sends the donor card only once if the donor registers twice", async () => {
    const { candidates, mailer, sent } = setup();

    await registerDonor(COMMAND, candidates, mailer);
    const second = await registerDonor(COMMAND, candidates, mailer);

    assert.equal(second.status, "already-registered");
    assert.equal(sent.length, 1);
});

test("refuses a malformed email without saving or sending anything", async () => {
    const { candidates, mailer, sent } = setup();

    const result = await registerDonor({ ...COMMAND, email: "not-an-email" }, candidates, mailer);

    assert.equal(result.status, "invalid");
    assert.equal(await candidates.byId("donor-1"), undefined);
    assert.deepEqual(sent, []);
});

test("refuses an invalid blood group without saving or sending anything", async () => {
    const { candidates, mailer, sent } = setup();

    const result = await registerDonor({ ...COMMAND, bloodGroup: "Z+" }, candidates, mailer);

    assert.equal(result.status, "invalid");
    assert.equal(await candidates.byId("donor-1"), undefined);
    assert.deepEqual(sent, []);
});

for (const weightKg of [0, -5]) {
    test(`refuses a weight of ${weightKg} kg without saving or sending anything`, async () => {
        const { candidates, mailer, sent } = setup();

        const result = await registerDonor({ ...COMMAND, weightKg }, candidates, mailer);

        assert.equal(result.status, "invalid");
        assert.equal(await candidates.byId("donor-1"), undefined);
        assert.deepEqual(sent, []);
    });
}