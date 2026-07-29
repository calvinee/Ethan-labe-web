ALTER TABLE users ADD COLUMN email_verified_at TEXT;

-- Existing accounts predate email verification. Preserve their access while
-- requiring every newly registered account to verify ownership.
UPDATE users
SET email_verified_at = created_at
WHERE email_verified_at IS NULL;

CREATE TABLE IF NOT EXISTS auth_email_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('verify_email', 'reset_password')),
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_auth_email_tokens_user_purpose
  ON auth_email_tokens(user_id, purpose);
CREATE INDEX IF NOT EXISTS idx_auth_email_tokens_expires_at
  ON auth_email_tokens(expires_at);
