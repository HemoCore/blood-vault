import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { SqlCandidateRepository } from './sqlCandidateRepository.ts';
import {initializeDatabase, cleanDatabase, closeDatabase} from './database.ts';
import { Candidate } from '../../../domain/candidate.ts';
import { BloodGroup } from '../../../domain/bloodGroup.ts';
import { Email } from '../../../domain/email.ts';
import { Weight } from '../../../domain/weight.ts';

const repository = new SqlCandidateRepository();

const TEST_CANDIDATE: Candidate = {
    id: 'test-sql-1',
    email: Email.of('sql-test@example.com'),
    age: 25,
    weight: Weight.of(70),
    sexe: 'female',
    annualDonations: 1,
    lastDonationAt: null,
    bloodGroup: BloodGroup.of('A-'),
};

before(async () => {
    await initializeDatabase();
    await cleanDatabase();

});

after(async () => {
    await cleanDatabase();
    await closeDatabase();
});

test('SqlCandidateRepository saves and retrieves a candidate from Postgres', async () => {
    // 1. On sauvegarde
    await repository.save(TEST_CANDIDATE);

    // 2. On récupère
    const retrieved = await repository.byId('test-sql-1');

    // 3. On vérifie
    assert.ok(retrieved, 'Le candidat devrait être retrouvé');
    assert.equal(retrieved.id, 'test-sql-1');
    assert.equal(retrieved.email.toString(), 'sql-test@example.com');
    assert.equal(retrieved.age, 25);
    assert.equal(retrieved.weight.toKg(), 70);
    assert.equal(retrieved.bloodGroup.toString(), 'A-');
});

test('SqlCandidateRepository returns undefined for unknown candidate', async () => {
    const retrieved = await repository.byId('inexistant');
    assert.equal(retrieved, undefined);
});