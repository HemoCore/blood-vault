import assert from "node:assert/strict";
import { test } from "node:test";

import type { Candidate } from "../../domain/models/candidate.ts";
import type { CandidateRepository } from "../../domain/ports/candidateRepository.ts";
import { BloodGroup } from "../../domain/values-object/bloodGroup.ts";
import { Email } from "../../domain/values-object/email.ts";
import { Weight } from "../../domain/values-object/weight.ts";

import { RegisterDonorHandler } from "../../application/use-cases/register-donor/registerDonor.ts";

import { inMemoryCandidateRepository } from "../in-memory/inMemoryCandidateRepository.ts";
import { inMemoryDonationRepository } from "../in-memory/inMemoryDonationRepository.ts";
import { inMemoryMailer } from "../in-memory/inMemoryMailer.ts";

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

// ---------------------------------------------------------
// POST /candidates
// ---------------------------------------------------------

test("POST /candidates registers a candidate and responds 201", async () => {
    const candidates = inMemoryCandidateRepository();
    const donations = inMemoryDonationRepository();

    const { mailer } = inMemoryMailer();

    const registerDonor = new RegisterDonorHandler(
        candidates,
        mailer,
    );

    const server = await startServer(
        {
            candidates,
            donations,
            clock,
            uuid,
            registerDonor,
        },
        0,
    );

    try {
        const response = await fetch(
            `http://127.0.0.1:${server.port}/candidates`,
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    id: "candidate-2",
                    email: "candidate@example.com",
                    age: 30,
                    weightKg: 65,
                    sexe: "female",
                    bloodGroup: "O+",
                }),
            },
        );

        assert.equal(response.status, 201);

        assert.deepEqual(await response.json(), {
            id: "candidate-2",
        });

        const saved = await candidates.byId(
            "candidate-2",
        );

        assert.equal(saved?.id, "candidate-2");
        assert.equal(
            saved?.email.toString(),
            "candidate@example.com",
        );
        assert.equal(saved?.age, 30);
        assert.equal(
            saved?.bloodGroup.toString(),
            "O+",
        );
    } finally {
        await server.close();
    }
});

test("POST /candidates responds 409 when candidate is already registered", async () => {
    const candidates = inMemoryCandidateRepository([
        ELIGIBLE_CANDIDATE,
    ]);

    const donations = inMemoryDonationRepository();

    const { mailer } = inMemoryMailer();

    const registerDonor = new RegisterDonorHandler(
        candidates,
        mailer,
    );

    const server = await startServer(
        {
            candidates,
            donations,
            clock,
            uuid,
            registerDonor,
        },
        0,
    );

    try {
        const response = await fetch(
            `http://127.0.0.1:${server.port}/candidates`,
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    id: "candidate-1",
                    email: "other@example.com",
                    age: 25,
                    weightKg: 60,
                    sexe: "female",
                    bloodGroup: "A+",
                }),
            },
        );

        assert.equal(response.status, 409);

        assert.deepEqual(await response.json(), {
            error: "candidate already registered",
        });
    } finally {
        await server.close();
    }
});

test("POST /candidates responds 409 when candidate data is invalid", async () => {
    const candidates = inMemoryCandidateRepository();
    const donations = inMemoryDonationRepository();

    const { mailer } = inMemoryMailer();

    const registerDonor = new RegisterDonorHandler(
        candidates,
        mailer,
    );

    const server = await startServer(
        {
            candidates,
            donations,
            clock,
            uuid,
            registerDonor,
        },
        0,
    );

    try {
        const response = await fetch(
            `http://127.0.0.1:${server.port}/candidates`,
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    id: "candidate-2",
                    email: "invalid-email",
                    age: 30,
                    weightKg: 65,
                    sexe: "female",
                    bloodGroup: "O+",
                }),
            },
        );

        assert.equal(response.status, 409);

        const payload = await response.json() as {
            error: string;
        };

        assert.equal(
            typeof payload.error,
            "string",
        );
    } finally {
        await server.close();
    }
});

// ---------------------------------------------------------
// POST /donations
// ---------------------------------------------------------

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

        assert.equal(
            (await donations.all()).length,
            1,
        );
    } finally {
        await server.close();
    }
});

test("POST /donations responds 404 for an unknown donor", async () => {
    const candidates =
        inMemoryCandidateRepository();

    const donations =
        inMemoryDonationRepository();

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

    const candidates =
        inMemoryCandidateRepository([candidate]);

    const donations =
        inMemoryDonationRepository();

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

        assert.deepEqual(
            await donations.all(),
            [],
        );
    } finally {
        await server.close();
    }
});

test("POST /donations responds 409 when minimum interval is not respected", async () => {
    const candidate: Candidate = {
        ...ELIGIBLE_CANDIDATE,
        lastDonationAt: new Date("2026-09-01"),
    };

    const candidates =
        inMemoryCandidateRepository([candidate]);

    const donations =
        inMemoryDonationRepository();

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
            error:
                "minimum donation interval not respected",
        });

        assert.deepEqual(
            await donations.all(),
            [],
        );
    } finally {
        await server.close();
    }
});

test("POST /donations responds 500 without exposing technical details", async () => {
    const candidates: CandidateRepository = {
        async byId() {
            throw new Error(
                "database password=super-secret",
            );
        },

        async byBloodGroup() {
            return [];
        },

        async all() {
            return [];
        },

        async save() {},
    };

    const donations =
        inMemoryDonationRepository();

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
            error:
                "something went wrong on our side",
        });
    } finally {
        await server.close();
    }
});

test("GET /candidates responds 200 with registered candidates", async () => {
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
            `http://127.0.0.1:${server.port}/candidates`,
        );

        assert.equal(response.status, 200);

        assert.deepEqual(await response.json(), [
            {
                id: "candidate-1",
                email: "donor@example.com",
                age: 30,
                sexe: "male",
                bloodGroup: "O+",
            },
        ]);
    } finally {
        await server.close();
    }
});
test("a registered candidate appears in GET /candidates", async () => {
    const candidates = inMemoryCandidateRepository();
    const donations = inMemoryDonationRepository();

    const { mailer } = inMemoryMailer();

    const registerDonor = new RegisterDonorHandler(
        candidates,
        mailer,
    );

    const server = await startServer(
        {
            candidates,
            donations,
            clock,
            uuid,
            registerDonor,
        },
        0,
    );

    try {
        const registerResponse = await fetch(
            `http://127.0.0.1:${server.port}/candidates`,
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    id: "candidate-2",
                    email: "candidate@example.com",
                    age: 30,
                    weightKg: 65,
                    sexe: "female",
                    bloodGroup: "O+",
                }),
            },
        );

        assert.equal(
            registerResponse.status,
            201,
        );

        const listResponse = await fetch(
            `http://127.0.0.1:${server.port}/candidates`,
        );

        assert.equal(
            listResponse.status,
            200,
        );

        assert.deepEqual(
            await listResponse.json(),
            [
                {
                    id: "candidate-2",
                    email: "candidate@example.com",
                    age: 30,
                    sexe: "female",
                    bloodGroup: "O+",
                },
            ],
        );
    } finally {
        await server.close();
    }
});
// ---------------------------------------------------------
// Route inconnue
// ---------------------------------------------------------

test("unknown route responds 404", async () => {
    const candidates =
        inMemoryCandidateRepository();

    const donations =
        inMemoryDonationRepository();

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