import type { BloodGroup } from "../values-object/bloodGroup.ts";

const COMPATIBLE_DONORS: Record<string, string[]> = {
    "O-": ["O-"],
    "O+": ["O-", "O+"],
    "A-": ["O-", "A-"],
    "A+": ["O-", "O+", "A-", "A+"],
    "B-": ["O-", "B-"],
    "B+": ["O-", "O+", "B-", "B+"],
    "AB-": ["O-", "A-", "B-", "AB-"],
    "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
};

export function isCompatible(
    bagBloodGroup: BloodGroup,
    patientBloodGroup: BloodGroup,
): boolean {
    const patient = patientBloodGroup.toString();
    const bag = bagBloodGroup.toString();

    return COMPATIBLE_DONORS[patient].includes(bag);
}