import type {BloodGroup} from "../../domain/values-object/bloodGroup.ts";

export { listAvailableBags, availableBags, listAvailablePouches } from "../use-cases/list-available-bags/listAvailableBags.ts";
export interface AvailableBag {
    bloodGroup: BloodGroup;
    bagExpiresAt: Date;
}