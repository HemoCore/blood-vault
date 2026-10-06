export interface Config {
    port: number;
    host: string;
}

export function readConfig(
    env: Record<string, string | undefined>,
): Config {
    const port = Number(env["PORT"]);

    if (
        !env["PORT"] ||
        !Number.isInteger(port) ||
        port <= 0
    ) {
        throw new Error(
            "PORT must be set to a positive whole number",
        );
    }

    return {
        port,
        host: env["HOST"] ?? "127.0.0.1",
    };
}