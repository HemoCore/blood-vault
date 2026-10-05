import assert from "node:assert/strict";
import { test } from "node:test";

import { BloodGroup } from "../../../domain/values-object/bloodGroup.ts";
import type { Candidate } from "../../../domain/models/candidate.ts";
import { Collection } from "../../../domain/models/collect.ts";
import { Email } from "../../../domain/values-object/email.ts";
import { Weight } from "../../../domain/values-object/weight.ts";

import { inMemoryCandidateRepository } from "../../../infrastructure/in-memory/inMemoryCandidateRepository.ts";
import { inMemoryCollectionRepository } from "../../../infrastructure/in-memory/inMemoryCollectionRepository.ts";

import { BookAppointmentHandler } from "../record-appointement/registerAppointment.ts";
import { CancelAppointmentHandler } from "./cancelAppointment.ts";

const TODAY = new Date("2026-10-03");
const clock = { now: () => TODAY };

function sequentialIds() {
    let current = 0;
    return { next: () => `appointment-${++current}` };
}

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

    const collection = new Collection({
        id: "collection-1",
        name: "Blood donation collection",
        location: "Town hall",
        maxSlots: 1,
        createdAt: TODAY,
    });

    const collections = inMemoryCollectionRepository([collection]);

    const bookHandler = new BookAppointmentHandler(
        candidates,
        collections,
        clock,
        sequentialIds(),
    );

    const cancelHandler = new CancelAppointmentHandler(collections);

    const bookResult = await bookHandler.handle({
        collectionId: collection.id,
        candidateId: CANDIDATE.id,
    });

    assert.equal(bookResult.status, "booked");

    if (bookResult.status !== "booked") {
        return;
    }

    const appointmentId = bookResult.appointmentId;

    const collectionAfterBooking = await collections.byId(collection.id);

    assert.equal(collectionAfterBooking?.appointments.length, 1);
    assert.equal(collectionAfterBooking?.slotsLeft, 0);

    const cancelResult = await cancelHandler.handle({
        collectionId: collection.id,
        appointmentId,
    });

    assert.equal(cancelResult.status, "cancelled");

    const collectionAfterCancellation = await collections.byId(collection.id);

    assert.equal(collectionAfterCancellation?.appointments.length, 0);
    assert.equal(collectionAfterCancellation?.slotsLeft, 1);

    const candidate2: Candidate = {
        ...CANDIDATE,
        id: "candidate-2",
        email: Email.of("donor2@example.com"),
    };

    await candidates.save(candidate2);

    const newBookResult = await bookHandler.handle({
        collectionId: collection.id,
        candidateId: candidate2.id,
    });

    assert.equal(newBookResult.status, "booked");
});

test("cancelling a non-existent appointment returns not-found", async () => {
    const collection = new Collection({
        id: "collection-1",
        name: "Blood donation collection",
        location: "Town hall",
        maxSlots: 40,
        createdAt: TODAY,
    });

    const collections = inMemoryCollectionRepository([collection]);

    const cancelHandler = new CancelAppointmentHandler(collections);

    const result = await cancelHandler.handle({
        collectionId: collection.id,
        appointmentId: "fake-appointment-id",
    });

    assert.equal(result.status, "not-found");
});