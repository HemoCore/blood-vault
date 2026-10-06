import assert from "node:assert/strict";
import { test } from "node:test";

import type { Candidate } from "../../domain/models/candidate.ts";
import type { CandidateRepository } from "../../domain/ports/candidateRepository.ts";
import { BloodGroup } from "../../domain/values-object/bloodGroup.ts";
import { Email } from "../../domain/values-object/email.ts";
import { Weight } from "../../domain/values-object/weight.ts";
import { inMemoryCandidateRepository } from "../in-memory/inMemoryCandidateRepository.ts";
import { inMemoryDonationRepository } from "../in-memory/inMemoryDonationRepository.ts";
import { startServer } from "./server.ts";

const TODAY = new Date("2026-10-03");

const ELIGIBLE_CANDIDATE: Candidate = {
    id: "candidate-1",
    email: Email.of("donor@example.com"),
    age: 30,
    weight: Weight.of(65),
    sexe: "male",
    annualDonations: 0,
    lastDonationAt: null,
    bloodGroup: BloodGroup.of("O+"),
};

const clock = {
    now: () => TODAY,
};

const uuid = {
    next: () => "donation-1",
};

test("POST /donations records a donation and responds 201", async () => {
    const candidates = inMemoryCandidateRepository([
        ELIGIBLE_CANDIDATE,
    ]);
    const donations = inMemoryDonationRepository();

    const server = await startServer(
        {
            candidates,
            donations,
            clock,
            uuid,
        },
        0,
    );

    try {
        const response = await fetch(
            `http://127.0.0.1:${server.port}/donations`,
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    candidateId: "candidate-1",
                    volumeMl: 450,
                    donationType: "whole-blood",
                }),
            },
        );

        assert.equal(response.status, 201);

        assert.deepEqual(await response.json(), {
            donationId: "donation-1",
        });

        assert.equal((await donations.all()).length, 1);
    } finally {
        await server.close();
    }
});

test("POST /donations responds 404 for an unknown donor", async () => {
    const candidates = inMemoryCandidateRepository();
    const donations = inMemoryDonationRepository();

    const server = await startServer(
        {
            candidates,
            donations,
            clock,
            uuid,
        },
        0,
    );

    try {
        const response = await fetch(
            `http://127.0.0.1:${server.port}/donations`,
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    candidateId: "unknown",
                    volumeMl: 450,
                    donationType: "whole-blood",
                }),
            },
        );

        assert.equal(response.status, 404);

        assert.deepEqual(await response.json(), {
            error: "unknown donor",
        });
    } finally {
        await server.close();
    }
});

test("POST /donations responds 409 with reason when age is out of bounds", async () => {
    const candidate: Candidate = {
        ...ELIGIBLE_CANDIDATE,
        age: 17,
    };

    const candidates = inMemoryCandidateRepository([candidate]);
    const donations = inMemoryDonationRepository();

    const server = await startServer(
        {
            candidates,
            donations,
            clock,
            uuid,
        },
        0,
    );

    try {
        const response = await fetch(
            `http://127.0.0.1:${server.port}/donations`,
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    candidateId: candidate.id,
                    volumeMl: 450,
                    donationType: "whole-blood",
                }),
            },
        );

        assert.equal(response.status, 409);

        assert.deepEqual(await response.json(), {
            error: "age out of bounds",
        });

        assert.deepEqual(await donations.all(), []);
    } finally {
        await server.close();
    }
});

test("POST /donations responds 409 when minimum interval is not respected", async () => {
    const candidate: Candidate = {
        ...ELIGIBLE_CANDIDATE,
        lastDonationAt: new Date("2026-09-01"),
    };

    const candidates = inMemoryCandidateRepository([candidate]);
    const donations = inMemoryDonationRepository();

    const server = await startServer(
        {
            candidates,
            donations,
            clock,
            uuid,
        },
        0,
    );

    try {
        const response = await fetch(
            `http://127.0.0.1:${server.port}/donations`,
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    candidateId: candidate.id,
                    volumeMl: 450,
                    donationType: "whole-blood",
                }),
            },
        );

        assert.equal(response.status, 409);

        assert.deepEqual(await response.json(), {
            error: "minimum donation interval not respected",
        });

        assert.deepEqual(await donations.all(), []);
    } finally {
        await server.close();
    }
});

test("POST /donations responds 500 without exposing technical details", async () => {
    const candidates: CandidateRepository = {
        async byId() {
            throw new Error("database password=super-secret");
        },

        async byBloodGroup() {
            return [];
        },

        async save() {},
    };

    const donations = inMemoryDonationRepository();

    const server = await startServer(
        {
            candidates,
            donations,
            clock,
            uuid,
        },
        0,
    );

    try {
        const response = await fetch(
            `http://127.0.0.1:${server.port}/donations`,
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    candidateId: "candidate-1",
                    volumeMl: 450,
                    donationType: "whole-blood",
                }),
            },
        );

        assert.equal(response.status, 500);

        assert.deepEqual(await response.json(), {
            error: "something went wrong on our side",
        });
    } finally {
        await server.close();
    }
});

test("unknown route responds 404", async () => {
    const candidates = inMemoryCandidateRepository();
    const donations = inMemoryDonationRepository();

    const server = await startServer(
        {
            candidates,
            donations,
            clock,
            uuid,
        },
        0,
    );

    try {
        const response = await fetch(
            `http://127.0.0.1:${server.port}/unknown`,
        );

        assert.equal(response.status, 404);

        assert.deepEqual(await response.json(), {
            error: "no such route",
        });
    } finally {
        await server.close();
    }
});