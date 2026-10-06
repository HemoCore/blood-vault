export interface SmsMessage {
    to: string;
    body: string;
}

export interface Sms {
    send(message: SmsMessage): Promise<void>;
}