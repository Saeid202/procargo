create table order_response (
    id uuid primary key default uuid_generate_v4(),
    order_number text references orders(order_number),
    agent_id uuid,
    response text,
    price numeric,
    delivery_date timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);