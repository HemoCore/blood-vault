import { DonationRepository } from "../../domain/port/DonationRepository";
import { Donation } from "../../domain/donation";

export function inMemoryDonationRepository(): DonationRepository {
    const rows: Donation[] = [];
    return {
        async add(booking): Promise<void> {
            rows.push(booking);
        },
        async all(): Promise<Donation[]> {
            return [...rows];
        },
    };
};