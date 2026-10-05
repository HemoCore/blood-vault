import { Donation } from "../models/donation.ts";

export interface DonationRepository {
    all(): Promise<Donation[]>;
    add(donation: Donation): Promise<void>;
}