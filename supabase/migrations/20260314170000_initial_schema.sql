-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- PROFILES (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  address_line_1 text,
  address_line_2 text,
  city text,
  postcode text,
  stripe_customer_id text unique,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'basic', 'pro')),
  subscription_status text default 'active' check (subscription_status in ('active', 'cancelled', 'past_due', 'trialing')),
  subscription_id text,
  cases_count integer default 0,
  ai_credits_used integer default 0,
  ai_credits_reset_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ORGANISATIONS (canonical list of organisations users interact with)
create table if not exists public.organisations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null check (category in (
    'energy', 'water', 'broadband_phone', 'financial_services',
    'insurance', 'government_hmrc', 'government_dwp', 'government_council',
    'nhs', 'housing', 'retail', 'transport', 'education', 'employment', 'other'
  )),
  complaint_email text,
  complaint_phone text,
  complaint_address text,
  website text,
  ombudsman_name text,
  ombudsman_url text,
  escalation_wait_weeks integer default 8,
  notes text,
  is_verified boolean default false,
  created_at timestamptz default now()
);

-- CASES
create table if not exists public.cases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  organisation_id uuid references public.organisations(id),
  custom_organisation_name text,
  category text not null,
  title text not null,
  description text,
  status text default 'open' check (status in ('open', 'escalated', 'resolved', 'closed')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  reference_number text,
  desired_outcome text,
  amount_in_dispute numeric(10, 2),
  escalation_stage text default 'initial' check (escalation_stage in (
    'initial', 'formal_complaint', 'final_response', 'ombudsman', 'court'
  )),
  escalation_deadline timestamptz,
  first_contact_date timestamptz,
  last_interaction_date timestamptz,
  resolved_date timestamptz,
  resolution_summary text,
  compensation_received numeric(10, 2),
  interaction_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- INTERACTIONS
create table if not exists public.interactions (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid not null references public.cases(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  interaction_date timestamptz not null,
  channel text not null check (channel in (
    'phone', 'email', 'letter', 'webchat', 'in_person', 'social_media', 'app', 'other'
  )),
  direction text not null check (direction in ('inbound', 'outbound')),
  contact_name text,
  contact_department text,
  contact_role text,
  reference_number text,
  duration_minutes integer,
  summary text not null,
  promises_made text,
  promise_deadline timestamptz,
  promise_fulfilled boolean,
  outcome text check (outcome in (
    'resolved', 'escalated', 'promised_callback', 'promised_action',
    'no_resolution', 'transferred', 'disconnected', 'other'
  )),
  next_steps text,
  mood text check (mood in ('helpful', 'neutral', 'unhelpful', 'hostile')),
  ai_summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- EVIDENCE
create table if not exists public.evidence (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid not null references public.cases(id) on delete cascade,
  interaction_id uuid references public.interactions(id) on delete set null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  file_name text not null,
  file_type text not null,
  file_size integer not null,
  storage_path text not null,
  description text,
  evidence_type text check (evidence_type in (
    'screenshot', 'email', 'letter', 'photo', 'voice_memo',
    'document', 'receipt', 'contract', 'other'
  )),
  created_at timestamptz default now()
);

-- LETTERS
create table if not exists public.letters (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid not null references public.cases(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  letter_type text not null check (letter_type in (
    'initial_complaint', 'follow_up', 'escalation', 'final_response_request',
    'ombudsman_referral', 'subject_access_request', 'formal_notice', 'custom'
  )),
  recipient_name text,
  recipient_address text,
  subject text not null,
  body text not null,
  ai_generated boolean default false,
  sent_date timestamptz,
  sent_via text check (sent_via in ('email', 'post', 'not_sent')),
  status text default 'draft' check (status in ('draft', 'sent', 'acknowledged')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ESCALATION RULES
create table if not exists public.escalation_rules (
  id uuid primary key default uuid_generate_v4(),
  category text not null,
  stage text not null,
  stage_order integer not null,
  title text not null,
  description text not null,
  action_required text not null,
  wait_period_days integer,
  deadline_type text check (deadline_type in ('from_complaint', 'from_response', 'absolute')),
  regulatory_body text,
  regulatory_url text,
  template_available boolean default false,
  tips text,
  created_at timestamptz default now()
);

-- REMINDERS
create table if not exists public.reminders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  case_id uuid not null references public.cases(id) on delete cascade,
  interaction_id uuid references public.interactions(id) on delete set null,
  reminder_type text not null check (reminder_type in (
    'promise_deadline', 'escalation_window', 'follow_up', 'custom'
  )),
  title text not null,
  description text,
  due_date timestamptz not null,
  is_sent boolean default false,
  is_dismissed boolean default false,
  created_at timestamptz default now()
);

-- EXPORTS
create table if not exists public.exports (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid not null references public.cases(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  export_type text default 'full_case' check (export_type in ('full_case', 'timeline_only', 'letters_only')),
  created_at timestamptz default now()
);

-- INDEXES
create index if not exists idx_cases_user_id on public.cases(user_id);
create index if not exists idx_cases_status on public.cases(status);
create index if not exists idx_interactions_case_id on public.interactions(case_id);
create index if not exists idx_interactions_date on public.interactions(interaction_date desc);
create index if not exists idx_evidence_case_id on public.evidence(case_id);
create index if not exists idx_letters_case_id on public.letters(case_id);
create index if not exists idx_reminders_user_due
  on public.reminders(user_id, due_date)
  where not is_sent and not is_dismissed;
create index if not exists idx_organisations_name_trgm on public.organisations using gin(name gin_trgm_ops);

-- UPDATED_AT TRIGGER
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at();

drop trigger if exists cases_updated_at on public.cases;
create trigger cases_updated_at before update on public.cases for each row execute function public.update_updated_at();

drop trigger if exists interactions_updated_at on public.interactions;
create trigger interactions_updated_at before update on public.interactions for each row execute function public.update_updated_at();

drop trigger if exists letters_updated_at on public.letters;
create trigger letters_updated_at before update on public.letters for each row execute function public.update_updated_at();

-- PROFILE AUTO-CREATION TRIGGER
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(public.profiles.full_name, excluded.full_name),
      updated_at = now();

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- CASE COUNT TRIGGER
create or replace function public.update_case_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.profiles set cases_count = cases_count + 1 where id = new.user_id;
  elsif tg_op = 'DELETE' then
    update public.profiles set cases_count = greatest(cases_count - 1, 0) where id = old.user_id;
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql;

drop trigger if exists cases_count_trigger on public.cases;
create trigger cases_count_trigger
  after insert or delete on public.cases
  for each row execute function public.update_case_count();

-- INTERACTION COUNT TRIGGER
create or replace function public.update_interaction_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.cases
    set interaction_count = interaction_count + 1,
        last_interaction_date = new.interaction_date
    where id = new.case_id;
  elsif tg_op = 'DELETE' then
    update public.cases
    set interaction_count = greatest(interaction_count - 1, 0)
    where id = old.case_id;
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql;

drop trigger if exists interactions_count_trigger on public.interactions;
create trigger interactions_count_trigger
  after insert or delete on public.interactions
  for each row execute function public.update_interaction_count();

-- RLS
alter table public.profiles enable row level security;
alter table public.organisations enable row level security;
alter table public.cases enable row level security;
alter table public.interactions enable row level security;
alter table public.evidence enable row level security;
alter table public.letters enable row level security;
alter table public.escalation_rules enable row level security;
alter table public.reminders enable row level security;
alter table public.exports enable row level security;

-- PROFILES policies
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select to authenticated using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
for insert to authenticated with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles
for delete to authenticated using (id = auth.uid());

-- CASES policies
drop policy if exists "cases_select_own" on public.cases;
create policy "cases_select_own" on public.cases
for select to authenticated using (user_id = auth.uid());

drop policy if exists "cases_insert_own" on public.cases;
create policy "cases_insert_own" on public.cases
for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "cases_update_own" on public.cases;
create policy "cases_update_own" on public.cases
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "cases_delete_own" on public.cases;
create policy "cases_delete_own" on public.cases
for delete to authenticated using (user_id = auth.uid());

-- INTERACTIONS policies
drop policy if exists "interactions_select_own" on public.interactions;
create policy "interactions_select_own" on public.interactions
for select to authenticated using (user_id = auth.uid());

drop policy if exists "interactions_insert_own" on public.interactions;
create policy "interactions_insert_own" on public.interactions
for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "interactions_update_own" on public.interactions;
create policy "interactions_update_own" on public.interactions
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "interactions_delete_own" on public.interactions;
create policy "interactions_delete_own" on public.interactions
for delete to authenticated using (user_id = auth.uid());

-- EVIDENCE policies
drop policy if exists "evidence_select_own" on public.evidence;
create policy "evidence_select_own" on public.evidence
for select to authenticated using (user_id = auth.uid());

drop policy if exists "evidence_insert_own" on public.evidence;
create policy "evidence_insert_own" on public.evidence
for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "evidence_update_own" on public.evidence;
create policy "evidence_update_own" on public.evidence
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "evidence_delete_own" on public.evidence;
create policy "evidence_delete_own" on public.evidence
for delete to authenticated using (user_id = auth.uid());

-- LETTERS policies
drop policy if exists "letters_select_own" on public.letters;
create policy "letters_select_own" on public.letters
for select to authenticated using (user_id = auth.uid());

drop policy if exists "letters_insert_own" on public.letters;
create policy "letters_insert_own" on public.letters
for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "letters_update_own" on public.letters;
create policy "letters_update_own" on public.letters
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "letters_delete_own" on public.letters;
create policy "letters_delete_own" on public.letters
for delete to authenticated using (user_id = auth.uid());

-- REMINDERS policies
drop policy if exists "reminders_select_own" on public.reminders;
create policy "reminders_select_own" on public.reminders
for select to authenticated using (user_id = auth.uid());

drop policy if exists "reminders_insert_own" on public.reminders;
create policy "reminders_insert_own" on public.reminders
for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "reminders_update_own" on public.reminders;
create policy "reminders_update_own" on public.reminders
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "reminders_delete_own" on public.reminders;
create policy "reminders_delete_own" on public.reminders
for delete to authenticated using (user_id = auth.uid());

-- EXPORTS policies
drop policy if exists "exports_select_own" on public.exports;
create policy "exports_select_own" on public.exports
for select to authenticated using (user_id = auth.uid());

drop policy if exists "exports_insert_own" on public.exports;
create policy "exports_insert_own" on public.exports
for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "exports_update_own" on public.exports;
create policy "exports_update_own" on public.exports
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "exports_delete_own" on public.exports;
create policy "exports_delete_own" on public.exports
for delete to authenticated using (user_id = auth.uid());

-- ORGANISATIONS policies
drop policy if exists "organisations_select_authenticated" on public.organisations;
create policy "organisations_select_authenticated" on public.organisations
for select to authenticated using (true);

drop policy if exists "organisations_insert_service_role" on public.organisations;
create policy "organisations_insert_service_role" on public.organisations
for insert to service_role with check (true);

drop policy if exists "organisations_update_service_role" on public.organisations;
create policy "organisations_update_service_role" on public.organisations
for update to service_role using (true) with check (true);

drop policy if exists "organisations_delete_service_role" on public.organisations;
create policy "organisations_delete_service_role" on public.organisations
for delete to service_role using (true);

-- ESCALATION RULES policies
drop policy if exists "escalation_rules_select_authenticated" on public.escalation_rules;
create policy "escalation_rules_select_authenticated" on public.escalation_rules
for select to authenticated using (true);

drop policy if exists "escalation_rules_insert_service_role" on public.escalation_rules;
create policy "escalation_rules_insert_service_role" on public.escalation_rules
for insert to service_role with check (true);

drop policy if exists "escalation_rules_update_service_role" on public.escalation_rules;
create policy "escalation_rules_update_service_role" on public.escalation_rules
for update to service_role using (true) with check (true);

drop policy if exists "escalation_rules_delete_service_role" on public.escalation_rules;
create policy "escalation_rules_delete_service_role" on public.escalation_rules
for delete to service_role using (true);

-- Storage bucket + policies
insert into storage.buckets (id, name, public, file_size_limit)
values ('evidence', 'evidence', false, 10485760)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

drop policy if exists "evidence_storage_select_own" on storage.objects;
create policy "evidence_storage_select_own" on storage.objects
for select to authenticated
using (
  bucket_id = 'evidence'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "evidence_storage_insert_own" on storage.objects;
create policy "evidence_storage_insert_own" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'evidence'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "evidence_storage_update_own" on storage.objects;
create policy "evidence_storage_update_own" on storage.objects
for update to authenticated
using (
  bucket_id = 'evidence'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'evidence'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "evidence_storage_delete_own" on storage.objects;
create policy "evidence_storage_delete_own" on storage.objects
for delete to authenticated
using (
  bucket_id = 'evidence'
  and (storage.foldername(name))[1] = auth.uid()::text
);
