import { Collection } from "../collect.ts";

export interface CollectionRepository {
    byId(id: string): Promise<Collection | undefined>;
    save(collection: Collection): Promise<void>;
}