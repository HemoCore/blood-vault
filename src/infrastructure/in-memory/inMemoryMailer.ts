import type { Mailer, Letter } from "../../domain/ports/mailer.ts";

export function inMemoryMailer() {
    const sent: Letter[] = [];

    const mailer: Mailer = {
        async send(letter: Letter) {
            sent.push(letter);
        },
    };

    return { mailer, sent };
}