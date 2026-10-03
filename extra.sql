-- Schema and demo account for this app.
--
-- The platform runs this file once, right after cloning, with the search_path
-- already pointed at this app's own schema (app_<appId>). Every unqualified name
-- below therefore lands in that schema and nothing here touches `public` or any
-- other app. Re-running is safe: the table, the index and the seed row are all
-- guarded.
--
-- The field names deliberately match project-mongo's User model, so both blank
-- scaffolds expose the same shape to the dashboard and to the demo login.

CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL,
  password      text NOT NULL,
  "firstName"   text NOT NULL,
  "lastName"    text NOT NULL,
  phone         text,
  role          text NOT NULL DEFAULT 'tenant',
  avatar        text,
  "isActive"    boolean NOT NULL DEFAULT true,
  "emailVerified" timestamptz,
  "lastLogin"   timestamptz,
  "deletedAt"   timestamptz,
  "createdAt"   timestamptz NOT NULL DEFAULT now(),
  "updatedAt"   timestamptz NOT NULL DEFAULT now()
);

-- The login looks the user up by lowercased address, so uniqueness has to be
-- case-insensitive too — otherwise Demo@ and demo@ become two accounts.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users (lower(email));

-- Demo admin, matching DEMO_ADMIN_EMAIL / DEMO_ADMIN_PASSWORD in .env.example.
--
-- The password is a bcrypt hash (cost 10) of "kR7mq2Xp9vT4". It is stored as a
-- literal rather than computed with pgcrypto's crypt() so this file needs no
-- extension installed and produces the same row on every database.
--
-- DO NOTHING, not DO UPDATE: if the owner changes this account's password from
-- inside the app, re-provisioning must not silently reset it.
INSERT INTO users (email, password, "firstName", "lastName", role)
VALUES (
  'demo@weblify.app',
  '$2a$10$3xI4o5al3jc4oi/K4f03p.3tYUZZSDEdf3IMR5oaULQCdOdZyh2ju',
  'Admin',
  'User',
  'admin'
)
ON CONFLICT DO NOTHING;