import assert from "node:assert/strict";
import { test } from "node:test";

import type { Candidate } from "../../../domain/candidate";
import { Collection } from "../../../domain/collect"
import { Email } from "../../../domain/email";
import { Weight } from "../../../domain/weight";
import { BloodGroup } from "../../../domain/bloodGroup";

import { inMemoryCandidateRepository } from "../../../infrastructure/in-memory/inMemoryCandidateRepository";
import { inMemoryCollectionRepository } from "../../../infrastructure/in-memory/inMemoryCollectionRepository";

import { BookAppointmentHandler } from "./registerAppointment";

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

    const collection = new Collection({
        id: "collection-1",
        name: "Blood donation collection",
        location: "Town hall",
        maxSlots: 40,
        createdAt: TODAY,
    });

    const collections = inMemoryCollectionRepository([collection]);

    const handler = new BookAppointmentHandler(
        candidates,
        collections,
        clock,
    );

    const result = await handler.handle({
        collectionId: collection.id,
        candidateId: CANDIDATE_1.id,
    });

    assert.equal(result.status, "booked");

    const savedCollection = await collections.byId(collection.id);

    assert.equal(savedCollection?.appointments.length, 1);
    assert.equal(
        savedCollection?.appointments[0].candidateId,
        "candidate-1",
    );
    assert.equal(
        savedCollection?.appointments[0].collectionId,
        "collection-1",
    );
    assert.equal(
        savedCollection?.appointments[0].bookedAt.getTime(),
        TODAY.getTime(),
    );
});

test("refuses the 41st appointment on a 40-slot collection", async () => {
    const candidates = inMemoryCandidateRepository();

    const collection = new Collection({
        id: "collection-full",
        name: "Blood donation collection",
        location: "Town hall",
        maxSlots: 40,
        createdAt: TODAY,
    });

    const collections = inMemoryCollectionRepository([collection]);

    const handler = new BookAppointmentHandler(
        candidates,
        collections,
        clock,
    );

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

        const result = await handler.handle({
            collectionId: collection.id,
            candidateId: candidate.id,
        });

        assert.equal(result.status, "booked");
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
        collectionId: collection.id,
        candidateId: candidate41.id,
    });

    assert.equal(result.status, "no-slots-left");

    const savedCollection = await collections.byId(collection.id);

    assert.equal(savedCollection?.appointments.length, 40);
    assert.equal(savedCollection?.slotsLeft, 0);
});

test("refuses if candidate already has an appointment in this collection", async () => {
    const candidates = inMemoryCandidateRepository([CANDIDATE_1]);

    const collection = new Collection({
        id: "collection-1",
        name: "Blood donation collection",
        location: "Town hall",
        maxSlots: 40,
        createdAt: TODAY,
    });

    const collections = inMemoryCollectionRepository([collection]);

    const handler = new BookAppointmentHandler(
        candidates,
        collections,
        clock,
    );

    const firstResult = await handler.handle({
        collectionId: collection.id,
        candidateId: CANDIDATE_1.id,
    });

    assert.equal(firstResult.status, "booked");

    const result = await handler.handle({
        collectionId: collection.id,
        candidateId: CANDIDATE_1.id,
    });

    assert.equal(result.status, "already-booked");

    const savedCollection = await collections.byId(collection.id);

    assert.equal(savedCollection?.appointments.length, 1);
    assert.equal(savedCollection?.slotsLeft, 39);
});