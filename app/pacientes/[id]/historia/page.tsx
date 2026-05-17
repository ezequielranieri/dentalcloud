'use client';

import React, { useEffect, useState, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, type Paciente } from '@/lib/supabase';
import { 
  ChevronLeft, 
  Save, 
  Calendar as CalendarIcon, 
  FileText, 
  Stethoscope,
  Activity,
  CheckCircle2
} from 'lucide-react';
import Odontograma, { type EstadoDiente } from '@/components/Odontograma';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function HistoriaClinicaPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [descripcion, setDescripcion] = useState('');
  const [tratamiento, setTratamiento] = useState('');
  const [odontograma, setOdontograma] = useState<Record<number, EstadoDiente>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    
    // 1. Fetch patient
    const { data: pData } = await supabase
      .from('pacientes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (pData) setPaciente(pData);

    // 2. Fetch latest history to initialize odontogram
    const { data: hData } = await supabase
      .from('historias_clinicas')
      .select('odontograma_json')
      .eq('paciente_id', id)
      .order('fecha', { ascending: false })
      .limit(1)
      .single();

    if (hData?.odontograma_json) {
      setOdontograma(hData.odontograma_json as Record<number, EstadoDiente>);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOdontogramaChange = (diente: number, estado: EstadoDiente) => {
    setOdontograma(prev => ({
      ...prev,
      [diente]: estado
    }));
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    const { data: { user } } = await supabase.auth.getUser();

    // Combinamos descripción y tratamiento para el campo 'descripcion' de la DB
    // o podríamos guardarlo estructurado si la DB lo permitiera. 
    // Según el GEMINI.md, usamos 'descripcion'.
    const fullDescription = `TRATAMIENTO: ${tratamiento}\n\nNOTAS: ${descripcion}`;

    const { error } = await supabase
      .from('historias_clinicas')
      .insert({
        paciente_id: id,
        fecha,
        descripcion: fullDescription,
        odontograma_json: odontograma,
        user_id: user?.id
      });

    if (error) {
      console.error('Error al guardar historia:', error);
      alert('Hubo un error al guardar los datos');
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push('/pacientes');
      }, 1500);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-safe">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button 
          onClick={() => router.back()}
          className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-gray-900 leading-tight truncate">{paciente?.nombre}</h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            Nueva Sesión Clínica
          </p>
        </div>
        <button
          form="historia-form"
          type="submit"
          disabled={saving || success}
          className={`
            inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all
            ${success 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-100'
            }
            disabled:opacity-70
          `}
        >
          {success ? (
            <CheckCircle2 size={18} />
          ) : (
            <>
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              <span className="hidden sm:inline">Guardar</span>
            </>
          )}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
        <form id="historia-form" onSubmit={handleSave} className="max-w-4xl mx-auto space-y-8">
          
          {/* Formulario de Sesión */}
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <CalendarIcon size={14} className="text-blue-500" /> Fecha de Sesión
                </label>
                <input
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 appearance-none"
                />
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Stethoscope size={14} className="text-blue-500" /> Tratamiento Realizado
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Limpieza, Extracción..."
                  value={tratamiento}
                  onChange={(e) => setTratamiento(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <FileText size={14} className="text-blue-500" /> Descripción y Observaciones
              </label>
              <textarea
                rows={4}
                placeholder="Detalles de la sesión, hallazgos, indicaciones..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Odontograma */}
          <section className="space-y-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <Activity size={16} className="text-blue-600" />
                Odontograma Visual
              </h2>
              <p className="text-[11px] text-gray-400 font-medium">Tocá cada diente para cambiar su estado</p>
            </div>
            
            <div className="relative -mx-4 px-4 overflow-hidden">
              <div className="overflow-x-auto pb-4 scrollbar-hide">
                <Odontograma 
                  valor={odontograma} 
                  onChange={handleOdontogramaChange} 
                />
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-full bg-gradient-to-l from-gray-50 pointer-events-none md:hidden" />
            </div>
          </section>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-blue-700 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Activity size={18} className="text-blue-600" />
            </div>
            <p className="leading-relaxed">
              <strong>Tip:</strong> El odontograma muestra el último estado registrado. Los cambios se guardarán como una nueva sesión.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
