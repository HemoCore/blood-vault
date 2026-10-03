export class Weight {
    private constructor(private readonly value: number) {}

    static of(kg: number): Weight {
        if (kg <= 0) {
            throw new Error("invalid weight");
        }

        return new Weight(kg);
    }

    toKg(): number {
        return this.value;
    }
}