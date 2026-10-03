import { readFile, writeFile } from "node:fs/promises";
import { BloodGroup } from "../../domain/bloodGroup.ts";
import { Candidate } from "../../domain/candidate.ts";
import { CandidateRepository } from "../../domain/port/candidateRepository.ts";
import { Weight } from "../../domain/weight.ts";

/** Un candidat tel qu'il est écrit dans le fichier JSON : que des valeurs simples. */
interface CandidateRow {
  id: string;
  age: number;
  weightKg: number;
  sexe: string;
  annualDonations: number;
  lastDonationAt: string | null;
  bloodGroup: string;
}

function toRow(candidate: Candidate): CandidateRow {
  return {
    id: candidate.id,
    age: candidate.age,
    weightKg: candidate.weight.toKg(),
    sexe: candidate.sexe,
    annualDonations: candidate.annualDonations,
    lastDonationAt: candidate.lastDonationAt?.toISOString() ?? null,
    bloodGroup: candidate.bloodGroup.toString(),
  };
}

function toCandidate(row: CandidateRow): Candidate {
  return {
    id: row.id,
    age: row.age,
    weight: Weight.of(row.weightKg),
    sexe: row.sexe,
    annualDonations: row.annualDonations,
    lastDonationAt: row.lastDonationAt ? new Date(row.lastDonationAt) : null,
    bloodGroup: BloodGroup.of(row.bloodGroup),
  };
}

export function fileCandidateRepository(
  filePath: string,
): CandidateRepository {

  async function readCandidates(): Promise<Candidate[]> {
    let rows: CandidateRow[];

    try {
      const content = await readFile(filePath, "utf-8");

      rows = JSON.parse(content);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }

      throw error;
    }

    return rows.map(toCandidate);
  }

  async function writeCandidates(candidates: Candidate[]): Promise<void> {
    await writeFile(
      filePath,
      JSON.stringify(candidates.map(toRow), null, 2),
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
