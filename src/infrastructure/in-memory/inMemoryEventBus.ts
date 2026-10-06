import type { DomainEvent } from "../../domain/models/events.ts";
import type {
    EventBus,
    Listener,
} from "../../domain/ports/eventBus.ts";

export function inMemoryEventBus(): EventBus {
    const listeners = new Map<string, Listener[]>();

    return {
        on(type, listener) {
            listeners.set(
                type,
                [...(listeners.get(type) ?? []), listener],
            );
        },

        async publish(event: DomainEvent) {
            for (const listener of listeners.get(event.type) ?? []) {
                await listener(event).catch(() => undefined);
            }
        },
    };
}