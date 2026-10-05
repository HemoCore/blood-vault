import assert from "node:assert/strict";
import { test } from "node:test";

import { BloodGroup } from "../../domain/values-object/bloodGroup.ts";
import type { Donation } from "../../domain/models/donation.ts";
import { DonationVolume } from "../../domain/values-object/donationVolume.ts";
import { inMemoryDonationRepository } from "../../infrastructure/in-memory/inMemoryDonationRepository.ts";
import { donationCountsByBloodGroup } from "./donationCountsByBloodGroup.ts";

const NOW = new Date("2026-10-05T12:00:00.000Z");

function aDonation(id: string, bloodGroup: string, donatedAt: Date): Donation {
  return {
    id,
    candidateId: `candidate-${id}`,
    donatedAt,
    bloodGroup: BloodGroup.of(bloodGroup),
    volume: DonationVolume.of(450),
    bagExpiresAt: new Date(donatedAt.getTime() + 42 * 24 * 60 * 60 * 1000),
  };
}

test("counts donations from the last 30 days and returns zero for other groups", async () => {
  const donations = inMemoryDonationRepository();
  await donations.add(aDonation("o-1", "O+", new Date("2026-09-20T12:00:00.000Z")));
  await donations.add(aDonation("o-2", "O+", new Date("2026-10-01T12:00:00.000Z")));
  await donations.add(aDonation("o-3", "O+", new Date("2026-10-02T12:00:00.000Z")));
  await donations.add(aDonation("a-1", "A+", new Date("2026-10-03T12:00:00.000Z")));
  await donations.add(aDonation("old-o", "O+", new Date("2026-09-04T12:00:00.000Z")));

  const report = await donationCountsByBloodGroup({
    donations,
    clock: { now: () => NOW },
  });

  assert.deepEqual(report, [
    { bloodGroup: "A+", count: 1 },
    { bloodGroup: "A-", count: 0 },
    { bloodGroup: "B+", count: 0 },
    { bloodGroup: "B-", count: 0 },
    { bloodGroup: "AB+", count: 0 },
    { bloodGroup: "AB-", count: 0 },
    { bloodGroup: "O+", count: 3 },
    { bloodGroup: "O-", count: 0 },
  ]);
});

test("includes a donation exactly 30 days before now", async () => {
  const donations = inMemoryDonationRepository();
  await donations.add(aDonation("boundary", "O-", new Date("2026-09-05T12:00:00.000Z")));

  const report = await donationCountsByBloodGroup({
    donations,
    clock: { now: () => NOW },
  });

  assert.equal(report.find((line) => line.bloodGroup === "O-")?.count, 1);
});