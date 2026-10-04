import assert from "node:assert/strict";
import { test } from "node:test";

import { BloodGroup } from "../../../domain/bloodGroup.ts";
import type { Candidate } from "../../../domain/candidate.ts";
import { Email } from "../../../domain/email.ts";
import { Weight } from "../../../domain/weight.ts";
import { inMemoryCandidateRepository } from "../../../infrastructure/in-memory/inMemoryCandidateRepository.ts";
import { InMemoryAppointmentRepository } from "../../../infrastructure/in-memory/inMemoryAppointmentRepository.ts";
import { BookAppointmentHandler } from "../record-appointement/registerAppointment.ts";
import { CancelAppointmentHandler } from "./cancelAppointment.ts";

const TODAY = new Date("2026-10-03");
const clock = { now: () => TODAY };

const CANDIDATE: Candidate = {
    id: "candidate-1",
    email: Email.of("donor@example.com"),
    age: 30,
    weight: Weight.of(65),
    sexe: "male",
    annualDonations: 0,
    lastDonationAt: null,
    bloodGroup: BloodGroup.of("O+"),
};

test("cancelling an appointment frees the slot", async () => {
    const candidates = inMemoryCandidateRepository([CANDIDATE]);
    const appointments = new InMemoryAppointmentRepository();
    const bookHandler = new BookAppointmentHandler(candidates, appointments, clock);
    const cancelHandler = new CancelAppointmentHandler(appointments);
    
    const collectionId = "collection-1";
    const maxSlots = 1;

    const bookResult = await bookHandler.handle({
        collectionId,
        candidateId: CANDIDATE.id,
        maxSlots,
    });
    
    assert.equal(bookResult.status, "booked");
    if (bookResult.status !== "booked") return; 
    
    const appointmentId = bookResult.appointmentId;
    assert.equal((await appointments.findByCollection(collectionId)).length, 1);

    const cancelResult = await cancelHandler.handle({ appointmentId });
    assert.equal(cancelResult.status, "cancelled");

    const remainingAppointments = await appointments.findByCollection(collectionId);
    assert.equal(remainingAppointments.length, 0);

    const candidate2: Candidate = {
        ...CANDIDATE,
        id: "candidate-2",
        email: Email.of("donor2@example.com"),
    };
    await candidates.save(candidate2);

    const newBookResult = await bookHandler.handle({
        collectionId,
        candidateId: candidate2.id,
        maxSlots,
    });
    
    assert.equal(newBookResult.status, "booked"); 
});

test("cancelling a non-existent appointment returns not-found", async () => {
    const appointments = new InMemoryAppointmentRepository();
    const cancelHandler = new CancelAppointmentHandler(appointments);
    
    const result = await cancelHandler.handle({ appointmentId: "fake-appointment-id" });
    
    assert.equal(result.status, "not-found");
});