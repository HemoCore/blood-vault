import assert from "node:assert/strict";
import { test } from "node:test";

import { BloodGroup } from "../../../domain/values-object/bloodGroup.ts";
import { DonationVolume } from "../../../domain/values-object/donationVolume.ts";
import { DonationType } from "../../../domain/values-object/donationType.ts";

import { inMemoryDonationRepository } from "../../../infrastructure/in-memory/inMemoryDonationRepository.ts";
import { inMemoryEventBus } from "../../../infrastructure/in-memory/inMemoryEventBus.ts";

import { dispenseBag } from "./dispenseBag.ts";

async function addBags(
    donations: ReturnType<typeof inMemoryDonationRepository>,
    count: number,
    bloodGroup: string,
) {
    for (let i = 1; i <= count; i++) {
        await donations.add({
            id: `bag-${i}`,
            candidateId: `donor-${i}`,
            donatedAt: new Date("2026-01-01"),
            bloodGroup: BloodGroup.of(bloodGroup),
            volume: DonationVolume.of(450),
            donationType: DonationType.WHOLE_BLOOD,
            bagExpiresAt: new Date("2026-02-12"),
        });
    }
}

test("publishes an event when stock goes from 10 to 9 bags", async () => {
    const donations = inMemoryDonationRepository();
    const bus = inMemoryEventBus();

    const published: string[] = [];

    bus.on("BloodStockBecameLow", async (event) => {
        published.push(event.bloodGroup.toString());
    });

    await addBags(donations, 10, "O-");

    const result = await dispenseBag(
        { bagId: "bag-1" },
        donations,
        bus,
    );

    assert.equal(result.status, "dispensed");

    const stock = await donations.all();
    assert.equal(stock.length, 9);

    assert.deepEqual(published, ["O-"]);
});

test("does not publish again when stock is already below 10", async () => {
    const donations = inMemoryDonationRepository();
    const bus = inMemoryEventBus();

    const published: string[] = [];

    bus.on("BloodStockBecameLow", async (event) => {
        published.push(event.bloodGroup.toString());
    });

    await addBags(donations, 9, "O-");

    const result = await dispenseBag(
        { bagId: "bag-1" },
        donations,
        bus,
    );

    assert.equal(result.status, "dispensed");

    const stock = await donations.all();
    assert.equal(stock.length, 8);

    assert.deepEqual(published, []);
});

test("keeps the stock removal when a listener fails", async () => {
    const donations = inMemoryDonationRepository();
    const bus = inMemoryEventBus();

    await addBags(donations, 10, "O-");

    bus.on("BloodStockBecameLow", async () => {
        throw new Error("email service unavailable");
    });

    const result = await dispenseBag(
        { bagId: "bag-1" },
        donations,
        bus,
    );

    assert.equal(result.status, "dispensed");

    const stock = await donations.all();

    assert.equal(stock.length, 9);
    assert.equal(
        stock.some((bag) => bag.id === "bag-1"),
        false,
    );
});

test("returns not-found and does not publish when the bag does not exist", async () => {
    const donations = inMemoryDonationRepository();
    const bus = inMemoryEventBus();

    const published: string[] = [];

    bus.on("BloodStockBecameLow", async (event) => {
        published.push(event.bloodGroup.toString());
    });

    const result = await dispenseBag(
        { bagId: "unknown-bag" },
        donations,
        bus,
    );

    assert.deepEqual(result, { status: "not-found" });
    assert.deepEqual(published, []);
});