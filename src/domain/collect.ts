import { randomUUID } from "node:crypto";

export interface Collection {
    id: string;
    name: string;
    location: string;
    maxSlots: number;
    createdAt: Date;
}

export function createCollection(
    name: string,
    location: string,
    maxSlots: number = 40
): Collection {
    return {
        id: randomUUID(),
        name,
        location,
        maxSlots,
        createdAt: new Date(),
    };
}