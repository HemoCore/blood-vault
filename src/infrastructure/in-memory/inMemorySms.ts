import type { Sms, SmsMessage } from "../../domain/ports/sms.ts";

export function inMemorySms() {
    const sent: SmsMessage[] = [];

    const sms: Sms = {
        async send(message: SmsMessage) {
            sent.push(message);
        },
    };

    return { sms, sent };
}