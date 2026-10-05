import type { CollectionRepository } from "../../../domain/ports/collectionRepository.ts";

export interface CancelAppointmentCommand {
    appointmentId: string;
    collectionId: string;
}

export type CancelAppointmentResult =
    | { status: "not-found" }
    | { status: "cancelled"; appointmentId: string };

export class CancelAppointmentHandler {
    constructor(
        private readonly collections: CollectionRepository,
    ) {}

    async handle(
        command: CancelAppointmentCommand,
    ): Promise<CancelAppointmentResult> {
        const collection = await this.collections.byId(command.collectionId);

        if (!collection) {
            return { status: "not-found" };
        }

        try {
            collection.cancel(command.appointmentId);
        } catch (error) {
            if (
                error instanceof Error &&
                error.message === "appointment not found"
            ) {
                return { status: "not-found" };
            }

            throw error;
        }

        await this.collections.save(collection);

        return {
            status: "cancelled",
            appointmentId: command.appointmentId,
        };
    }
}