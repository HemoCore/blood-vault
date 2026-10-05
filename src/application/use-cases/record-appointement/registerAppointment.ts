import { randomUUID } from "node:crypto";
import type { CandidateRepository } from "../../../domain/port/candidateRepository.ts";
import type { CollectionRepository } from "../../../domain/port/collectionRepository.ts";
import type { Clock } from "../../../domain/port/clock.ts";

export interface BookAppointmentCommand {
    collectionId: string;
    candidateId: string;
}

export type BookAppointmentResult =
    | { status: "not-found" }
    | { status: "no-slots-left" }
    | { status: "already-booked" }
    | { status: "booked"; appointmentId: string };

export class BookAppointmentHandler {
    constructor(
        private readonly candidates: CandidateRepository,
        private readonly collections: CollectionRepository,
        private readonly clock: Clock,
    ) {}

    async handle(
        command: BookAppointmentCommand,
    ): Promise<BookAppointmentResult> {
        const { collectionId, candidateId } = command;

        const candidate = await this.candidates.byId(candidateId);

        if (!candidate) {
            return { status: "not-found" };
        }

        const collection = await this.collections.byId(collectionId);

        if (!collection) {
            return { status: "not-found" };
        }

        const appointmentId = randomUUID();

        try {
            collection.book({
                id: appointmentId,
                collectionId,
                candidateId,
                bookedAt: this.clock.now(),
            });
        } catch (error) {
            if (
                error instanceof Error &&
                error.message === "candidate already booked"
            ) {
                return { status: "already-booked" };
            }

            if (
                error instanceof Error &&
                error.message === "collection is full"
            ) {
                return { status: "no-slots-left" };
            }

            throw error;
        }

        await this.collections.save(collection);

        return {
            status: "booked",
            appointmentId,
        };
    }
}