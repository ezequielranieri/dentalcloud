-- Seed de datos para DentalCloud (Santa Fe / Nombres Genéricos)

-- Obtenemos el ID del usuario demo
do $$
declare
    v_user_id uuid;
begin
    select id into v_user_id from auth.users where email = 'demo@dentalcloud.com';

    -- Limpiar turnos existentes para tener una agenda limpia en la demo
    truncate table turnos cascade;

    -- 1. Pacientes Ficticios (Usamos ON CONFLICT para no duplicar si ya existen)
    insert into pacientes (id, nombre, telefono, email, obra_social, alertas, user_id)
    values
      ('11111111-1111-1111-1111-111111111111', 'Juan Manuel González', '3424567890', 'juan.gonzalez@email.com', 'OSDE 310', null, v_user_id),
      ('22222222-2222-2222-2222-222222222222', 'María Elena Rodríguez', '3425123456', 'm.rodriguez@email.com', 'PAMI', 'Hipertensión - Toma medicación', v_user_id),
      ('33333333-3333-3333-3333-333333333333', 'Carlos Alberto López', '3424887766', 'carlos.lopez@email.com', 'Swiss Medical', null, v_user_id),
      ('44444444-4444-4444-4444-444444444444', 'Ana Laura Martínez', '3426154321', 'ana.martinez@email.com', 'Galeno', null, v_user_id),
      ('55555555-5555-5555-5555-555555555555', 'Diego Armando Fernández', '3424001122', 'diego.fernandez@email.com', 'Particular', null, v_user_id)
    on conflict (id) do update set user_id = v_user_id;

    -- 2. Turnos para la semana actual (Lunes 18 al Viernes 22 de Mayo 2026)
    insert into turnos (paciente_id, fecha_hora, motivo, estado, user_id)
    values
      -- Lunes 18
      ('11111111-1111-1111-1111-111111111111', '2026-05-18T08:30:00Z', 'Limpieza y control de rutina', 'confirmado', v_user_id),
      ('22222222-2222-2222-2222-222222222222', '2026-05-18T10:00:00Z', 'Reparación de prótesis parcial', 'confirmado', v_user_id),
      
      -- Martes 19
      ('33333333-3333-3333-3333-333333333333', '2026-05-19T11:15:00Z', 'Dolor en primer premolar superior', 'pendiente', v_user_id),
      ('55555555-5555-5555-5555-555555555555', '2026-05-19T15:00:00Z', 'Consulta inicial por implantes', 'pendiente', v_user_id),
      
      -- Miércoles 20
      ('44444444-4444-4444-4444-444444444444', '2026-05-20T09:00:00Z', 'Extracción de tercer molar (cirugía)', 'confirmado', v_user_id),
      ('11111111-1111-1111-1111-111111111111', '2026-05-20T16:30:00Z', 'Blanqueamiento dental - Sesión 1', 'cancelado', v_user_id),
      
      -- Jueves 21
      ('22222222-2222-2222-2222-222222222222', '2026-05-21T14:00:00Z', 'Tratamiento de conducto', 'confirmado', v_user_id),
      
      -- Viernes 22
      ('33333333-3333-3333-3333-333333333333', '2026-05-22T10:30:00Z', 'Control post-cirugía', 'pendiente', v_user_id);
end $$;
