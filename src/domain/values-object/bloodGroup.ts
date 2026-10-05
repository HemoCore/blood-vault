export const BLOOD_GROUPS = [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
] as const;

type BloodGroupValue = (typeof VALID_BLOOD_GROUPS)[number];

export class BloodGroup {
    private constructor(private readonly value: BloodGroupValue) {}

    static of(value: string): BloodGroup {
        if (!BLOOD_GROUPS.includes(value as BloodGroupValue)) {
            throw new Error("invalid blood group");
        }

        return new BloodGroup(value as BloodGroupValue);
    }

    toString(): string {
        return this.value;
    }
}