export class DonationVolume {
    private constructor(private readonly value: number) {}

    static of(ml: number): DonationVolume {
        if (ml < 400 || ml > 500) {
            throw new Error("invalid donation volume");
        }

        return new DonationVolume(ml);
    }

    toMl(): number {
        return this.value;
    }
}