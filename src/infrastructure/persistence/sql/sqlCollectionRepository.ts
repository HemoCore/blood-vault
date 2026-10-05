// src/infrastructure/persistence/sql/sqlCollectionRepository.ts

import type { Collection } from "../../../domain/models/collect.ts";
import type { CollectionRepository } from "../../../domain/ports/collectionRepository.ts";

import { sql } from "./database.ts";
import {
    toCollection,
    toCollectionRow,
    toAppointmentRow,
    type CollectionRow,
    type AppointmentRow,
} from "./collectionMapper.ts";

export class SqlCollectionRepository implements CollectionRepository {

    async byId(id: string): Promise<Collection | undefined> {
        const collectionRows = await sql<CollectionRow[]>`
            SELECT id, name, location, max_slots, created_at
            FROM collections
            WHERE id = ${id}
        `;

        if (collectionRows.length === 0) {
            return undefined;
        }

        const appointmentRows = await sql<AppointmentRow[]>`
            SELECT id, collection_id, candidate_id, booked_at
            FROM appointments
            WHERE collection_id = ${id}
        `;

        return toCollection(
            collectionRows[0],
            appointmentRows,
        );
    }

    async save(collection: Collection): Promise<void> {
        const collectionRow = toCollectionRow(collection);

        await sql.begin(async (transaction) => {
            await transaction`
                INSERT INTO collections (
                    id,
                    name,
                    location,
                    max_slots,
                    created_at
                )
                VALUES (
                    ${collectionRow.id},
                    ${collectionRow.name},
                    ${collectionRow.location},
                    ${collectionRow.max_slots},
                    ${collectionRow.created_at}
                )
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    location = EXCLUDED.location,
                    max_slots = EXCLUDED.max_slots,
                    created_at = EXCLUDED.created_at
            `;

            await transaction`
                DELETE FROM appointments
                WHERE collection_id = ${collection.id}
            `;

            for (const appointment of collection.appointments) {
                const appointmentRow = toAppointmentRow(appointment);

                await transaction`
                    INSERT INTO appointments (
                        id,
                        collection_id,
                        candidate_id,
                        booked_at
                    )
                    VALUES (
                        ${appointmentRow.id},
                        ${appointmentRow.collection_id},
                        ${appointmentRow.candidate_id},
                        ${appointmentRow.booked_at}
                    )
                `;
            }
        });
    }
}