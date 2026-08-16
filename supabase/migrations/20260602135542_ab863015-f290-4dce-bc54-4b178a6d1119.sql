
-- Profiles
create table public.users_profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  company_name text,
  business_type text,
  country text,
  sector text,
  calendly_link text,
  topmate_link text,
  google_calendar_link text,
  zoom_link text,
  email_signature text,
  products_services text,
  target_countries text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.users_profile to authenticated;
grant all on public.users_profile to service_role;
alter table public.users_profile enable row level security;
create policy "own profile select" on public.users_profile for select to authenticated using (auth.uid() = user_id);
create policy "own profile insert" on public.users_profile for insert to authenticated with check (auth.uid() = user_id);
create policy "own profile update" on public.users_profile for update to authenticated using (auth.uid() = user_id);
create policy "own profile delete" on public.users_profile for delete to authenticated using (auth.uid() = user_id);

-- Opportunities
create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_goal text,
  product_name text,
  sector text,
  hs_code text,
  source_country text,
  target_country text,
  target_buyer_type text,
  business_stage text,
  product_description text,
  certifications text,
  monthly_capacity text,
  price_range text,
  website_link text,
  ai_report jsonb,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.opportunities to authenticated;
grant all on public.opportunities to service_role;
alter table public.opportunities enable row level security;
create policy "own opp all" on public.opportunities for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Leads
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  company text,
  email text,
  phone text,
  whatsapp text,
  country text,
  sector text,
  interest text,
  source text,
  product_interest text,
  status text default 'New',
  lead_score text default 'Warm',
  notes text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.leads to authenticated;
grant all on public.leads to service_role;
alter table public.leads enable row level security;
create policy "own leads all" on public.leads for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Outreach messages
create table public.outreach_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  channel text,
  subject text,
  message text,
  status text default 'Draft Generated',
  scheduled_date timestamptz,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.outreach_messages to authenticated;
grant all on public.outreach_messages to service_role;
alter table public.outreach_messages enable row level security;
create policy "own outreach all" on public.outreach_messages for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Follow-ups
create table public.followups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  campaign_name text,
  followup_type text,
  channel text,
  message text,
  due_date timestamptz,
  status text default 'Pending',
  step_number int default 1,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.followups to authenticated;
grant all on public.followups to service_role;
alter table public.followups enable row level security;
create policy "own followups all" on public.followups for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Discovery calls
create table public.discovery_calls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  platform text,
  booking_link text,
  meeting_date timestamptz,
  meeting_status text default 'Scheduled',
  pre_call_brief jsonb,
  post_call_summary text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.discovery_calls to authenticated;
grant all on public.discovery_calls to service_role;
alter table public.discovery_calls enable row level security;
create policy "own calls all" on public.discovery_calls for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create profile trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users_profile (user_id, full_name, company_name, business_type, country, sector)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'company_name',
    new.raw_user_meta_data->>'business_type',
    new.raw_user_meta_data->>'country',
    new.raw_user_meta_data->>'sector'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
