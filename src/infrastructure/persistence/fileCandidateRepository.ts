import { readFile, writeFile } from "node:fs/promises";
import { Candidate } from "../../domain/candidate.ts";
import { CandidateRepository } from "../../domain/port/candidateRepository.ts";

export function fileCandidateRepository(
  filePath: string,
): CandidateRepository {

  async function readCandidates(): Promise<Candidate[]> {
    try {
      const content = await readFile(filePath, "utf-8");

      const data = JSON.parse(content);

      return data.map((candidate: any) => ({
        ...candidate,
        lastDonationAt: candidate.lastDonationAt
          ? new Date(candidate.lastDonationAt)
          : null,
      }));
    } catch {
      return [];
    }
  }

  async function writeCandidates(candidates: Candidate[]): Promise<void> {
    await writeFile(
      filePath,
      JSON.stringify(candidates, null, 2),
      "utf-8",
    );
  }

  return {
    async byId(id: string): Promise<Candidate | undefined> {
      const candidates = await readCandidates();

      return candidates.find((candidate) => candidate.id === id);
    },

    async save(candidate: Candidate): Promise<void> {
      const candidates = await readCandidates();

        const rows = candidates.filter(
          (row) => row.id !== candidate.id
        );

        await writeCandidates([...rows, candidate]);
    },
  };
}