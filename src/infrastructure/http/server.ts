import {
    createServer,
    type IncomingMessage,
    type Server,
    type ServerResponse,
} from "node:http";

import {
    DomainError,
    NotFound,
} from "../../domain/errors.ts";

import {
    DonationVolume,
} from "../../domain/values-object/donationVolume.ts";

import type {
    CandidateRepository,
} from "../../domain/ports/candidateRepository.ts";

import type {
    DonationRepository,
} from "../../domain/ports/DonationRepository.ts";

import type {
    Clock,
} from "../../domain/ports/clock.ts";

import type {
    IdGenerator,
} from "../../domain/ports/idGenerator.ts";

import type {
    RegisterDonorHandler,
} from "../../application/use-cases/register-donor/registerDonor.ts";

import {
    recordDonation,
} from "../../application/use-cases/record-donation/recordDonation.ts";


interface Dependencies {
    candidates: CandidateRepository;
    donations: DonationRepository;
    clock: Clock;
    uuid: IdGenerator;
    registerDonor?: RegisterDonorHandler;
}


export interface RunningServer {
    port: number;
    close(): Promise<void>;
}


export function startServer(
    dependencies: Dependencies,
    port: number,
    host = "127.0.0.1",
): Promise<RunningServer> {
    const server = createServer(
        (request, response) => {
            handle(
                dependencies,
                request,
                response,
            ).catch((error: unknown) => {
                reply(
                    response,
                    ...translate(error),
                );
            });
        },
    );

    return new Promise((resolve) => {
        server.listen(port, host, () => {
            const address = server.address();

            resolve({
                port:
                    typeof address === "object" &&
                    address
                        ? address.port
                        : port,

                close: () => stop(server),
            });
        });
    });
}


async function handle(
    dependencies: Dependencies,
    request: IncomingMessage,
    response: ServerResponse,
): Promise<void> {

    // -----------------------------------------
    // POST /candidates
    // Enregistrer un donneur
    // -----------------------------------------

    if (
        request.method === "POST" &&
        request.url === "/candidates"
    ) {
        if (!dependencies.registerDonor) {
            throw new Error(
                "registerDonor is not configured",
            );
        }

        const payload = JSON.parse(
            await body(request),
        ) as {
            id: string;
            email: string;
            age: number;
            weightKg: number;
            sexe: string;
            bloodGroup: string;
        };

        const result =
            await dependencies.registerDonor.handle(
                payload,
            );

        if (result.status === "registered") {
            reply(response, 201, {
                id: result.candidate.id,
            });

            return;
        }

        if (
            result.status ===
            "already-registered"
        ) {
            reply(response, 409, {
                error:
                    "candidate already registered",
            });

            return;
        }

        reply(response, 409, {
            error: result.reason,
        });

        return;
    }


    // -----------------------------------------
    // GET /candidates
    // Afficher la liste des donneurs
    // -----------------------------------------

    if (
        request.method === "GET" &&
        request.url === "/candidates"
    ) {
        const candidates =
            await dependencies.candidates.all();

        const payload = candidates.map(
            (candidate) => ({
                id: candidate.id,
                email:
                    candidate.email.toString(),
                age: candidate.age,
                sexe: candidate.sexe,
                bloodGroup:
                    candidate.bloodGroup.toString(),
            }),
        );

        reply(
            response,
            200,
            payload,
        );

        return;
    }


    // -----------------------------------------
    // POST /donations
    // Enregistrer un don
    // -----------------------------------------

    if (
        request.method === "POST" &&
        request.url === "/donations"
    ) {
        const payload = JSON.parse(
            await body(request),
        ) as {
            candidateId: string;
            volumeMl: number;
            donationType?: string;
        };

        const result =
            await recordDonation(
                payload.candidateId,
                DonationVolume.of(
                    payload.volumeMl,
                ),
                dependencies.candidates,
                dependencies.donations,
                dependencies.clock,
                dependencies.uuid,
                payload.donationType,
            );

        reply(response, 201, {
            donationId:
            result.donation.id,
        });

        return;
    }


    // -----------------------------------------
    // Route inconnue
    // Toujours en dernier
    // -----------------------------------------

    reply(response, 404, {
        error: "no such route",
    });
}


function translate(
    error: unknown,
): [number, { error: string }] {
    if (error instanceof NotFound) {
        return [
            404,
            {
                error: error.message,
            },
        ];
    }

    if (error instanceof DomainError) {
        return [
            409,
            {
                error: error.message,
            },
        ];
    }

    return [
        500,
        {
            error:
                "something went wrong on our side",
        },
    ];
}


function reply(
    response: ServerResponse,
    status: number,
    payload: unknown,
): void {
    response.writeHead(status, {
        "content-type": "application/json",
    });

    response.end(
        JSON.stringify(payload),
    );
}


function body(
    request: IncomingMessage,
): Promise<string> {
    return new Promise((resolve) => {
        let raw = "";

        request.on(
            "data",
            (chunk: Buffer) => {
                raw += chunk.toString();
            },
        );

        request.on("end", () => {
            resolve(raw || "{}");
        });
    });
}


function stop(
    server: Server,
): Promise<void> {
    return new Promise(
        (resolve, reject) => {
            server.close((error) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve();
            });
        },
    );
}