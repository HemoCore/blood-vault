import assert from "node:assert/strict";
import { test } from "node:test";

import type { Appointment } from "./appointment.ts";
import { Collection } from "./collect.ts";

const DAY = new Date("2026-10-03");

function aCollection(maxSlots = 40, appointments: Appointment[] = []): Collection {
    return new Collection({
        id: "col-1",
        name: "Collecte de la mairie",
        location: "Mairie de Senlis",
        maxSlots,
        createdAt: DAY,
        appointments,
    });
}

function anAppointment(n: number): Appointment {
    return {
        id: `app-${n}`,
        collectionId: "col-1",
        candidateId: `candidate-${n}`,
        bookedAt: DAY,
    };
}

test("the 41st appointment is refused, and the collection does not change", () => {
    const collection = aCollection(40);
    for (let i = 1; i <= 40; i++) collection.book(anAppointment(i));

    assert.throws(() => collection.book(anAppointment(41)), /full/);
    assert.equal(collection.appointments.length, 40);
    assert.equal(collection.slotsLeft, 0);
});

test("a donor never has two appointments in the same collection", () => {
    const collection = aCollection();
    collection.book(anAppointment(1));

    assert.throws(() => collection.book({ ...anAppointment(1), id: "app-other" }), /already booked/);
    assert.equal(collection.appointments.length, 1);
});

test("a cancelled appointment frees its slot", () => {
    const collection = aCollection(1);
    collection.book(anAppointment(1));

    collection.cancel("app-1");
    collection.book(anAppointment(2));

    assert.deepEqual(
        collection.appointments.map((a) => a.candidateId),
        ["candidate-2"],
    );
});

test("cancelling an unknown appointment is refused, and the collection does not change", () => {
    const collection = aCollection();
    collection.book(anAppointment(1));

    assert.throws(() => collection.cancel("app-unknown"), /not found/);
    assert.equal(collection.appointments.length, 1);
});

test("nobody adds an appointment behind the collection's back", () => {
    const collection = aCollection();

    (collection.appointments as Appointment[]).push(anAppointment(1));

    assert.equal(collection.appointments.length, 0);
    assert.equal(collection.slotsLeft, 40);
});

test("a collection is read back with its appointments", () => {
    const collection = aCollection(40, [anAppointment(1), anAppointment(2)]);

    assert.equal(collection.appointments.length, 2);
    assert.equal(collection.slotsLeft, 38);
});

test("a collection cannot be created with more appointments than slots", () => {
    assert.throws(() => aCollection(1, [anAppointment(1), anAppointment(2)]), /full/);
});