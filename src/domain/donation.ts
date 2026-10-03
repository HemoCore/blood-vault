import { BloodGroup } from "./bloodGroup";
import {DonationVolume} from "./donationVolume.ts";

export interface Donation {
    id: string;
    candidateId: string;
    donatedAt: Date;
    bloodGroup: BloodGroup;
    volume: DonationVolume;
    bagExpiresAt: Date;
};