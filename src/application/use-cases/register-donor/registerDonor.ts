import { Candidate } from "../../../domain/candidate";
import { Email } from "../../../domain/email";
import { Weight } from "../../../domain/weight";
import { BloodGroup } from "../../../domain/bloodGroup";
import { CandidateRepository } from "../../../domain/port/candidateRepository";
import { Mailer } from "../../../domain/port/mailer";

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