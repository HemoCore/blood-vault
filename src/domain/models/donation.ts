import { BloodGroup } from "../values-object/bloodGroup.ts";
import {DonationVolume} from "../values-object/donationVolume.ts";

export interface Donation {
    id: string;
    candidateId: string;
    donatedAt: Date;
    bloodGroup: BloodGroup;
    volume: DonationVolume;
    bagExpiresAt: Date;
}