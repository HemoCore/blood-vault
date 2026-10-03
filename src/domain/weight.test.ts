import assert from "node:assert/strict";
import { test } from "node:test";
import { Weight } from "./weight.ts";

test("accepts a positive weight", () => {
    assert.equal(Weight.of(65).toKg(), 65);
});

test("refuses a zero weight", () => {
    assert.throws(
        () => Weight.of(0),
        /invalid weight/,
    );
});

test("refuses a negative weight", () => {
    assert.throws(
        () => Weight.of(-10),
        /invalid weight/,
    );
});