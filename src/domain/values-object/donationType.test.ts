import assert from "node:assert/strict";
import { test } from "node:test";

import { DonationType } from "./donationType.ts";

test("defines the interval and bag lifetime for each donation type", () => {
  const donatedAt = new Date("2026-10-05T12:00:00.000Z");

  assert.equal(DonationType.WHOLE_BLOOD.minimumIntervalMs, 56 * 24 * 60 * 60 * 1000);
  assert.equal(
    DonationType.WHOLE_BLOOD.bagExpiresAtFrom(donatedAt).toISOString(),
    "2026-11-16T12:00:00.000Z",
  );

  assert.equal(DonationType.PLASMA.minimumIntervalMs, 14 * 24 * 60 * 60 * 1000);
  assert.equal(
    DonationType.PLASMA.bagExpiresAtFrom(donatedAt).toISOString(),
    "2027-10-05T12:00:00.000Z",
  );

  assert.equal(DonationType.PLATELETS.minimumIntervalMs, 28 * 24 * 60 * 60 * 1000);
  assert.equal(
    DonationType.PLATELETS.bagExpiresAtFrom(donatedAt).toISOString(),
    "2026-10-12T12:00:00.000Z",
  );
});

test("refuses an unknown donation type", () => {
  assert.throws(() => DonationType.of("unknown"), /invalid donation type/);
});