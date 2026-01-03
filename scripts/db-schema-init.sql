CREATE TABLE
    IF NOT EXISTS feature_flags (
        id SERIAL PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        description TEXT UNIQUE NOT NULL,
        enabled BOOLEAN DEFAULT FALSE,
        default_value BOOLEAN DEFAULT FALSE,
        rollout_percentage INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW (),
        updated_at TIMESTAMP DEFAULT NOW ()
    );

CREATE TABLE
    IF NOT EXISTS targeted_users (
        id SERIAL PRIMARY KEY,
        flag_id INT REFERENCES feature_flags (id),
        user_id TEXT NOT NULL
    );

CREATE TABLE
    IF NOT EXISTS audit_log (
        id SERIAL PRIMARY KEY,
        flag_id INT REFERENCES feature_flags (id),
        actor_id TEXT,
        before_state JSONB,
        after_state JSONB,
        created_at TIMESTAMP DEFAULT NOW ()
    );