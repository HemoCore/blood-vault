import type { DonationRepository } from "../../domain/ports/DonationRepository.ts";
import type { Clock } from "../../domain/ports/clock.ts";
import { BLOOD_GROUPS } from "../../domain/values-object/bloodGroup.ts";

export interface DonationCountByBloodGroup {
  bloodGroup: string;
  count: number;
}

interface Dependencies {
  donations: DonationRepository;
  clock: Clock;
}

const LAST_30_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function donationCountsByBloodGroup(
  { donations, clock }: Dependencies,
): Promise<DonationCountByBloodGroup[]> {
  const now = clock.now().getTime();
  const from = now - LAST_30_DAYS_MS;
  const counts = new Map<string, number>(
    BLOOD_GROUPS.map((bloodGroup) => [bloodGroup, 0]),
  );

  for (const donation of await donations.all()) {
    const donatedAt = donation.donatedAt.getTime();
    if (donatedAt < from || donatedAt > now) continue;

    const bloodGroup = donation.bloodGroup.toString();
    counts.set(bloodGroup, (counts.get(bloodGroup) ?? 0) + 1);
  }

  return BLOOD_GROUPS.map((bloodGroup) => ({
    bloodGroup,
    count: counts.get(bloodGroup) ?? 0,
  }));
}