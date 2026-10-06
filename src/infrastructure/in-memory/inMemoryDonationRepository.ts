import { DonationRepository } from "../../domain/ports/DonationRepository";
import { Donation } from "../../domain/models/donation.ts";

export function inMemoryDonationRepository(): DonationRepository {
    const rows: Donation[] = [];

    return {
        async add(donation): Promise<void> {
            rows.push(donation);
        },

        async all(): Promise<Donation[]> {
            return [...rows];
        },

        async remove(id: string): Promise<void> {
            const index = rows.findIndex(
                (donation) => donation.id === id
            );

            if (index !== -1) {
                rows.splice(index, 1);
            }
        },
    };
}