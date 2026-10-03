import assert from "node:assert/strict";
import { test } from "node:test";
import { BloodGroup } from "./bloodGroup.ts";

test("accepts a valid blood group", () => {
    assert.equal(BloodGroup.of("O+").toString(), "O+");
    assert.equal(BloodGroup.of("AB-").toString(), "AB-");
});

test("refuses an invalid blood group", () => {
    assert.throws(
        () => BloodGroup.of("X+"),
        /invalid blood group/,
    );
});