import { sql } from "@vercel/postgres";

let initialized = false;

/**
 * Creates all required tables if they do not already exist.
 * Safe to call on every request; the CREATE TABLE IF NOT EXISTS
 * statements make this a no-op after the first run.
 */
export async function ensureSchema() {
  if (initialized) return;

  await sql`
    CREATE TABLE IF NOT EXISTS candidates (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      image_url TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS app_users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      device_id TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS votes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(user_id)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      vote_start TIMESTAMPTZ,
      vote_end TIMESTAMPTZ,
      CONSTRAINT single_row CHECK (id = 1)
    );
  `;

  await sql`
    INSERT INTO settings (id, vote_start, vote_end)
    VALUES (1, NULL, NULL)
    ON CONFLICT (id) DO NOTHING;
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS admin_logs (
      id SERIAL PRIMARY KEY,
      action TEXT NOT NULL,
      detail TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  initialized = true;
}

export async function logAdminAction(action: string, detail: string = "") {
  await sql`INSERT INTO admin_logs (action, detail) VALUES (${action}, ${detail});`;
}

export { sql };
