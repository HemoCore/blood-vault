
import type { Appointment } from "./appointment.ts";

interface CollectionProps {
    id: string;
    name: string;
    location: string;
    maxSlots: number;
    createdAt: Date;
    appointments?: Appointment[];
}

export class Collection {
    readonly id: string;
    readonly name: string;
    readonly location: string;
    readonly createdAt: Date;

    private readonly maxSlotsValue: number;
    private readonly appointmentsValue: Appointment[];

    constructor({
                    id,
                    name,
                    location,
                    maxSlots,
                    createdAt,
                    appointments = [],
                }: CollectionProps) {
        if (appointments.length > maxSlots) {
            throw new Error("collection is full");
        }

        this.id = id;
        this.name = name;
        this.location = location;
        this.createdAt = createdAt;
        this.maxSlotsValue = maxSlots;
        this.appointmentsValue = [...appointments];
    }

    get maxSlots(): number {
        return this.maxSlotsValue;
    }

    get slotsLeft(): number {
        return this.maxSlotsValue - this.appointmentsValue.length;
    }

    get appointments(): ReadonlyArray<Appointment> {
        return [...this.appointmentsValue];
    }

    book(appointment: Appointment): void {
        const alreadyBooked = this.appointmentsValue.some(
            (existing) => existing.candidateId === appointment.candidateId,
        );

        if (alreadyBooked) {
            throw new Error("candidate already booked");
        }

        if (this.slotsLeft <= 0) {
            throw new Error("collection is full");
        }

        this.appointmentsValue.push(appointment);
    }

    cancel(appointmentId: string): void {
        const index = this.appointmentsValue.findIndex(
            (appointment) => appointment.id === appointmentId,
        );

        if (index === -1) {
            throw new Error("appointment not found");
        }

        this.appointmentsValue.splice(index, 1);
    }
}

