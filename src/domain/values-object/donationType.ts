export type DonationTypeName = "whole-blood" | "plasma" | "platelets";

const DAY_MS = 24 * 60 * 60 * 1000;
const days = (count: number): number => count * DAY_MS;
const weeks = (count: number): number => days(count * 7);

type ShelfLife =
  | { unit: "days"; count: number }
  | { unit: "years"; count: number };

interface DonationPolicy {
  minimumIntervalMs: number;
  bagShelfLife: ShelfLife;
}

const RULES: Record<DonationTypeName, DonationPolicy> = {
  "whole-blood": {
    minimumIntervalMs: weeks(8),
    bagShelfLife: { unit: "days", count: 42 },
  },
  "plasma": {
    minimumIntervalMs: weeks(2),
    bagShelfLife: { unit: "years", count: 1 },
  },
  "platelets": {
    minimumIntervalMs: weeks(4),
    bagShelfLife: { unit: "days", count: 7 },
  },
};

export class DonationType {
  private constructor(private readonly value: DonationTypeName) {}

  static readonly WHOLE_BLOOD = new DonationType("whole-blood");
  static readonly PLASMA = new DonationType("plasma");
  static readonly PLATELETS = new DonationType("platelets");

  static of(value: string): DonationType {
    if (!Object.hasOwn(RULES, value)) {
      throw new Error("invalid donation type");
    }

    return new DonationType(value as DonationTypeName);
  }

  get minimumIntervalMs(): number {
    return RULES[this.value].minimumIntervalMs;
  }

  bagExpiresAtFrom(donatedAt: Date): Date {
    const shelfLife = RULES[this.value].bagShelfLife;

    if (shelfLife.unit === "years") {
      const expiresAt = new Date(donatedAt);
      expiresAt.setUTCFullYear(expiresAt.getUTCFullYear() + shelfLife.count);
      return expiresAt;
    }

    return new Date(donatedAt.getTime() + days(shelfLife.count));
  }

  toString(): DonationTypeName {
    return this.value;
  }
}