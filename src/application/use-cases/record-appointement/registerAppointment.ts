import { randomUUID } from "node:crypto";
import type { CandidateRepository } from "../../../domain/port/candidateRepository.ts";
import type { AppointmentRepository } from "../../../domain/port/appointmentRepository.ts";
import type { Clock } from "../../../domain/port/clock.ts";

export interface BookAppointmentCommand {
    collectionId: string;
    candidateId: string;
    maxSlots: number;
}

export type BookAppointmentResult =
  | { status: "not-found" }
  | { status: "no-slots-left" }
  | { status: "already-booked" }
  | { status: "booked"; appointmentId: string };

export class BookAppointmentHandler {
    constructor(
        private readonly candidates: CandidateRepository,
        private readonly appointments: AppointmentRepository,
        private readonly clock: Clock,
    ) {}

    async handle(command: BookAppointmentCommand): Promise<BookAppointmentResult> {
        const { collectionId, candidateId, maxSlots } = command;

        const candidate = await this.candidates.byId(candidateId);
        if (!candidate) return { status: "not-found" };

        const existingAppointments = await this.appointments.findByCandidateAndCollection(candidateId, collectionId);
        if (existingAppointments?.length > 0) return { status: "already-booked" };


        const collectionAppointments = await this.appointments.findByCollection(collectionId);
        if (collectionAppointments.length >= maxSlots) return { status: "no-slots-left" };

        const appointmentId = randomUUID();
        await this.appointments.add({
            id: appointmentId,
            collectionId,
            candidateId,
            bookedAt: this.clock.now(),
        });

        return { status: "booked", appointmentId };
    }
}