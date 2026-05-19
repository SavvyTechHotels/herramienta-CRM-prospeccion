-- Ejecuta este SQL en Supabase → SQL Editor

create table hotels (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  habitaciones integer,
  estrellas numeric(2,1),
  tipo text,
  segmento text,
  spa boolean default false,
  restaurante boolean default false,
  piscina boolean default false,
  gimnasio boolean default false,
  parking boolean default false,
  salas_reunion boolean default false,
  room_service boolean default false,
  facturacion_anual numeric,
  presencia_ota boolean default false,
  porcentaje_ota numeric(5,2),
  score numeric(5,1) default 0,
  tier text default 'D',
  status text default 'sin_contactar',
  assigned_to text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid references hotels(id) on delete cascade,
  nombre text not null,
  email text,
  cargo text
);

create table notes (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid references hotels(id) on delete cascade,
  user_id uuid references auth.users(id),
  user_email text,
  text text not null,
  created_at timestamptz default now()
);

-- Actualiza updated_at automáticamente
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger hotels_updated_at
  before update on hotels
  for each row execute function update_updated_at();

-- Row Level Security: solo usuarios autenticados pueden acceder
alter table hotels enable row level security;
alter table contacts enable row level security;
alter table notes enable row level security;

create policy "Authenticated users can do everything on hotels"
  on hotels for all to authenticated using (true) with check (true);

create policy "Authenticated users can do everything on contacts"
  on contacts for all to authenticated using (true) with check (true);

create policy "Authenticated users can do everything on notes"
  on notes for all to authenticated using (true) with check (true);
