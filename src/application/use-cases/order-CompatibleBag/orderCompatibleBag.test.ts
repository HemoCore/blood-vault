import assert from "node:assert/strict";
import { test } from "node:test";
import type {Clock} from "../../../domain/ports/clock.ts";
import type {Donation} from "../../../domain/models/donation.ts";
import {BloodGroup} from "../../../domain/values-object/bloodGroup.ts";
import {DonationVolume} from "../../../domain/values-object/donationVolume.ts";
import {DonationType} from "../../../domain/values-object/donationType.ts";
import {inMemoryDonationRepository} from "../../../infrastructure/in-memory/inMemoryDonationRepository.ts";
import {orderCompatibleBag} from "./orderCompatibleBag.ts";


const NOW = new Date("2024-06-01");

const clock: Clock = {
    now: () => NOW,
};

function aDonation(
    id: string,
    bloodGroup: string,
    expiresAt: string,
): Donation {
    return {
        id,
        candidateId: `candidate-${id}`,
        donatedAt: new Date("2024-05-01"),
        bloodGroup: BloodGroup.of(bloodGroup),
        volume: DonationVolume.of(450),
        donationType: DonationType.WHOLE_BLOOD,
        bagExpiresAt: new Date(expiresAt),
    };
}

test("O- patient only receives O- blood", async () => {
    const donations = inMemoryDonationRepository();

    await donations.add(aDonation("1", "A+", "2024-06-10"));
    await donations.add(aDonation("2", "O-", "2024-06-20"));

    const bag = await orderCompatibleBag(
        BloodGroup.of("O-"),
        { donations, clock },
    );

    assert.equal(bag?.bloodGroup, "O-");
});

test("AB+ patient can receive every blood group", async () => {
    const donations = inMemoryDonationRepository();

    await donations.add(aDonation("1", "A-", "2024-06-10"));

    const bag = await orderCompatibleBag(
        BloodGroup.of("AB+"),
        { donations, clock },
    );

    assert.equal(bag?.bloodGroup, "A-");
});

test("the bag that expires first is selected", async () => {
    const donations = inMemoryDonationRepository();

    await donations.add(aDonation("1", "O-", "2024-06-20"));
    await donations.add(aDonation("2", "O-", "2024-06-10"));

    const bag = await orderCompatibleBag(
        BloodGroup.of("O-"),
        { donations, clock },
    );

    assert.equal(bag?.expiresAt, new Date("2024-06-10").toISOString());
});

test("an expired bag is never selected", async () => {
    const donations = inMemoryDonationRepository();

    await donations.add(aDonation("1", "O-", "2024-05-31"));
    await donations.add(aDonation("2", "O-", "2024-06-10"));

    const bag = await orderCompatibleBag(
        BloodGroup.of("O-"),
        { donations, clock },
    );

    assert.equal(bag?.expiresAt, new Date("2024-06-10").toISOString());
});

test("hospital never receives donor information", async () => {
    const donations = inMemoryDonationRepository();

    await donations.add(aDonation("1", "O-", "2024-06-10"));

    const bag = await orderCompatibleBag(
        BloodGroup.of("O-"),
        { donations, clock },
    );

    assert.deepEqual(bag, {
        bloodGroup: "O-",
        expiresAt: new Date("2024-06-10").toISOString(),
    });
});

test("ordered bag is removed from available stock", async () => {
    const donations = inMemoryDonationRepository();

    await donations.add(aDonation("1", "O-", "2024-06-10"));

    await orderCompatibleBag(
        BloodGroup.of("O-"),
        { donations, clock },
    );

    assert.equal((await donations.all()).length, 0);
});

test("returns undefined when no compatible bag is available", async () => {
    const donations = inMemoryDonationRepository();

    await donations.add(aDonation("1", "A+", "2024-06-10"));

    const bag = await orderCompatibleBag(
        BloodGroup.of("O-"),
        { donations, clock },
    );

    assert.equal(bag, undefined);
});