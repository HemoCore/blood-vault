import type { DomainEvent } from "../models/events";

export type Listener<E extends DomainEvent = DomainEvent> =
    (event: E) => Promise<void>;

export interface EventBus {
    publish(event: DomainEvent): Promise<void>;

    on(type: DomainEvent["type"], listener: Listener): void
}