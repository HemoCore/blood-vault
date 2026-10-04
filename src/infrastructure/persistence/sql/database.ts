import postgres from 'postgres';

// URL de connexion vers ton conteneur Docker
const DATABASE_URL = 'postgres://blood_user:blood_password@localhost:5432/blood_vault';

// Initialisation du client PostgreSQL
export const sql = postgres(DATABASE_URL);

// Fonction pour créer les tables si elles n'existent pas
export async function initializeDatabase(): Promise<void> {
    await sql`
        CREATE TABLE IF NOT EXISTS candidates (
                                                  id TEXT PRIMARY KEY,
                                                  email TEXT NOT NULL,
                                                  age INTEGER NOT NULL,
                                                  weight_kg REAL NOT NULL,
                                                  sexe TEXT NOT NULL,
                                                  annual_donations INTEGER NOT NULL DEFAULT 0,
                                                  last_donation_at TIMESTAMPTZ,
                                                  blood_group TEXT NOT NULL
        )
    `;
}

// Fonction pour vider la table entre les tests
// noinspection SqlResolve
export async function cleanDatabase(): Promise<void> {
    await sql`TRUNCATE TABLE candidates`;
}