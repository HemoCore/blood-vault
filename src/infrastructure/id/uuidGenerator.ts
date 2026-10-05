import type { IdGenerator } from "../../domain/ports/idGenerator.ts";
import { randomUUID } from "node:crypto";

export const uuidGenerator: IdGenerator = {
  next: () => randomUUID(),
};