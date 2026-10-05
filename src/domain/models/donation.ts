import { BloodGroup } from "../values-object/bloodGroup.ts";
import { DonationVolume } from "../values-object/donationVolume.ts";
import { DonationType } from "../values-object/donationType.ts";

export interface Donation {
    id: string;
    candidateId: string;
    donatedAt: Date;
    bloodGroup: BloodGroup;
    volume: DonationVolume;
    donationType: DonationType;
    bagExpiresAt: Date;
}