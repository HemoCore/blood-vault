import { readConfig } from "./config.ts";

import { systemClock } from "../infrastructure/clock/systemClock.ts";
import { uuidGenerator } from "../infrastructure/id/uuidGenerator.ts";
import { startServer } from "../infrastructure/http/server.ts";
import { buildApp } from "../main.ts";

async function main(): Promise<void> {
    const config = readConfig(process.env);

    const app = buildApp({
        clock: systemClock,
        uuid: uuidGenerator,
    });

    const server = await startServer(
        app,
        config.port,
        config.host,
    );

    console.log(
        `Blood Vault listening on http://${config.host}:${server.port}`,
    );

    process.on("SIGTERM", async () => {
        await server.close();
        process.exit(0);
    });
}

void main();