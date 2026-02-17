-- Create a table to store chat history for WhatsApp Assistant
create table public.chat_history (
  id uuid not null default gen_random_uuid (),
  contact_phone text not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  message text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  constraint chat_history_pkey primary key (id)
);

-- Add index for fast retrieval by phone number
create index idx_chat_history_contact_phone on public.chat_history (contact_phone, created_at desc);

-- Enable RLS (Row Level Security)
alter table public.chat_history enable row level security;

-- Allow anonymous access (since n8n uses the anon/service role via API)
-- In a stricter environment, we would restrict this, but for this MVP with n8n using the API key, this is acceptable if we create a policy.
-- Actually, n8n uses the Service Role (usually) or Anon Key. If using Anon Key, we need a policy.
create policy "Allow generic access for now" on public.chat_history
  for all
  using (true)
  with check (true);
