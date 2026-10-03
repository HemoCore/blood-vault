import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { Candidate } from "../domain/candidate.ts";
import { CandidateRepository } from "../domain/port/candidateRepository.ts";

const EMMA: Candidate = {
  id: "c1",
  age: 30,
  weightKg: 65,
  sexe: "female",
  annualDonations: 2,
  lastDonationAt: null,
  bloodGroup: "O+"
};

export function candidateRepositoryContract(
  name: string,
  make: () => Promise<CandidateRepository>
): void {
  describe(`${name} honours the CandidateRepository contract`, () => {

    test("gives back nothing for an unknown candidate", async () => {
      const candidates = await make();

      assert.equal(await candidates.byId("nobody"), undefined);
    });

    test("gives back the candidate that was added", async () => {
      const candidates = await make();

      await candidates.save(EMMA);

      assert.deepEqual(await candidates.byId("c1"), EMMA);
    });

    test("adding a candidate already known replaces it", async () => {
      const candidates = await make();

      await candidates.save(EMMA);
      await candidates.save({ ...EMMA, weightKg: 70 });

      assert.equal(
        (await candidates.byId("c1"))?.weightKg,
        70
      );
    });
  });
}