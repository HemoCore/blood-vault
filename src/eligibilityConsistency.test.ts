import assert from "node:assert/strict";
import { test } from "node:test";

import { aCandidate } from "./testing/builders.ts";
import { checkingOnBookingSite } from "./checkEligibilityOnWebsite.ts";
import { checkEligibilityAtDesk } from "./checkEligibilityAtDesk.ts";
import type { Clock } from "./domain/ports/clock.ts";

const clock: Clock = {
    now: () => new Date("2024-02-26"),
};

test("site and desk apply the same eligibility rule", () => {
    const candidate = aCandidate()
        .lastDonatedAt(new Date("2024-01-08"))
        .build();

    const siteResult = checkingOnBookingSite(candidate, clock);
    const deskResult = checkEligibilityAtDesk(candidate, clock);

    assert.equal(siteResult, deskResult);
});