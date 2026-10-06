import { BloodGroup } from "../values-object/bloodGroup.ts";
import {Weight} from "../values-object/weight.ts";
import {Email} from "../values-object/email.ts";

export interface Candidate {
    id: string;
    age: number;
    weight: Weight;
    sexe: string;
    annualDonations: number;
    lastDonationAt: Date|null;
    bloodGroup: BloodGroup;
    email: Email;
    phone?: string;
}