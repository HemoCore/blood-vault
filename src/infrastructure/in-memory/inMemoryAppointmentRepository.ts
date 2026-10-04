import { Appointment } from "../../domain/appointment";
import { AppointmentRepository } from "../../domain/port/appointmentRepository";

export class InMemoryAppointmentRepository implements AppointmentRepository {
    private appointments: Map<string, Appointment> = new Map();

    async findByCollection(collectionId: string): Promise<Appointment[]> {
        return Array.from(this.appointments.values()).filter(
            (apt) => apt.collectionId === collectionId
        );
    }

    async findByCandidateAndCollection(
        candidateId: string,
        collectionId: string
    ): Promise<Appointment[]> {
        return Array.from(this.appointments.values()).filter(
            (appointment) =>
                appointment.candidateId === candidateId &&
                appointment.collectionId === collectionId
        );
    }

    async add(appointment: Appointment): Promise<void> {
        this.appointments.set(appointment.id, appointment);
    }

    async remove(appointmentId: string): Promise<boolean> {
      return this.appointments.delete(appointmentId); 
    }

}