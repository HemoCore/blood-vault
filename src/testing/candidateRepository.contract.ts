import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { BloodGroup } from "../domain/bloodGroup.ts";
import { Candidate } from "../domain/candidate.ts";
import { Email } from "../domain/email.ts";
import { CandidateRepository } from "../domain/port/candidateRepository.ts";
import { Weight } from "../domain/weight.ts";

const EMMA: Candidate = {
  id: "c1",
  email: Email.of("emma@example.com"),
  age: 30,
  weight: Weight.of(65),
  sexe: "female",
  annualDonations: 2,
  lastDonationAt: null,
  bloodGroup: BloodGroup.of("O+")
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
      await candidates.save({ ...EMMA, weight: Weight.of(70) });

      assert.equal(
          (await candidates.byId("c1"))?.weight.toKg(),
          70
      );
    });

    test("keeps the email of the candidate", async () => {
      const candidates = await make();

      await candidates.save(EMMA);

      assert.equal(
          (await candidates.byId("c1"))?.email.toString(),
          "emma@example.com"
      );
    });
  });
}