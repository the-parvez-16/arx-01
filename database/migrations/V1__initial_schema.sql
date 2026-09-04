CREATE TYPE user_role AS ENUM ('ADMIN', 'ANALYST');

CREATE TYPE policy_decision AS ENUM ('ALLOWED', 'BLOCKED');

CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED');

CREATE TYPE payment_failure_reason AS ENUM (
    'INSUFFICIENT_FUNDS',
    'CARD_EXPIRED',
    'BANK_DECLINED',
    'NETWORK_ERROR',
    'LIMIT_EXCEEDED'
);

CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'PAST_DUE', 'PAUSED', 'CANCELLED');

CREATE TYPE recovery_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RECOVERED', 'EXHAUSTED', 'CANCELLED');

CREATE TYPE recovery_action AS ENUM ('SMART_RETRY', 'PAYMENT_LINK', 'REMINDER', 'ESCALATE', 'NO_ACTION');

CREATE TYPE recovery_outcome AS ENUM ('SUCCEEDED', 'FAILED', 'SKIPPED', 'BLOCKED');

CREATE TYPE audit_event_type AS ENUM (
    'RECOVERY_CREATED',
    'AI_RECOMMENDATION',
    'POLICY_BLOCKED',
    'ACTION_EXECUTED',
    'PAYMENT_RECOVERED',
    'RECOVERY_EXHAUSTED'
);

CREATE TABLE merchants (
    id uuid PRIMARY KEY,
    name varchar NOT NULL,
    email varchar NOT NULL UNIQUE,
    created_at timestamptz NOT NULL
);

CREATE TABLE users (
    id uuid PRIMARY KEY,
    merchant_id uuid NOT NULL REFERENCES merchants (id),
    name varchar NOT NULL,
    email varchar NOT NULL UNIQUE,
    role user_role NOT NULL,
    created_at timestamptz NOT NULL
);

CREATE TABLE customers (
    id uuid PRIMARY KEY,
    merchant_id uuid NOT NULL REFERENCES merchants (id),
    external_ref varchar NOT NULL,
    name varchar NOT NULL,
    email varchar NOT NULL,
    created_at timestamptz NOT NULL
);

CREATE TABLE subscriptions (
    id uuid PRIMARY KEY,
    merchant_id uuid NOT NULL REFERENCES merchants (id),
    customer_id uuid NOT NULL REFERENCES customers (id),
    status subscription_status NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency char(3) NOT NULL,
    next_billing_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL
);

CREATE TABLE payments (
    id uuid PRIMARY KEY,
    merchant_id uuid NOT NULL REFERENCES merchants (id),
    customer_id uuid NOT NULL REFERENCES customers (id),
    subscription_id uuid NOT NULL REFERENCES subscriptions (id),
    amount numeric(12,2) NOT NULL,
    currency char(3) NOT NULL,
    status payment_status NOT NULL,
    failure_reason payment_failure_reason,
    attempt_count int NOT NULL,
    failed_at timestamptz,
    recovered_at timestamptz,
    created_at timestamptz NOT NULL
);

CREATE TABLE recovery_cases (
    id uuid PRIMARY KEY,
    merchant_id uuid NOT NULL REFERENCES merchants (id),
    payment_id uuid NOT NULL REFERENCES payments (id),
    status recovery_status NOT NULL,
    risk_score numeric(5,4) NOT NULL,
    amount_at_risk numeric(12,2) NOT NULL,
    recommended_action recovery_action NOT NULL,
    executed_action recovery_action,
    created_at timestamptz NOT NULL,
    resolved_at timestamptz
);

CREATE TABLE recovery_attempts (
    id uuid PRIMARY KEY,
    recovery_case_id uuid NOT NULL REFERENCES recovery_cases (id),
    attempt_no int NOT NULL,
    action recovery_action NOT NULL,
    scheduled_at timestamptz NOT NULL,
    executed_at timestamptz,
    outcome recovery_outcome,
    amount_recovered numeric(12,2),
    created_at timestamptz NOT NULL
);

CREATE TABLE decision_logs (
    id uuid PRIMARY KEY,
    recovery_case_id uuid NOT NULL REFERENCES recovery_cases (id),
    model varchar NOT NULL,
    recommendation recovery_action NOT NULL,
    confidence numeric(5,4) NOT NULL,
    reason text NOT NULL,
    policy_decision policy_decision NOT NULL,
    created_at timestamptz NOT NULL
);

CREATE TABLE audit_events (
    id uuid PRIMARY KEY,
    merchant_id uuid NOT NULL REFERENCES merchants (id),
    recovery_case_id uuid NOT NULL REFERENCES recovery_cases (id),
    event_type audit_event_type NOT NULL,
    actor_type varchar NOT NULL,
    actor_id uuid NOT NULL,
    payload jsonb NOT NULL,
    created_at timestamptz NOT NULL
);
