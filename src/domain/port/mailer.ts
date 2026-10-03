import { Email } from "../email";
import { BloodGroup } from "../bloodGroup";

export interface DonorCard {
    donorId: string;
    bloodGroup: BloodGroup;
}

export interface Mailer {
    sendDonorCard(to: Email, card: DonorCard): Promise<void>;
}