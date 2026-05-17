-- Migración para aislamiento de datos por usuario (Multi-tenancy)

-- 1. Agregar columna user_id a las tablas principales si no existen
alter table pacientes add column if not exists user_id uuid references auth.users(id) default auth.uid();
alter table turnos add column if not exists user_id uuid references auth.users(id) default auth.uid();
alter table historias_clinicas add column if not exists user_id uuid references auth.users(id) default auth.uid();

-- 2. Actualizar políticas de RLS para Pacientes
drop policy if exists "Permitir todo a autenticados en pacientes" on pacientes;
drop policy if exists "Usuarios ven solo sus pacientes" on pacientes;
create policy "Usuarios ven solo sus pacientes" on pacientes for all using (auth.uid() = user_id);

-- 3. Actualizar políticas de RLS para Turnos
drop policy if exists "Permitir todo a autenticados en turnos" on turnos;
drop policy if exists "Usuarios ven solo sus turnos" on turnos;
create policy "Usuarios ven solo sus turnos" on turnos for all using (auth.uid() = user_id);

-- 4. Actualizar políticas de RLS para Historias Clínicas
drop policy if exists "Permitir todo a autenticados en historias" on historias_clinicas;
drop policy if exists "Usuarios ven solo sus historias" on historias_clinicas;
create policy "Usuarios ven solo sus historias" on historias_clinicas for all using (auth.uid() = user_id);

-- 5. Crear índices para mejorar el rendimiento de las consultas filtradas por user_id
create index if not exists idx_pacientes_user_id on pacientes(user_id);
create index if not exists idx_turnos_user_id on turnos(user_id);
create index if not exists idx_historias_user_id on historias_clinicas(user_id);
