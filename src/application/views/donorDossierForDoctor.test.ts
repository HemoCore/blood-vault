import assert from "node:assert/strict";
import { test } from "node:test";

import { BloodGroup } from "../../domain/values-object/bloodGroup.ts";
import type { Candidate } from "../../domain/models/candidate.ts";
import type { Donation } from "../../domain/models/donation.ts";
import { DonationVolume } from "../../domain/values-object/donationVolume.ts";
import { Email } from "../../domain/values-object/email.ts";
import { Weight } from "../../domain/values-object/weight.ts";
import { inMemoryCandidateRepository } from "../../infrastructure/in-memory/inMemoryCandidateRepository.ts";
import { inMemoryDonationRepository } from "../../infrastructure/in-memory/inMemoryDonationRepository.ts";
import { donorDossierForDoctor } from "./donorDossierForDoctor.ts";

const FIRST_DONATION_DATE = new Date("2026-04-01T09:00:00.000Z");
const SECOND_DONATION_DATE = new Date("2026-08-01T09:00:00.000Z");
const CANDIDATE: Candidate = {
  id: "candidate-1",
  email: Email.of("donor@example.com"),
  age: 30,
  weight: Weight.of(65),
  sexe: "female",
  annualDonations: 2,
  lastDonationAt: SECOND_DONATION_DATE,
  bloodGroup: BloodGroup.of("O+"),
};

function aDonation(id: string, candidateId: string, donatedAt: Date): Donation {
  return {
    id,
    candidateId,
    donatedAt,
    bloodGroup: BloodGroup.of("O+"),
    volume: DonationVolume.of(450),
    bagExpiresAt: new Date(donatedAt.getTime() + 42 * 24 * 60 * 60 * 1000),
  };
}

async function repositories() {
  const candidates = inMemoryCandidateRepository([CANDIDATE]);
  const donations = inMemoryDonationRepository();
  await donations.add(aDonation("donation-2", CANDIDATE.id, SECOND_DONATION_DATE));
  await donations.add(aDonation("donation-other", "candidate-2", FIRST_DONATION_DATE));
  await donations.add(aDonation("donation-1", CANDIDATE.id, FIRST_DONATION_DATE));
  return { candidates, donations };
}

test("returns the donor's dossier and only that donor's sorted donations", async () => {
  const result = await donorDossierForDoctor("candidate-1", await repositories());

  assert.deepEqual(result, {
    donor: {
      id: "candidate-1",
      email: "donor@example.com",
      age: 30,
      weightKg: 65,
      sexe: "female",
      annualDonations: 2,
      lastDonationAt: "2026-08-01T09:00:00.000Z",
      bloodGroup: "O+",
    },
    donations: [
      {
        id: "donation-1",
        donatedAt: "2026-04-01T09:00:00.000Z",
        bloodGroup: "O+",
        volumeMl: 450,
        bagExpiresAt: "2026-05-13T09:00:00.000Z",
      },
      {
        id: "donation-2",
        donatedAt: "2026-08-01T09:00:00.000Z",
        bloodGroup: "O+",
        volumeMl: 450,
        bagExpiresAt: "2026-09-12T09:00:00.000Z",
      },
    ],
  });
});

test("returns undefined when the donor is unknown", async () => {
  const { candidates, donations } = await repositories();

  assert.equal(
    await donorDossierForDoctor("unknown", { candidates, donations }),
    undefined,
  );
});