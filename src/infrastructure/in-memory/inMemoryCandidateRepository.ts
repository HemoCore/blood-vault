import type { Candidate } from "../../domain/candidate.ts";
import type { CandidateRepository } from "../../domain/ports/candidateRepository.ts";

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