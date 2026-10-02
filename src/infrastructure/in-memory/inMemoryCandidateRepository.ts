import { Candidate } from "../../candidate.js";
import type { CandidateRepository } from "../../domain/port/candidateRepository.ts";

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

    async add(candidate) {
      rows.set(candidate.id, candidate);
    },
  };
}