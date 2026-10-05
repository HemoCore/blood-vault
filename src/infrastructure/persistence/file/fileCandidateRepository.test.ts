import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { candidateRepositoryContract } from "../../../testing/candidateRepository.contract.ts";
import { fileCandidateRepository } from "./fileCandidateRepository.ts";

candidateRepositoryContract(
  "fileCandidateRepository",
  async () => {
    const folder = await mkdtemp(
      join(tmpdir(), "blood-vault-")
    );

    return fileCandidateRepository(
      join(folder, "candidates.json")
    );
  }
);