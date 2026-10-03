import { Mailer, DonorCard } from "../../domain/port/mailer";
import { Email } from "../../domain/email";

export function inMemoryMailer() {
    const sent: { to: string; card: DonorCard }[] = [];
    const mailer: Mailer = {
        async sendDonorCard(to: Email, card: DonorCard) {
            sent.push({ to: to.toString(), card });
        },
    };
    return { mailer, sent };
}