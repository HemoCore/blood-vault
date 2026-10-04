import { randomUUID } from "node:crypto";

export interface Appointment {
    id: string;
    collectionId: string;
    candidateId: string;
    bookedAt: Date;
}

export function createAppointment(
    collectionId: string,
    candidateId: string
): Appointment {
    return {
        id: randomUUID(),
        collectionId,
        candidateId,
        bookedAt: new Date(),
    };
}