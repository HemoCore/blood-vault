import assert from "node:assert/strict";
import { test } from "node:test";

import type { Candidate } from "../../../domain/candidate.ts";
import { inMemoryCandidateRepository } from "../../../infrastructure/in-memory/inMemoryCandidateRepository.ts";
import { inMemoryDonationRepository } from "../../../infrastructure/in-memory/inMemoryDonationRepository.ts";
import { recordDonation } from "./recordDonation.ts";

const TODAY = new Date("2026-10-03");
const ELIGIBLE_CANDIDATE: Candidate = {
  id: "candidate-1",
  age: 30,
  weightKg: 65,
  sexe: "male",
  annualDonations: 0,
  lastDonationAt: null,
  bloodGroup: "O+",
};
const clock = { now: () => TODAY };

test("records an eligible donation and expires its bag after 42 days", async () => {
  const candidates = inMemoryCandidateRepository([ELIGIBLE_CANDIDATE]);
  const donations = inMemoryDonationRepository();

  const result = await recordDonation("candidate-1", candidates, donations, clock);

  assert.equal(result.status, "recorded");
  const savedDonations = await donations.all();
  assert.equal(savedDonations.length, 1);
  assert.equal(savedDonations[0].candidateId, "candidate-1");
  assert.equal(savedDonations[0].donatedAt.getTime(), TODAY.getTime());
  assert.equal(savedDonations[0].bloodGroup, "O+");
  assert.equal(
    savedDonations[0].bagExpiresAt.getTime(),
    new Date("2026-11-14").getTime(),
  );

  const updatedCandidate = await candidates.byId("candidate-1");
  assert.equal(updatedCandidate?.annualDonations, 1);
  assert.equal(updatedCandidate?.lastDonationAt?.getTime(), TODAY.getTime());
});

test("refuses an unknown candidate without saving anything", async () => {
  const candidates = inMemoryCandidateRepository();
  const donations = inMemoryDonationRepository();

  const result = await recordDonation("unknown", candidates, donations, clock);

  assert.deepEqual(result, { status: "not-found" });
  assert.equal(await candidates.byId("unknown"), undefined);
  assert.deepEqual(await donations.all(), []);
});

test("refuses an ineligible candidate without saving anything", async () => {
  const candidate = { ...ELIGIBLE_CANDIDATE, age: 17 };
  const candidates = inMemoryCandidateRepository([candidate]);
  const donations = inMemoryDonationRepository();

  const result = await recordDonation(candidate.id, candidates, donations, clock);

  assert.deepEqual(result, { status: "ineligible" });
  assert.deepEqual(await candidates.byId(candidate.id), candidate);
  assert.deepEqual(await donations.all(), []);
});