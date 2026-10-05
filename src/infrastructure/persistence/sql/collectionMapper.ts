import { Collection } from "../../../domain/collect.ts";
import type { Appointment } from "../../../domain/appointment.ts";

export interface CollectionRow {
    id: string;
    name: string;
    location: string;
    max_slots: number;
    created_at: string;
}

export interface AppointmentRow {
    id: string;
    collection_id: string;
    candidate_id: string;
    booked_at: string;
}

/**
 * Le modèle métier vers les lignes SQL.
 * C'est ici que le métier devient plat.
 */
export function toCollectionRow(collection: Collection): CollectionRow {
    return {
        id: collection.id,
        name: collection.name,
        location: collection.location,
        max_slots: collection.maxSlots,
        created_at: collection.createdAt.toISOString(),
    };
}

export function toAppointmentRow(
    appointment: Appointment,
): AppointmentRow {
    return {
        id: appointment.id,
        collection_id: appointment.collectionId,
        candidate_id: appointment.candidateId,
        booked_at: appointment.bookedAt.toISOString(),
    };
}

/**
 * Les lignes SQL vers le modèle métier,
 * qui reste libre de les refuser.
 */
export function toCollection(
    row: CollectionRow,
    appointmentRows: AppointmentRow[],
): Collection {
    const appointments: Appointment[] = appointmentRows.map((appointmentRow) => ({
        id: appointmentRow.id,
        collectionId: appointmentRow.collection_id,
        candidateId: appointmentRow.candidate_id,
        bookedAt: new Date(appointmentRow.booked_at),
    }));

    return new Collection({
        id: row.id,
        name: row.name,
        location: row.location,
        maxSlots: row.max_slots,
        createdAt: new Date(row.created_at),
        appointments,
    });
}