'use client'

import { useEffect, useState } from 'react'
import { supabase, type Paciente, type Turno } from '@/lib/supabase'
import { 
  Users, 
  Search, 
  Plus, 
  ChevronLeft,
  ChevronRight, 
  Phone, 
  CreditCard, 
  AlertTriangle,
  Calendar,
  X,
  Clock
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import NuevoPacienteModal from '@/components/NuevoPacienteModal'
import EditarPacienteModal from '@/components/EditarPacienteModal'
import Link from 'next/link'

export default function PacientesPage() {
  const router = useRouter()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null)
  const [historialTurnos, setHistorialTurnos] = useState<Turno[]>([])
  const [loadingHistorial, setLoadingHistorial] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const fetchPacientes = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('pacientes').select('*').order('nombre')
    
    if (busqueda) {
      query = query.or(`nombre.ilike.%${busqueda}%,telefono.ilike.%${busqueda}%`)
    }

    const { data } = await query
    if (data) setPacientes(data)
    setLoading(false)
  }, [busqueda])

  useEffect(() => {
    fetchPacientes()
  }, [fetchPacientes])

  async function verDetalle(paciente: Paciente) {
    setPacienteSeleccionado(paciente)
    setLoadingHistorial(true)
    
    const { data, error } = await supabase
      .from('turnos')
      .select('*')
      .eq('paciente_id', paciente.id)
      .order('fecha_hora', { ascending: false })

    if (data) setHistorialTurnos(data)
    setLoadingHistorial(false)
  }

  function getAvatarColor(nombre: string) {
    const inicial = nombre[0].toUpperCase()
    const grupos = {
      'AHO': { bg: 'bg-blue-100',   text: 'text-blue-900' },
      'BIP': { bg: 'bg-green-100',  text: 'text-green-900' },
      'CJQ': { bg: 'bg-violet-100', text: 'text-violet-900' },
      'DKR': { bg: 'bg-amber-100',  text: 'text-amber-900' },
      'ELS': { bg: 'bg-rose-100',   text: 'text-rose-900' },
      'FMT': { bg: 'bg-teal-100',   text: 'text-teal-900' },
      'GNU': { bg: 'bg-indigo-100', text: 'text-indigo-900' },
    }
    for (const [letras, colors] of Object.entries(grupos)) {
      if (letras.includes(inicial)) return colors
    }
    return { bg: 'bg-gray-100', text: 'text-gray-900' }
  }

  return (
    <div className="flex h-full overflow-hidden relative">
      {/* Lista de Pacientes */}
      <div className={`flex-1 flex flex-col min-w-0 ${pacienteSeleccionado ? 'hidden md:flex' : 'flex'}`}>
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <Link href="/agenda" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Users className="text-blue-600" size={20} />
            <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Pacientes</h1>
          </Link>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors shadow-sm active:scale-95"
          >
            <Plus size={20} />
          </button>
        </header>

        <NuevoPacienteModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchPacientes}
        />

        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm text-gray-900"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-36 md:pb-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : pacientes.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500 text-sm">No se encontraron pacientes</p>
            </div>
          ) : (
            pacientes.map((p) => {
              const { bg, text } = getAvatarColor(p.nombre)
              return (
                <div 
                  key={p.id}
                  onClick={() => verDetalle(p)}
                  className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className={`w-11 h-11 ${bg} ${text} rounded-full flex items-center justify-center font-semibold text-base shrink-0`}>
                    {p.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{p.nombre}</h3>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Phone size={12}/> {p.telefono}</span>
                      {p.obra_social && <span className="flex items-center gap-1 truncate"><CreditCard size={12}/> {p.obra_social}</span>}
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              )
            })
          )}

          {/* Espaciador para evitar que el BottomNav tape el contenido */}
          <div className="h-28 md:hidden shrink-0" />
        </div>
      </div>

      {/* Ficha del Paciente (Detail View) */}
      {pacienteSeleccionado && (
        <div className="absolute inset-0 z-40 bg-white flex flex-col md:relative md:w-[450px] md:border-l md:border-gray-200 animate-in slide-in-from-right duration-200">
          <header className="p-4 border-b border-gray-200 flex items-center justify-between shrink-0">
            <button 
              onClick={() => setPacienteSeleccionado(null)} 
              className="flex items-center gap-1 text-blue-600 font-medium hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
              <span>Volver</span>
            </button>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="text-sm font-medium text-blue-600 hover:underline px-2 py-1"
            >
              Editar
            </button>
          </header>

          <EditarPacienteModal 
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            paciente={pacienteSeleccionado}
            onSuccess={(updated) => {
              setPacienteSeleccionado(updated)
              fetchPacientes()
            }}
          />

          <div className="flex-1 overflow-y-auto">
            {/* Encabezado Ficha */}
            <div className="p-6 flex flex-col items-center text-center border-b border-gray-100 bg-gray-50/50">
              <div className={`w-20 h-20 ${getAvatarColor(pacienteSeleccionado.nombre).bg} ${getAvatarColor(pacienteSeleccionado.nombre).text} rounded-full flex items-center justify-center font-bold text-2xl mb-4 shadow-sm`}>
                {pacienteSeleccionado.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <h3 className="text-xl font-bold text-gray-900">{pacienteSeleccionado.nombre}</h3>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5"><Phone size={14}/> {pacienteSeleccionado.telefono}</p>
            </div>

            <div className="p-5 space-y-6">
              {/* Alertas Médicas */}
              {pacienteSeleccionado.alertas && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="text-red-500 shrink-0" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-red-800 uppercase tracking-tight">Alerta Médica</h4>
                    <p className="text-sm text-red-700 mt-0.5 leading-relaxed">{pacienteSeleccionado.alertas}</p>
                  </div>
                </div>
              )}

              {/* Información General */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-100 rounded-lg p-3">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">Obra Social</span>
                  <span className="text-sm font-medium text-gray-700 mt-0.5 block">
                    {pacienteSeleccionado.obra_social || 'Particular'}
                  </span>
                </div>
                <div className="bg-white border border-gray-100 rounded-lg p-3">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">Desde</span>
                  <span className="text-sm font-medium text-gray-700 mt-0.5 block">
                    {new Date(pacienteSeleccionado.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Historial de Turnos */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400"/>
                  Historial de Turnos
                </h4>
                <div className="space-y-3">
                  {loadingHistorial ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    </div>
                  ) : historialTurnos.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-4">No hay turnos registrados</p>
                  ) : (
                    historialTurnos.map((t) => (
                      <div key={t.id} className="flex items-start gap-3 border-l-2 border-gray-200 pl-4 py-1 relative">
                        <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-gray-300"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-800">
                              {new Date(t.fecha_hora).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                            </span>
                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                              t.estado === 'confirmado' ? 'bg-green-50 text-green-700 border-green-100' :
                              t.estado === 'cancelado' ? 'bg-red-50 text-red-700 border-red-100' :
                              'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                              {t.estado}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{t.motivo}</p>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                            <Clock size={10}/>
                            {new Date(t.fecha_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200 shrink-0 bg-white pb-8 md:pb-4">
            <button 
              onClick={() => router.push(`/pacientes/${pacienteSeleccionado.id}/historia`)}
              className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 flex items-center justify-center gap-2"
            >
              Nueva Historia Clínica
            </button>
            {/* Espaciador para móviles para evitar el BottomNav */}
            <div className="h-16 md:hidden" />
          </div>
        </div>
      )}
    </div>
  )
}
