import type { Candidate } from "../domain/models/candidate.ts";
import { BloodGroup } from "../domain/values-object/bloodGroup.ts";
import { Email } from "../domain/values-object/email.ts";
import { Weight } from "../domain/values-object/weight.ts";

let counter = 0;

const nextId = () => `candidate-${++counter}`;

export function aCandidate() {
    let age = 30;
    let weightKg = 65;
    let sexe = "male";
    let annualDonations = 0;
    let lastDonationAt: Date | null = null;
    let bloodGroup = "O+";
    let email: string | undefined;
    let phone: string | undefined;

    const builder = {
        withAge(value: number) {
            age = value;
            return builder;
        },

        withWeight(value: number) {
            weightKg = value;
            return builder;
        },

        male() {
            sexe = "male";
            return builder;
        },

        female() {
            sexe = "female";
            return builder;
        },

        withAnnualDonations(value: number) {
            annualDonations = value;
            return builder;
        },

        lastDonatedAt(value: Date) {
            lastDonationAt = value;
            return builder;
        },

        withBloodGroup(value: string) {
            bloodGroup = value;
            return builder;
        },

        withEmail(value: string) {
            email = value;
            return builder;
        },

        withPhone(value: string) {
            phone = value;
            return builder;
        },

        build(): Candidate {
            const id = nextId();

            return {
                id,
                age,
                weight: Weight.of(weightKg),
                sexe,
                annualDonations,
                lastDonationAt,
                bloodGroup: BloodGroup.of(bloodGroup),
                email: Email.of(email ?? `${id}@example.com`),
                ...(phone === undefined ? {} : { phone }),
            };
        },
    };

    return builder;
}