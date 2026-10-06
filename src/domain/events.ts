import type { BloodGroup } from "./values-object/bloodGroup.ts"

export interface BloodStockBecameLow {
    type: "BloodStockBecameLow";
    bloodGroup: BloodGroup;
}

export type DomainEvent = BloodStockBecameLow;