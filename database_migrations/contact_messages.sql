create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  company text,
  subject text not null,
  message text not null,
  created_at timestamptz default now()
);