import assert from "node:assert/strict";
import { test } from "node:test";

import { BloodGroup } from "../values-object/bloodGroup.ts";
import { isCompatible } from "./bloodCompatibility.ts";

const cases = [
    // patient O-
    ["O-", "O-", true],
    ["O+", "O-", false],
    ["A-", "O-", false],

    // patient O+
    ["O-", "O+", true],
    ["O+", "O+", true],
    ["A+", "O+", false],

    // patient A-
    ["O-", "A-", true],
    ["A-", "A-", true],
    ["O+", "A-", false],

    // patient A+
    ["O-", "A+", true],
    ["O+", "A+", true],
    ["A-", "A+", true],
    ["A+", "A+", true],
    ["B+", "A+", false],

    // patient B-
    ["O-", "B-", true],
    ["B-", "B-", true],
    ["A-", "B-", false],

    // patient B+
    ["O-", "B+", true],
    ["O+", "B+", true],
    ["B-", "B+", true],
    ["B+", "B+", true],
    ["A+", "B+", false],

    // patient AB-
    ["O-", "AB-", true],
    ["A-", "AB-", true],
    ["B-", "AB-", true],
    ["AB-", "AB-", true],
    ["O+", "AB-", false],

    // patient AB+
    ["O-", "AB+", true],
    ["O+", "AB+", true],
    ["A-", "AB+", true],
    ["A+", "AB+", true],
    ["B-", "AB+", true],
    ["B+", "AB+", true],
    ["AB-", "AB+", true],
    ["AB+", "AB+", true],
] as const;

for (const [bagGroup, patientGroup, expected] of cases) {
    test(`${patientGroup} patient ${expected ? "can" : "cannot"} receive ${bagGroup}`, () => {
        const bag = BloodGroup.of(bagGroup);
        const patient = BloodGroup.of(patientGroup);

        assert.equal(isCompatible(bag, patient), expected);
    });
}