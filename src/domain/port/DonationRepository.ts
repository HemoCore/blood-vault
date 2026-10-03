import { Donation } from "../donation";

export interface DonationRepository {
    all(): Promise<Donation[]>;
    add(donation: Donation): Promise<void>;
}