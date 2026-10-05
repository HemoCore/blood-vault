// src/infrastructure/persistence/sql/sqlCollectionRepository.ts
import { sql } from "./database.ts";
import { CollectionRepository, CollectionWithAppointments } from "../../../domain/port/collectionRepository.ts";
import {Collection} from "../../../domain/collect.ts";
import { Appointment } from "../../../domain/appointment.ts";

export class SqlCollectionRepository implements CollectionRepository {

    async save(collection: Collection): Promise<void> {
        await sql`
      INSERT INTO collections (id, name, location, max_slots)
      VALUES (${collection.id}, ${collection.name}, ${collection.location}, ${collection.maxSlots})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        location = EXCLUDED.location,
        max_slots = EXCLUDED.max_slots
    `;
    }

    async findByIdWithAppointments(id: string): Promise<CollectionWithAppointments | undefined> {
        // 1. Récupérer la collecte
        const collections = await sql<Collection[]>`SELECT * FROM collections WHERE id = ${id}`;
        if (collections.length === 0) return undefined;

        // 2. Récupérer ses rendez-vous
        const rows = await sql`SELECT * FROM appointments WHERE collection_id = ${id}`;
        const appointments: Appointment[] = rows.map(row => ({
            id: row.id,
            collectionId: row.collection_id,
            candidateId: row.candidate_id,
            bookedAt: new Date(row.booked_at)
        }));

        // 3. Retourner le tout assemblé (US 10)
        return {
            ...collections[0],
            appointments
        };
    }
}