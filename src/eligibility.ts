export interface Candidate {
    age: number;
    weightKg: number;
}

const MIN_AGE = 18;
const MAX_AGE = 70;
const MIN_WEIGHT_KG = 50;

export function canDonate(candidate: Candidate): boolean {
    return (
        candidate.age >= MIN_AGE &&
        candidate.age <= MAX_AGE &&
        candidate.weightKg >= MIN_WEIGHT_KG
    );
}