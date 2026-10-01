export interface Candidate {
    id: string;
    age: number;
    weightKg: number;
    sexe: string;
    annualDonations: number;
    lastDonationAt: Date|null;
}