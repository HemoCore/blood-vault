import assert from "node:assert/strict";
import { test } from "node:test";

import { readConfig } from "./config.ts";

test("reads PORT and uses default host", () => {
    const config = readConfig({
        PORT: "3000",
    });

    assert.deepEqual(config, {
        port: 3000,
        host: "127.0.0.1",
    });
});

test("reads custom HOST", () => {
    const config = readConfig({
        PORT: "8080",
        HOST: "0.0.0.0",
    });

    assert.deepEqual(config, {
        port: 8080,
        host: "0.0.0.0",
    });
});

test("refuses to start without PORT", () => {
    assert.throws(
        () => readConfig({}),
        /PORT/,
    );
});

test("refuses a non numeric PORT", () => {
    assert.throws(
        () =>
            readConfig({
                PORT: "hello",
            }),
        /PORT/,
    );
});

test("refuses a negative PORT", () => {
    assert.throws(
        () =>
            readConfig({
                PORT: "-3000",
            }),
        /PORT/,
    );
});

test("refuses a decimal PORT", () => {
    assert.throws(
        () =>
            readConfig({
                PORT: "3000.5",
            }),
        /PORT/,
    );
});