import { Candidate } from "../../../domain/candidate";
import { CandidateRepository } from "../../../domain/port/candidateRepository";
import { InMemoryAppointmentRepository } from "../../../infrastructure/in-memory/inMemoryAppointmentRepository";
import { inMemoryCandidateRepository } from "../../../infrastructure/in-memory/inMemoryCandidateRepository";
import { BookAppointmentHandler } from "./registerAppointment"; // Assurez-vous du nom du fichier
import { describe, test } from "node:test";
import { Email } from "../../../domain/email";
import { Weight } from "../../../domain/weight";
import { BloodGroup } from "../../../domain/bloodGroup";
import assert from "node:assert/strict";

const TODAY = new Date("2026-10-03");
const clock = { now: () => TODAY };

const CANDIDATE_1: Candidate = {
    id: "candidate-1",
    email: Email.of("donor1@example.com"),
    age: 30,
    weight: Weight.of(65),
    sexe: "male",
    annualDonations: 0,
    lastDonationAt: null,
    bloodGroup: BloodGroup.of("O+"),
};

test("books an appointment when slots are available", async () => {
    const candidates = inMemoryCandidateRepository([CANDIDATE_1]);
    const appointments = new InMemoryAppointmentRepository();
    const handler = new BookAppointmentHandler(candidates, appointments, clock);
    const collectionId = "collection-1";
    const maxSlots = 40;

    const result = await handler.handle({
        collectionId,
        candidateId: CANDIDATE_1.id,
        maxSlots,
    });

    assert.equal(result.status, "booked");
    
    const savedAppointments = await appointments.findByCollection(collectionId);
    assert.equal(savedAppointments.length, 1);
    assert.equal(savedAppointments[0].candidateId, "candidate-1");
    assert.equal(savedAppointments[0].collectionId, "collection-1");
    assert.equal(savedAppointments[0].bookedAt.getTime(), TODAY.getTime());
});

test("refuses the 41st appointment on a 40-slot collection", async () => {
    const candidates = inMemoryCandidateRepository();
    const appointments = new InMemoryAppointmentRepository();
    const handler = new BookAppointmentHandler(candidates, appointments, clock);
    const collectionId = "collection-full";
    const maxSlots = 40;

    for (let i = 1; i <= 40; i++) {
        const candidate: Candidate = {
            id: `candidate-${i}`,
            email: Email.of(`donor${i}@example.com`),
            age: 30,
            weight: Weight.of(65),
            sexe: "male",
            annualDonations: 0,
            lastDonationAt: null,
            bloodGroup: BloodGroup.of("O+"),
        };
        await candidates.save(candidate);
        await handler.handle({
            collectionId,
            candidateId: candidate.id,
            maxSlots,
        });
    }

    const candidate41: Candidate = {
        id: "candidate-41",
        email: Email.of("donor41@example.com"),
        age: 30,
        weight: Weight.of(65),
        sexe: "male",
        annualDonations: 0,
        lastDonationAt: null,
        bloodGroup: BloodGroup.of("O+"),
    };
    await candidates.save(candidate41);
    
    const result = await handler.handle({
        collectionId,
        candidateId: candidate41.id,
        maxSlots,
    });

    assert.equal(result.status, "no-slots-left");
    
    const savedAppointments = await appointments.findByCollection(collectionId);
    assert.equal(savedAppointments.length, 40);
});

test("refuses if candidate already has an appointment in this collection", async () => {
    const candidates = inMemoryCandidateRepository([CANDIDATE_1]);
    const appointments = new InMemoryAppointmentRepository();
    const handler = new BookAppointmentHandler(candidates, appointments, clock);
    const collectionId = "collection-1";
    const maxSlots = 40;

    await handler.handle({
        collectionId,
        candidateId: CANDIDATE_1.id,
        maxSlots,
    });

    const result = await handler.handle({
        collectionId,
        candidateId: CANDIDATE_1.id,
        maxSlots,
    });

    assert.equal(result.status, "already-booked");
    
    const savedAppointments = await appointments.findByCollection(collectionId);
    assert.equal(savedAppointments.length, 1);
});