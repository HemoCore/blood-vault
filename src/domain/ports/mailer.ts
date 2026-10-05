import { Email } from "../values-object/email.ts";
import { BloodGroup } from "../values-object/bloodGroup.ts";

export interface DonorCard {
    donorId: string;
    bloodGroup: BloodGroup;
}

export interface Mailer {
    sendDonorCard(to: Email, card: DonorCard): Promise<void>;
}