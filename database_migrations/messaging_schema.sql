-- Messaging schema for Supabase
-- Run in Supabase SQL editor (authenticated with service role)

-- Conversations table
create table if not exists direct_message_threads (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    created_by uuid references auth.users(id) on delete set null,
    is_group boolean not null default false,
    title text,
    metadata jsonb not null default '{}'::jsonb,
    last_message_at timestamptz,
    last_message_preview text
);

-- Membership table
create table if not exists direct_message_thread_members (
    thread_id uuid not null references direct_message_threads(id) on delete cascade,
    user_id uuid not null references profiles(id) on delete cascade,
    is_admin boolean not null default false,
    joined_at timestamptz not null default now(),
    last_read_at timestamptz,
    primary key (thread_id, user_id)
);

-- Messages table
create table if not exists direct_messages (
    id uuid primary key default gen_random_uuid(),
    thread_id uuid not null references direct_message_threads(id) on delete cascade,
    sender_id uuid not null references profiles(id) on delete set null,
    body text not null,
    created_at timestamptz not null default now(),
    metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_direct_messages_thread_time on direct_messages(thread_id, created_at);
create index if not exists idx_direct_message_members_user on direct_message_thread_members(user_id);
create index if not exists idx_direct_message_threads_updated on direct_message_threads(updated_at desc);

-- Trigger to keep conversations fresh
create or replace function set_direct_message_thread_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    update direct_message_threads
    set
        updated_at = now(),
        last_message_at = new.created_at,
        last_message_preview = left(new.body, 280)
    where id = new.thread_id;
    return new;
end;
$$;

drop trigger if exists trg_direct_message_thread_activity on direct_messages;
create trigger trg_direct_message_thread_activity
after insert on direct_messages
for each row
execute procedure set_direct_message_thread_activity();

-- Helper function to create or reuse a direct thread
create or replace function create_or_get_direct_thread(target_user uuid)
returns direct_message_threads
language plpgsql
security definer
set search_path = public
as $$
declare
    current_user_id uuid := auth.uid();
    existing_thread uuid;
    thread_row direct_message_threads;
begin
    if current_user_id is null then
        raise exception 'Must be authenticated to create threads';
    end if;

    if target_user is null or target_user = current_user_id then
        raise exception 'Target user is required';
    end if;

    select dt.id
    into existing_thread
    from direct_message_threads dt
    join direct_message_thread_members m1 on m1.thread_id = dt.id and m1.user_id = current_user_id
    join direct_message_thread_members m2 on m2.thread_id = dt.id and m2.user_id = target_user
    where dt.is_group = false
    limit 1;

    if existing_thread is not null then
        select * into thread_row from direct_message_threads where id = existing_thread;
        return thread_row;
    end if;

    insert into direct_message_threads (created_by, is_group, metadata)
    values (current_user_id, false, '{}'::jsonb)
    returning * into thread_row;

    insert into direct_message_thread_members (thread_id, user_id, is_admin)
    values (thread_row.id, current_user_id, true)
    on conflict do nothing;

    insert into direct_message_thread_members (thread_id, user_id, is_admin)
    values (thread_row.id, target_user, false)
    on conflict do nothing;

    return thread_row;
end;
$$;

-- Helper to evaluate membership without RLS recursion
create or replace function is_direct_thread_member(p_thread_id uuid, p_user_id uuid default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    effective_user uuid := coalesce(p_user_id, auth.uid());
begin
    if effective_user is null then
        return false;
    end if;

    return exists (
        select 1
        from direct_message_thread_members
        where thread_id = p_thread_id
          and user_id = effective_user
    );
end;
$$;

-- Enable row-level security
alter table direct_message_threads enable row level security;
alter table direct_message_thread_members enable row level security;
alter table direct_messages enable row level security;

-- Policies for conversations
drop policy if exists "Members can read their threads" on direct_message_threads;
create policy "Members can read their threads"
on direct_message_threads
for select
using (is_direct_thread_member(id));

drop policy if exists "Creators can insert threads" on direct_message_threads;
create policy "Creators can insert threads"
on direct_message_threads
for insert
with check (created_by = auth.uid());

drop policy if exists "Members can update activity metadata" on direct_message_threads;
create policy "Members can update activity metadata"
on direct_message_threads
for update
using (is_direct_thread_member(id))
with check (is_direct_thread_member(id));

-- Policies for memberships
drop policy if exists "Members can view membership rows" on direct_message_thread_members;
create policy "Members can view membership rows"
on direct_message_thread_members
for select
using (is_direct_thread_member(direct_message_thread_members.thread_id));

drop policy if exists "Users can join their own threads" on direct_message_thread_members;
create policy "Users can join their own threads"
on direct_message_thread_members
for insert
with check (
    user_id = auth.uid()
    or is_direct_thread_member(direct_message_thread_members.thread_id)
);

drop policy if exists "Members can update their receipt state" on direct_message_thread_members;
create policy "Members can update their receipt state"
on direct_message_thread_members
for update
using (user_id = auth.uid());

drop policy if exists "Members can leave threads" on direct_message_thread_members;
create policy "Members can leave threads"
on direct_message_thread_members
for delete
using (user_id = auth.uid());

-- Policies for messages
drop policy if exists "Members can read messages" on direct_messages;
create policy "Members can read messages"
on direct_messages
for select
using (is_direct_thread_member(thread_id));

drop policy if exists "Members can send messages" on direct_messages;
create policy "Members can send messages"
on direct_messages
for insert
with check (
    sender_id = auth.uid()
    and is_direct_thread_member(thread_id)
);
