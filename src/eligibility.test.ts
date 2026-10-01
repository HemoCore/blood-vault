import { test } from "node:test";
import assert from "node:assert/strict";
import {
    canDonate,
    isAgeEligible,
    isWeightEligible,
    isWithinAnnualDonationLimit,
} from "./eligibility";

test("isAgeEligible accepts the age boundaries", () => {
    assert.equal(isAgeEligible({ age: 18, weightKg: 65, sexe: "male", annualDonations: 0 }), true);
    assert.equal(isAgeEligible({ age: 70, weightKg: 65, sexe: "male", annualDonations: 0 }), true);
});

test("isAgeEligible rejects ages outside the boundaries", () => {
    assert.equal(isAgeEligible({ age: 17, weightKg: 65, sexe: "male", annualDonations: 0 }), false);
    assert.equal(isAgeEligible({ age: 71, weightKg: 65, sexe: "male", annualDonations: 0 }), false);
});

test("isWeightEligible accepts 50 kg or more", () => {
    assert.equal(isWeightEligible({ age: 30, weightKg: 50, sexe: "male", annualDonations: 0 }), true);
    assert.equal(isWeightEligible({ age: 30, weightKg: 65, sexe: "male", annualDonations: 0 }), true);
});

test("isWeightEligible rejects less than 50 kg", () => {
    assert.equal(isWeightEligible({ age: 30, weightKg: 49, sexe: "male", annualDonations: 0 }), false);
});

test("isWithinAnnualDonationLimit accepts 5 donations for a man", () => {
    assert.equal(isWithinAnnualDonationLimit({ age: 30, weightKg: 65, sexe: "male", annualDonations: 5 }), true);
});

test("isWithinAnnualDonationLimit rejects 6 donations for a man", () => {
    assert.equal(isWithinAnnualDonationLimit({ age: 30, weightKg: 65, sexe: "male", annualDonations: 6 }), false);
});

test("isWithinAnnualDonationLimit accepts 3 donations for a woman", () => {
    assert.equal(isWithinAnnualDonationLimit({ age: 30, weightKg: 65, sexe: "female", annualDonations: 3 }), true);
});

test("isWithinAnnualDonationLimit rejects 4 donations for a woman", () => {
    assert.equal(isWithinAnnualDonationLimit({ age: 30, weightKg: 65, sexe: "female", annualDonations: 4 }), false);
});

test("canDonate accepts a candidate meeting all requirements", () => {
    assert.equal(canDonate({ age: 30, weightKg: 65, sexe: "male", annualDonations: 5 }), true);
});

test("canDonate rejects a candidate failing any requirement", () => {
    assert.equal(canDonate({ age: 17, weightKg: 65, sexe: "male", annualDonations: 0 }), false);
    assert.equal(canDonate({ age: 30, weightKg: 49, sexe: "male", annualDonations: 0 }), false);
    assert.equal(canDonate({ age: 30, weightKg: 65, sexe: "female", annualDonations: 4 }), false);
});
