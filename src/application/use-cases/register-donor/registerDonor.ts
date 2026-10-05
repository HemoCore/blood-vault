import { Candidate } from "../../../domain/models/candidate.ts";
import { Email } from "../../../domain/values-object/email.ts";
import { Weight } from "../../../domain/values-object/weight.ts";
import { BloodGroup } from "../../../domain/values-object/bloodGroup.ts";
import { CandidateRepository } from "../../../domain/ports/candidateRepository";
import { Mailer } from "../../../domain/ports/mailer";

export interface RegisterDonorCommand {
    id: string;
    email: string;
    age: number;
    weightKg: number;
    sexe: string;
    bloodGroup: string;
}

export type RegisterDonorResult =
    | { status: "registered"; candidate: Candidate }
    | { status: "already-registered" }
    | { status: "invalid"; reason: string };

export class RegisterDonorHandler {
    constructor(
        private readonly candidateRepository: CandidateRepository,
        private readonly mailer: Mailer
    ) {}

    async handle(command: RegisterDonorCommand): Promise<RegisterDonorResult> {
        let candidate: Candidate;
        
        try {
            candidate = {
                id: command.id,
                email: Email.of(command.email),
                age: command.age,
                weight: Weight.of(command.weightKg),
                sexe: command.sexe,
                bloodGroup: BloodGroup.of(command.bloodGroup),
                annualDonations: 0,
                lastDonationAt: null,
            };
        } catch (error) {
            return { status: "invalid", reason: (error as Error).message };
        }

        if (await this.candidateRepository.byId(candidate.id)) {
            return { status: "already-registered" };
        }

        await this.candidateRepository.save(candidate);
        
        await this.mailer.sendDonorCard(candidate.email, {
            donorId: candidate.id,
            bloodGroup: candidate.bloodGroup,
        });

        return { status: "registered", candidate };
    }
}