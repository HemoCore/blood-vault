export class Email {
    private constructor(private readonly value: string) {}

    static of(value: string): Email {
        const trimmed = value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            throw new Error("invalid email");
        }
        return new Email(trimmed);
    }

    toString(): string {
        return this.value;
    }
}