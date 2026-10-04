import {Collection} from "../collect.ts";
import { Appointment } from "../appointment.ts";

// Us 10  says that une collecte est relue avec ses rendez vous
export interface CollectionWithAppointments extends Collection {
    appointments: Appointment[];
}

export interface CollectionRepository {
    save(collection: Collection): Promise<void>;
    findByIdWithAppointments(id: string): Promise<CollectionWithAppointments | undefined>;
}