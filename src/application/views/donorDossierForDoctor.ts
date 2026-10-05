import type { CandidateRepository } from "../../domain/ports/candidateRepository.ts";
import type { DonationRepository } from "../../domain/ports/DonationRepository.ts";

export interface DoctorDonorDossier {
  donor: {
    id: string;
    email: string;
    age: number;
    weightKg: number;
    sexe: string;
    annualDonations: number;
    lastDonationAt: string | null;
    bloodGroup: string;
  };
  donations: Array<{
    id: string;
    donatedAt: string;
    bloodGroup: string;
    volumeMl: number;
    bagExpiresAt: string;
  }>;
}

interface Dependencies {
  candidates: CandidateRepository;
  donations: DonationRepository;
}

export async function donorDossierForDoctor(
  candidateId: string,
  { candidates, donations }: Dependencies,
): Promise<DoctorDonorDossier | undefined> {
  const candidate = await candidates.byId(candidateId);

  if (!candidate) {
    return undefined;
  }

  const candidateDonations = (await donations.all())
    .filter((donation) => donation.candidateId === candidateId)
    .sort((left, right) => left.donatedAt.getTime() - right.donatedAt.getTime());

  return {
    donor: {
      id: candidate.id,
      email: candidate.email.toString(),
      age: candidate.age,
      weightKg: candidate.weight.toKg(),
      sexe: candidate.sexe,
      annualDonations: candidate.annualDonations,
      lastDonationAt: candidate.lastDonationAt?.toISOString() ?? null,
      bloodGroup: candidate.bloodGroup.toString(),
    },
    donations: candidateDonations.map((donation) => ({
      id: donation.id,
      donatedAt: donation.donatedAt.toISOString(),
      bloodGroup: donation.bloodGroup.toString(),
      volumeMl: donation.volume.toMl(),
      bagExpiresAt: donation.bagExpiresAt.toISOString(),
    })),
  };
}