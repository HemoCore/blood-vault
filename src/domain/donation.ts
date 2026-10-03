import { BloodGroup } from "./bloodGroup";

export interface Donation {
    id: string;
    candidateId: string;
    donatedAt: Date;
    bloodGroup: BloodGroup;
    bagExpiresAt: Date;
};