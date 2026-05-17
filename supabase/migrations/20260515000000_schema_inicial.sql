create table if not exists pacientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text,
  obra_social text,
  alertas text,
  created_at timestamptz default now()
);

create table if not exists turnos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes(id) on delete cascade,
  fecha_hora timestamptz not null,
  motivo text,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'confirmado', 'cancelado')),
  created_at timestamptz default now()
);

create table if not exists historias_clinicas (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes(id) on delete cascade,
  fecha date not null default current_date,
  descripcion text,
  odontograma_json jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_pacientes_nombre on pacientes(nombre);
create index if not exists idx_turnos_paciente on turnos(paciente_id);
create index if not exists idx_turnos_fecha on turnos(fecha_hora);
create index if not exists idx_historias_paciente on historias_clinicas(paciente_id);

alter table pacientes enable row level security;
alter table turnos enable row level security;
alter table historias_clinicas enable row level security;

create policy "Permitir todo a autenticados en pacientes" on pacientes for all using (auth.role() = 'authenticated');
create policy "Permitir todo a autenticados en turnos" on turnos for all using (auth.role() = 'authenticated');
create policy "Permitir todo a autenticados en historias" on historias_clinicas for all using (auth.role() = 'authenticated');
