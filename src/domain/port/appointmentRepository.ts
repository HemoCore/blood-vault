import { Appointment } from "../appointment";

export interface AppointmentRepository {
    findByCollection(collectionId: string): Promise<Appointment[]>;
    findByCandidateAndCollection(candidateId: string, collectionId: string): Promise<Appointment[]>;
    add(appointment: Appointment): Promise<void>;
    remove(appointmentId: string): Promise<boolean>;
}