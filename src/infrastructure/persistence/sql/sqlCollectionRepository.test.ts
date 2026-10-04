import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto"; // <-- Ajout pour un ID unique
import { SqlCollectionRepository } from "./sqlCollectionRepository.ts";
import { SqlAppointmentRepository } from "./sqlAppointmentRepository.ts";
import {initializeDatabase, cleanDatabase, closeDatabase} from "./database.ts";
import {Collection} from "../../../domain/collect.ts";
import { Appointment } from "../../../domain/appointment.ts";

const collectionRepo = new SqlCollectionRepository();
const appointmentRepo = new SqlAppointmentRepository();

// On génère un ID unique pour ce test pour éviter toute collision avec d'autres tests
const TEST_ID = `col-test-${randomUUID()}`;

const TEST_COLLECTION: Collection = {
    id: TEST_ID,
    name: "Mairie de Paris",
    location: "Paris",
    maxSlots: 40,
    createdAt: new Date("2026-10-03")
};

before(async () => {
    await initializeDatabase();
    await cleanDatabase();
});

after(async () => {
    await cleanDatabase();
    await closeDatabase();
});

test("US10: saves a collection and reads it back with its appointments", async () => {
    // 1. On enregistre la collecte
    await collectionRepo.save(TEST_COLLECTION);

    // 2. On enregistre un rendez-vous pour cette collecte
    const appointment: Appointment = {
        id: `apt-test-${randomUUID()}`,
        collectionId: TEST_ID,
        candidateId: "candidate-1",
        bookedAt: new Date("2026-10-03T10:00:00Z"),
    };
    await appointmentRepo.add(appointment);

    // 3. On relit la collecte AVEC ses rendez-vous
    const result = await collectionRepo.findByIdWithAppointments(TEST_ID);

    // 4. Vérifications
    assert.ok(result, "La collecte devrait être trouvée");
    assert.equal(result.name, "Mairie de Paris");
    assert.equal(result.appointments.length, 1, "Devrait avoir exactement 1 rendez-vous");
    assert.equal(result.appointments[0].candidateId, "candidate-1");
});

test("US10: returns undefined for unknown collection", async () => {
    const result = await collectionRepo.findByIdWithAppointments("inexistant");
    assert.equal(result, undefined);
});