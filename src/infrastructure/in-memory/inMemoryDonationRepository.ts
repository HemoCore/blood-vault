import { DonationRepository } from "../../domain/port/DonationRepository";
import { Donation } from "../../domain/donation";

export function inMemoryDonationRepository(): DonationRepository {
    const rows: Donation[] = [];
    return {
        async add(donation): Promise<void> {
            rows.push(donation);
        },
        async all(): Promise<Donation[]> {
            return [...rows];
        },
    };
};