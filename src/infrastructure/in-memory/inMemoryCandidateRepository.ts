import { Candidate } from "../../domain/models/candidate.ts";
import type { CandidateRepository } from "../../domain/ports/candidateRepository.ts";
import type { BloodGroup } from "../../domain/values-object/bloodGroup.ts";

/** Les candidats pour les tests : rapides, jetables, sans fichier. */
export function inMemoryCandidateRepository(
    seed: Candidate[] = []
): CandidateRepository {

  const rows = new Map(
      seed.map((candidate) => [candidate.id, candidate])
  );

  return {
    async byId(id) {
      return rows.get(id);
    },

    async save(candidate) {
      rows.set(candidate.id, candidate);
    },

    async byBloodGroup(bloodGroup: BloodGroup) {
      return [...rows.values()].filter(
          (candidate) =>
              candidate.bloodGroup.toString() === bloodGroup.toString()
      );
    },
  };
}