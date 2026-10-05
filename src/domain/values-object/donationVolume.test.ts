import assert from "node:assert/strict";
import { test } from "node:test";
import { DonationVolume } from "./donationVolume.ts";

test("accepts a volume between 400 and 500 ml", () => {
    assert.equal(DonationVolume.of(450).toMl(), 450);
});

test("accepts the minimum volume", () => {
    assert.equal(DonationVolume.of(400).toMl(), 400);
});

test("accepts the maximum volume", () => {
    assert.equal(DonationVolume.of(500).toMl(), 500);
});

test("refuses a volume below 400 ml", () => {
    assert.throws(
        () => DonationVolume.of(399),
        /invalid donation volume/,
    );
});

test("refuses a volume above 500 ml", () => {
    assert.throws(
        () => DonationVolume.of(501),
        /invalid donation volume/,
    );
});