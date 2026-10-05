import { sql } from "./database.ts";
import { AppointmentRepository } from "../../../domain/port/appointmentRepository.ts";
import { Appointment } from "../../../domain/appointment.ts";

export class SqlAppointmentRepository implements AppointmentRepository {

    async findByCollection(collectionId: string): Promise<Appointment[]> {
        const rows = await sql`SELECT * FROM appointments WHERE collection_id = ${collectionId}`;
        return rows.map(this.toDomain);
    }

    async findByCandidateAndCollection(candidateId: string, collectionId: string): Promise<Appointment[]> {
        const rows = await sql`SELECT * FROM appointments WHERE candidate_id = ${candidateId} AND collection_id = ${collectionId}`;
        return rows.map(this.toDomain);
    }

    async add(appointment: Appointment): Promise<void> {
        await sql`
      INSERT INTO appointments (id, collection_id, candidate_id, booked_at)
      VALUES (${appointment.id}, ${appointment.collectionId}, ${appointment.candidateId}, ${appointment.bookedAt})
    `;
    }

    async remove(appointmentId: string): Promise<boolean> {
        const result = await sql`DELETE FROM appointments WHERE id = ${appointmentId}`;
        return result.count === 1;
    }

    private toDomain(row: any): Appointment {
        return {
            id: row.id,
            collectionId: row.collection_id,
            candidateId: row.candidate_id,
            bookedAt: new Date(row.booked_at)
        };
    }
}