import assert from "node:assert/strict";
import { test } from "node:test";

import { BloodGroup } from "../../domain/values-object/bloodGroup.ts";
import type { Donation } from "../../domain/models/donation.ts";
import { DonationVolume } from "../../domain/values-object/donationVolume.ts";
import { inMemoryDonationRepository } from "../../infrastructure/in-memory/inMemoryDonationRepository.ts";
import { availableBagsForHospital } from "./availableBagsForHospital.ts";

test("returns only each bag's blood group and expiry", async () => {
    const donations = inMemoryDonationRepository();
    const expiredDonation: Donation = {
        id: "donation-1",
        candidateId: "donor-private-id",
        donatedAt: new Date("2026-08-01T12:00:00.000Z"),
        bloodGroup: BloodGroup.of("O-"),
        volume: DonationVolume.of(450),
        bagExpiresAt: new Date("2026-09-12T12:00:00.000Z"),
    };
    await donations.add(expiredDonation);

    const bags = await availableBagsForHospital({ donations });

    assert.deepEqual(bags, [
        {
            bloodGroup: "O-",
            expiresAt: "2026-09-12T12:00:00.000Z",
        },
    ]);
    assert.deepEqual(Object.keys(bags[0]).sort(), ["bloodGroup", "expiresAt"]);
    assert.equal(JSON.stringify(bags).includes("donor-private-id"), false);
});