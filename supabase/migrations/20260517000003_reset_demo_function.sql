-- Función para resetear los datos del usuario demo
create or replace function reset_demo_data()
returns void
language plpgsql
security definer -- Se ejecuta con permisos de superusuario para poder borrar/insertar
as $$
declare
    v_user_id uuid;
begin
    -- 1. Obtener el ID del usuario demo
    select id into v_user_id from auth.users where email = 'demo@dentalcloud.com';

    -- Si no existe el usuario demo, no hacemos nada
    if v_user_id is null then
        return;
    end if;

    -- 2. Borrar datos existentes del usuario demo (borrado en cascada debería manejar turnos/historias)
    delete from public.historias_clinicas where user_id = v_user_id;
    delete from public.turnos where user_id = v_user_id;
    delete from public.pacientes where user_id = v_user_id;

    -- 3. Re-insertar Pacientes de prueba
    insert into public.pacientes (id, nombre, telefono, email, obra_social, alertas, user_id)
    values
      ('11111111-1111-1111-1111-111111111111', 'Juan Manuel González', '3424567890', 'juan.gonzalez@email.com', 'OSDE 310', null, v_user_id),
      ('22222222-2222-2222-2222-222222222222', 'María Elena Rodríguez', '3425123456', 'm.rodriguez@email.com', 'PAMI', 'Hipertensión - Toma medicación', v_user_id),
      ('33333333-3333-3333-3333-333333333333', 'Carlos Alberto López', '3424887766', 'carlos.lopez@email.com', 'Swiss Medical', null, v_user_id),
      ('44444444-4444-4444-4444-444444444444', 'Ana Laura Martínez', '3426154321', 'ana.martinez@email.com', 'Galeno', null, v_user_id),
      ('55555555-5555-5555-5555-555555555555', 'Diego Armando Fernández', '3424001122', 'diego.fernandez@email.com', 'Particular', null, v_user_id);

    -- 4. Re-insertar Turnos de prueba para la semana de Mayo 2026
    insert into public.turnos (paciente_id, fecha_hora, motivo, estado, user_id)
    values
      ('11111111-1111-1111-1111-111111111111', '2026-05-18T08:30:00Z', 'Limpieza y control de rutina', 'confirmado', v_user_id),
      ('22222222-2222-2222-2222-222222222222', '2026-05-18T10:00:00Z', 'Reparación de prótesis parcial', 'confirmado', v_user_id),
      ('33333333-3333-3333-3333-333333333333', '2026-05-19T11:15:00Z', 'Dolor en primer premolar superior', 'pendiente', v_user_id),
      ('55555555-5555-5555-5555-555555555555', '2026-05-19T15:00:00Z', 'Consulta inicial por implantes', 'pendiente', v_user_id),
      ('44444444-4444-4444-4444-444444444444', '2026-05-20T09:00:00Z', 'Extracción de tercer molar (cirugía)', 'confirmado', v_user_id),
      ('11111111-1111-1111-1111-111111111111', '2026-05-20T16:30:00Z', 'Blanqueamiento dental - Sesión 1', 'cancelado', v_user_id),
      ('22222222-2222-2222-2222-222222222222', '2026-05-21T14:00:00Z', 'Tratamiento de conducto', 'confirmado', v_user_id),
      ('33333333-3333-3333-3333-333333333333', '2026-05-22T10:30:00Z', 'Control post-cirugía', 'pendiente', v_user_id);
end;
$$;
