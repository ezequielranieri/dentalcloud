import { supabase } from './supabase';

export async function resetDemoData(userId: string) {
  console.log('Resetting demo data for user:', userId);

  // 1. Borrar datos existentes del usuario demo
  // El borrado en cascada en la DB debería encargarse de turnos e historias si están bien configuradas,
  // pero lo hacemos explícito para seguridad.
  await supabase.from('historias_clinicas').delete().eq('user_id', userId);
  await supabase.from('turnos').delete().eq('user_id', userId);
  await supabase.from('pacientes').delete().eq('user_id', userId);

  // 2. Insertar pacientes de prueba
  const { data: pacientes, error: pError } = await supabase
    .from('pacientes')
    .insert([
      { id: '11111111-1111-1111-1111-111111111111', nombre: 'Juan Manuel González', telefono: '3424567890', email: 'juan.gonzalez@email.com', obra_social: 'OSDE 310', user_id: userId },
      { id: '22222222-2222-2222-2222-222222222222', nombre: 'María Elena Rodríguez', telefono: '3425123456', email: 'm.rodriguez@email.com', obra_social: 'PAMI', alertas: 'Hipertensión - Toma medicación', user_id: userId },
      { id: '33333333-3333-3333-3333-333333333333', nombre: 'Carlos Alberto López', telefono: '3424887766', email: 'carlos.lopez@email.com', obra_social: 'Swiss Medical', user_id: userId },
      { id: '44444444-4444-4444-4444-444444444444', nombre: 'Ana Laura Martínez', telefono: '3426154321', email: 'ana.martinez@email.com', obra_social: 'Galeno', user_id: userId },
      { id: '55555555-5555-5555-5555-555555555555', nombre: 'Diego Armando Fernández', telefono: '3424001122', email: 'diego.fernandez@email.com', obra_social: 'Particular', user_id: userId }
    ])
    .select();

  if (pError) {
    console.error('Error reseteando pacientes demo:', pError);
    return;
  }

  // 3. Insertar turnos de prueba para la semana actual
  // Usamos fechas fijas relativas a mayo 2026 como en el seed original
  await supabase.from('turnos').insert([
    { paciente_id: '11111111-1111-1111-1111-111111111111', fecha_hora: '2026-05-18T08:30:00Z', motivo: 'Limpieza y control de rutina', estado: 'confirmado', user_id: userId },
    { paciente_id: '22222222-2222-2222-2222-222222222222', fecha_hora: '2026-05-18T10:00:00Z', motivo: 'Reparación de prótesis parcial', estado: 'confirmado', user_id: userId },
    { paciente_id: '33333333-3333-3333-3333-333333333333', fecha_hora: '2026-05-19T11:15:00Z', motivo: 'Dolor en primer premolar superior', estado: 'pendiente', user_id: userId },
    { paciente_id: '55555555-5555-5555-5555-555555555555', fecha_hora: '2026-05-19T15:00:00Z', motivo: 'Consulta inicial por implantes', estado: 'pendiente', user_id: userId },
    { paciente_id: '44444444-4444-4444-4444-444444444444', fecha_hora: '2026-05-20T09:00:00Z', motivo: 'Extracción de tercer molar (cirugía)', estado: 'confirmado', user_id: userId },
    { paciente_id: '11111111-1111-1111-1111-111111111111', fecha_hora: '2026-05-20T16:30:00Z', motivo: 'Blanqueamiento dental - Sesión 1', estado: 'cancelado', user_id: userId },
    { paciente_id: '22222222-2222-2222-2222-222222222222', fecha_hora: '2026-05-21T14:00:00Z', motivo: 'Tratamiento de conducto', estado: 'confirmado', user_id: userId },
    { paciente_id: '33333333-3333-3333-3333-333333333333', fecha_hora: '2026-05-22T10:30:00Z', motivo: 'Control post-cirugía', estado: 'pendiente', user_id: userId }
  ]);
}
