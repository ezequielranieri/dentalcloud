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
        odontograma_json: odontograma
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
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 shadow-sm">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900 leading-tight">Nueva Sesión Clínica</h1>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
            Paciente: <span className="text-blue-600">{paciente?.nombre}</span>
          </p>
        </div>
        <button
          form="historia-form"
          type="submit"
          disabled={saving || success}
          className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
            ${success 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-sm'
            }
            disabled:opacity-70
          `}
        >
          {success ? (
            <>
              <CheckCircle2 size={18} />
              Guardado
            </>
          ) : (
            <>
              <Save size={18} />
              {saving ? 'Guardando...' : 'Guardar Ficha'}
            </>
          )}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">
        <form id="historia-form" onSubmit={handleSave} className="max-w-4xl mx-auto space-y-6">
          
          {/* Formulario de Sesión */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <CalendarIcon size={12} /> Fecha de Sesión
                </label>
                <input
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                />
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Stethoscope size={12} /> Tratamiento Realizado
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Limpieza, Extracción, etc."
                  value={tratamiento}
                  onChange={(e) => setTratamiento(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-full">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <FileText size={12} /> Descripción y Observaciones
                </label>
                <textarea
                  rows={5}
                  placeholder="Detalles de la sesión, hallazgos, indicaciones..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Odontograma */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <Activity size={16} className="text-blue-600" />
                Odontograma Visual
              </h2>
              <span className="text-[10px] text-gray-400 font-medium">Hacé click en cada diente para cambiar su estado</span>
            </div>
            <Odontograma 
              valor={odontograma} 
              onChange={handleOdontogramaChange} 
            />
          </section>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 flex items-start gap-3">
            <Activity size={18} className="shrink-0 mt-0.5" />
            <p>
              <strong>Tip:</strong> El odontograma se inicializa automáticamente con el último estado registrado del paciente. 
              Cualquier cambio que realices aquí se guardará como la nueva versión de su historial dental.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
