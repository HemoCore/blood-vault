import { Mailer, DonorCard } from "../../domain/ports/mailer";
import { Email } from "../../domain/values-object/email.ts";

export function inMemoryMailer() {
    const sent: { to: string; card: DonorCard }[] = [];
    const mailer: Mailer = {
        async sendDonorCard(to: Email, card: DonorCard) {
            sent.push({ to: to.toString(), card });
        },
    };
    return { mailer, sent };
}