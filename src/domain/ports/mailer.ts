import { Email } from "../values-object/email.ts";

export interface Letter {
    to: Email;
    subject: string;
    body: string;
}

export interface Mailer {
    send(letter: Letter): Promise<void>;
}