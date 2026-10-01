import { test } from "node:test";
import assert from "node:assert/strict";
import { canDonate } from "./eligibility";

test("30 ans, 65 kg : peut donner", () => {
    assert.equal(canDonate({ age: 30, weightKg: 65 }), true);
});

test("17 ans : ne peut pas donner", () => {
    assert.equal(canDonate({ age: 17, weightKg: 65 }), false);
});

test("71 ans : ne peut pas donner", () => {
    assert.equal(canDonate({ age: 71, weightKg: 65 }), false);
});

test("48 kg : ne peut pas donner", () => {
    assert.equal(canDonate({ age: 30, weightKg: 48 }), false);
});

// Les bornes
test("18 ans pile : peut donner", () => {
    assert.equal(canDonate({ age: 18, weightKg: 65 }), true);
});

test("70 ans pile : peut donner", () => {
    assert.equal(canDonate({ age: 70, weightKg: 65 }), true);
});

test("50 kg pile : peut donner", () => {
    assert.equal(canDonate({ age: 30, weightKg: 50 }), true);
});

test("49 kg : ne peut pas donner", () => {
    assert.equal(canDonate({ age: 30, weightKg: 49 }), false);
});
