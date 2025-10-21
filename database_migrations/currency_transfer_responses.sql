create table if not exists currency_transfer_responses (
    id uuid primary key default uuid_generate_v4(),
    transfer_id uuid not null references currency_transfer_requests(id) on delete cascade,
    agent_id uuid references profiles(id) on delete set null,
    response text not null,
    offered_rate numeric,
    fee numeric,
    delivery_date timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create index if not exists idx_currency_transfer_responses_transfer
    on currency_transfer_responses(transfer_id);
