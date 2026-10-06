import { sql } from "./database.ts";

import type { Candidate } from "../../../domain/models/candidate.ts";
import type { CandidateRepository } from "../../../domain/ports/candidateRepository.ts";

import { BloodGroup } from "../../../domain/values-object/bloodGroup.ts";
import { Email } from "../../../domain/values-object/email.ts";
import { Weight } from "../../../domain/values-object/weight.ts";

export class SqlCandidateRepository
    implements CandidateRepository
{
    async byId(
        id: string,
    ): Promise<Candidate | undefined> {
        const rows = await sql<any[]>`
            SELECT *
            FROM candidates
            WHERE id = ${id}
        `;

        if (rows.length === 0) {
            return undefined;
        }

        return this.mapToCandidate(rows[0]);
    }

    async save(
        candidate: Candidate,
    ): Promise<void> {
        await sql`
            INSERT INTO candidates (
                id,
                email,
                age,
                weight_kg,
                sexe,
                annual_donations,
                last_donation_at,
                blood_group
            )
            VALUES (
                ${candidate.id},
                ${candidate.email.toString()},
                ${candidate.age},
                ${candidate.weight.toKg()},
                ${candidate.sexe},
                ${candidate.annualDonations},
                ${candidate.lastDonationAt},
                ${candidate.bloodGroup.toString()}
            )
            ON CONFLICT (id) DO UPDATE SET
                email = EXCLUDED.email,
                age = EXCLUDED.age,
                weight_kg = EXCLUDED.weight_kg,
                sexe = EXCLUDED.sexe,
                annual_donations = EXCLUDED.annual_donations,
                last_donation_at = EXCLUDED.last_donation_at,
                blood_group = EXCLUDED.blood_group
        `;
    }

    async byBloodGroup(
        bloodGroup: BloodGroup,
    ): Promise<Candidate[]> {
        const rows = await sql<any[]>`
            SELECT *
            FROM candidates
            WHERE blood_group = ${bloodGroup.toString()}
        `;

        return rows.map((row) =>
            this.mapToCandidate(row)
        );
    }

    async all(): Promise<Candidate[]> {
        const rows = await sql<any[]>`
            SELECT *
            FROM candidates
        `;

        return rows.map((row) =>
            this.mapToCandidate(row)
        );
    }

    private mapToCandidate(row: any): Candidate {
        return {
            id: row.id,
            email: Email.of(row.email),
            age: row.age,
            weight: Weight.of(row.weight_kg),
            sexe: row.sexe,
            annualDonations: row.annual_donations,
            lastDonationAt: row.last_donation_at
                ? new Date(row.last_donation_at)
                : null,
            bloodGroup: BloodGroup.of(
                row.blood_group,
            ),
        };
    }
}