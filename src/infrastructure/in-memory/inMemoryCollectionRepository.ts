import { Collection } from "../../domain/collect";
import { CollectionRepository } from "../../domain/port/collectionRepository";

export function inMemoryCollectionRepository(
    initialCollections: Collection[] = [],
): CollectionRepository {
    const collections = new Map<string, Collection>();

    for (const collection of initialCollections) {
        collections.set(collection.id, collection);
    }

    return {
        async byId(id: string): Promise<Collection | undefined> {
            return collections.get(id);
        },

        async save(collection: Collection): Promise<void> {
            collections.set(collection.id, collection);
        },
    };
}