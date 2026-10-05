import assert from "node:assert/strict";
import { test } from "node:test";

import { Donation } from "../../../domain/models/donation.ts";
import { BloodGroup } from "../../../domain/values-object/bloodGroup.ts";
import { DonationVolume } from "../../../domain/values-object/donationVolume.ts";
import { inMemoryDonationRepository } from "../../../infrastructure/in-memory/inMemoryDonationRepository.ts";
import { listAvailableBags } from "./listAvailableBags.ts";

const NOW = new Date("2026-10-05T00:00:00.000Z");

test("returns only the blood group and expiry date for available bags", async () => {
  const donations = inMemoryDonationRepository();

  await donations.add({
    id: "donation-1",
    candidateId: "candidate-1",
    donatedAt: new Date("2026-09-10T00:00:00.000Z"),
    bloodGroup: BloodGroup.of("O+"),
    volume: DonationVolume.of(450),
    bagExpiresAt: new Date("2026-10-20T00:00:00.000Z"),
    donorName: "Alice Example",
  } as Donation & { donorName: string });

  await donations.add({
    id: "donation-2",
    candidateId: "candidate-2",
    donatedAt: new Date("2026-09-12T00:00:00.000Z"),
    bloodGroup: BloodGroup.of("A-"),
    volume: DonationVolume.of(450),
    bagExpiresAt: new Date("2026-10-07T00:00:00.000Z"),
    donorName: "Bob Example",
  } as Donation & { donorName: string });

  await donations.add({
    id: "donation-3",
    candidateId: "candidate-3",
    donatedAt: new Date("2026-09-15T00:00:00.000Z"),
    bloodGroup: BloodGroup.of("B+"),
    volume: DonationVolume.of(450),
    bagExpiresAt: new Date("2026-10-01T00:00:00.000Z"),
    donorName: "Charlie Example",
  } as Donation & { donorName: string });

  const result = await listAvailableBags(donations, NOW);

  assert.deepEqual(result.map((bag) => ({
    bloodGroup: bag.bloodGroup.toString(),
    bagExpiresAt: bag.bagExpiresAt.toISOString(),
  })), [
    { bloodGroup: "A-", bagExpiresAt: "2026-10-07T00:00:00.000Z" },
    { bloodGroup: "O+", bagExpiresAt: "2026-10-20T00:00:00.000Z" },
  ]);

  assert.equal(Object.keys(result[0]).length, 2);
  assert.equal(Object.prototype.hasOwnProperty.call(result[0], "candidateId"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(result[0], "donorName"), false);
});
