import { BloodGroup } from "./bloodGroup";
import {Weight} from "./weight.ts";

export interface Candidate {
    id: string;
    age: number;
    weight: Weight;
    sexe: string;
    annualDonations: number;
    lastDonationAt: Date|null;
    bloodGroup: BloodGroup;
}