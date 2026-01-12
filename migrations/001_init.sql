DROP TABLE IF EXISTS audit_log CASCADE;

DROP TABLE IF EXISTS targeted_users CASCADE;

DROP TABLE IF EXISTS feature_flags CASCADE;

DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE IF NOT EXISTS
    feature_flags (
        id SERIAL PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        description TEXT UNIQUE NOT NULL DEFAULT '',
        enabled BOOLEAN NOT NULL DEFAULT false,
        default_value BOOLEAN NOT NULL DEFAULT false,
        rollout_percentage INT NOT NULL DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS
    users (
        id TEXT PRIMARY KEY CHECK (id ~ '^(tenant|user|anon):[a-fA-F0-9\-]{36}$'),
        username TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS
    targeted_users (
        id SERIAL PRIMARY KEY,
        flag_id INT NOT NULL REFERENCES feature_flags (id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE (flag_id, user_id)
    );

CREATE TABLE IF NOT EXISTS
    audit_log (
        id SERIAL PRIMARY KEY,
        flag_id INT NOT NULL REFERENCES feature_flags (id),
        actor_id TEXT,
        before_state JSONB,
        after_state JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS
    admin_user (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

CREATE UNIQUE INDEX admin_user_username_unique_ci ON admin_user (LOWER(username));

CREATE INDEX idx_feature_flags_key ON feature_flags (key);

CREATE INDEX idx_targeted_users_flag ON targeted_users (flag_id);