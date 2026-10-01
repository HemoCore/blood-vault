import { candidateRepositoryContract } from "../../testing/candidateRepository.contract.ts";
import { inMemoryCandidateRepository } from "./inMemoryCandidateRepository.ts";

candidateRepositoryContract(
  "inMemoryCandidateRepository",
  async () => inMemoryCandidateRepository()
);