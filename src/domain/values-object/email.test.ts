import assert from "node:assert/strict";
import { test } from "node:test";
import { Email } from "./email.ts";

test("accepts a well-formed address", () => {
    assert.equal(Email.of("a@b.fr").toString(), "a@b.fr");
});

test("trims the spaces around the address", () => {
    assert.equal(Email.of("  a@b.fr  ").toString(), "a@b.fr");
});

test("refuses an empty address", () => {
    assert.throws(
        () => Email.of(""),
        /invalid email/,
    );
});

test("refuses an address without @", () => {
    assert.throws(
        () => Email.of("not-an-email"),
        /invalid email/,
    );
});

test("refuses an address without a domain extension", () => {
    assert.throws(
        () => Email.of("a@b"),
        /invalid email/,
    );
});

test("refuses an address without a local part", () => {
    assert.throws(
        () => Email.of("@b.fr"),
        /invalid email/,
    );
});

test("refuses an address with a space inside", () => {
    assert.throws(
        () => Email.of("a b@c.fr"),
        /invalid email/,
    );
});

test("refuses an address with two @", () => {
    assert.throws(
        () => Email.of("a@@b.fr"),
        /invalid email/,
    );
});