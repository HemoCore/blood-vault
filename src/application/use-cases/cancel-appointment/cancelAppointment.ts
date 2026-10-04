import type { AppointmentRepository } from "../../../domain/port/appointmentRepository.ts";

export interface CancelAppointmentCommand {
    appointmentId: string;
}

export type CancelAppointmentResult =
    | { status: "not-found" }
    | { status: "cancelled"; appointmentId: string };

export class CancelAppointmentHandler {
    constructor(private readonly appointments: AppointmentRepository) {}

    async handle(command: CancelAppointmentCommand): Promise<CancelAppointmentResult> {
        const wasRemoved = await this.appointments.remove(command.appointmentId);

        if (!wasRemoved) {
            return { status: "not-found" };
        }

        return { status: "cancelled", appointmentId: command.appointmentId };
    }
}