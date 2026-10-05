import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import { SqlCollectionRepository } from "./sqlCollectionRepository.ts";
import {
    initializeDatabase,
    cleanDatabase,
    closeDatabase,
} from "./database.ts";

import { Collection } from "../../../domain/models/collect.ts";

const collectionRepo = new SqlCollectionRepository();

before(async () => {
    await initializeDatabase();
    await cleanDatabase();
});

after(async () => {
    await cleanDatabase();
    await closeDatabase();
});

test("US10: saves a collection and reads it back with its appointments", async () => {
    const collectionId = `col-test-${randomUUID()}`;

    // 1. Création de l'agrégat
    const collection = new Collection({
        id: collectionId,
        name: "Mairie de Paris",
        location: "Paris",
        maxSlots: 40,
        createdAt: new Date("2026-10-03"),
    });

    // 2. Le rendez-vous est ajouté via l'agrégat
    collection.book({
        id: `apt-test-${randomUUID()}`,
        collectionId,
        candidateId: "candidate-1",
        bookedAt: new Date("2026-10-03T10:00:00Z"),
    });

    // 3. On sauvegarde l'agrégat complet
    await collectionRepo.save(collection);

    // 4. On le relit
    const result = await collectionRepo.byId(collectionId);

    // 5. Vérifications
    assert.ok(result, "La collecte devrait être trouvée");

    assert.equal(result.name, "Mairie de Paris");
    assert.equal(result.maxSlots, 40);
    assert.equal(result.slotsLeft, 39);

    assert.equal(
        result.appointments.length,
        1,
        "Devrait avoir exactement 1 rendez-vous",
    );

    assert.equal(
        result.appointments[0].candidateId,
        "candidate-1",
    );
});

test("US10: returns undefined for unknown collection", async () => {
    const result = await collectionRepo.byId("inexistant");

    assert.equal(result, undefined);
});