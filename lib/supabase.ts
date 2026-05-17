import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing in environment variables');
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Tipos globales del dominio
export type Paciente = {
  id: string;
  user_id: string;
  nombre: string;
  telefono: string;
  email?: string;
  obra_social?: string;
  alertas?: string;
  created_at: string;
};

export type Turno = {
  id: string;
  user_id: string;
  paciente_id: string;
  fecha_hora: string;
  motivo: string;
  estado: 'pendiente' | 'confirmado' | 'cancelado';
  created_at: string;
  pacientes?: Paciente;
};

export type HistoriaClinica = {
  id: string;
  user_id: string;
  paciente_id: string;
  fecha: string;
  descripcion: string;
  odontograma_json: Record<number, string>;
  created_at: string;
};
