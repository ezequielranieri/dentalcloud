'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { supabase, type Turno, type Paciente } from '@/lib/supabase'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus, 
  AlertTriangle,
  MoreVertical,
  Edit2,
  CalendarDays,
  XCircle,
  Save,
  X as XIcon,
  Mail as MailIcon,
  MessageSquare
} from 'lucide-react'
import BotonWhatsApp from '@/components/BotonWhatsApp'
import { plantillas, generarLinkEmail } from '@/lib/whatsapp'
import NuevoTurnoModal from '@/components/NuevoTurnoModal'
import NotificacionModal from '@/components/NotificacionModal'
import ResumenPacienteModal from '@/components/ResumenPacienteModal'
import Calendar from '@/components/Calendar'

export default function AgendaPage() {
  const [turnos, setTurnos] = useState<(Turno & { pacientes: Paciente })[]>([])
  const [loading, setLoading] = useState(true)
  const [fecha, setFecha] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)
  const [diasConTurnos, setDiasConTurnos] = useState<string[]>([])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false)
      }
    }
    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isCalendarOpen])
  
  // Estados para el resumen del paciente
  const [pacienteResumen, setPacienteResumen] = useState<Paciente | null>(null)
  const [isResumenOpen, setIsResumenOpen] = useState(false)
  
  // Estados para el menú y acciones
  const [menuAbiertoId, setMenuAbiertoId] = useState<string | null>(null)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [reprogramandoId, setReprogramandoId] = useState<string | null>(null)

  // Funciones para abrir menús exclusivamente
  const abrirMenu = (id: string | null) => {
    setMenuAbiertoId(id)
    if (id) {
      setEditandoId(null)
      setReprogramandoId(null)
    }
  }

  const abrirEdicion = (id: string | null) => {
    setEditandoId(id)
    if (id) {
      setMenuAbiertoId(null)
      setReprogramandoId(null)
    }
  }

  const abrirReprogramacion = (id: string | null) => {
    setReprogramandoId(id)
    if (id) {
      setMenuAbiertoId(null)
      setEditandoId(null)
    }
  }
  const [notificacion, setNotificacion] = useState<{
    isOpen: boolean;
    paciente: { nombre: string; telefono: string; email?: string };
    mensaje: string;
    titulo: string;
  } | null>(null)

  const [editMotivo, setEditMotivo] = useState('')
  const [editFecha, setEditFecha] = useState('')
  const [editHora, setEditHora] = useState('')

  useEffect(() => {
    fetchTurnos()
    fetchDiasConTurnos()
  }, [fecha])

  async function fetchTurnos() {
    setLoading(true)
    const startOfDay = new Date(fecha)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(fecha)
    endOfDay.setHours(23, 59, 59, 999)

    const { data, error } = await supabase
      .from('turnos')
      .select('*, pacientes(*)')
      .gte('fecha_hora', startOfDay.toISOString())
      .lte('fecha_hora', endOfDay.toISOString())
      .order('fecha_hora', { ascending: true })

    if (error) console.error('Error:', error)
    if (data) setTurnos(data as unknown as (Turno & { pacientes: Paciente })[])
    setLoading(false)
  }

  async function fetchDiasConTurnos() {
    const startOfMonth = new Date(fecha.getFullYear(), fecha.getMonth(), 1)
    const endOfMonth = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0, 23, 59, 59)

    const { data } = await supabase
      .from('turnos')
      .select('fecha_hora')
      .gte('fecha_hora', startOfMonth.toISOString())
      .lte('fecha_hora', endOfMonth.toISOString())

    if (data) {
      const dates = data.map(t => new Date(t.fecha_hora).toLocaleDateString('en-CA')) // en-CA gives YYYY-MM-DD
      setDiasConTurnos(Array.from(new Set(dates)))
    }
  }

  async function updateTurno(id: string, updates: Partial<Turno>) {
    const { error } = await supabase.from('turnos').update(updates).eq('id', id)
    if (error) {
      console.error('Error al actualizar turno:', error)
      return false
    }
    await fetchTurnos()
    return true
  }

  async function handleCancelar(turno: Turno & { pacientes: Paciente }) {
    const ok = await updateTurno(turno.id, { estado: 'cancelado' })
    if (ok) {
      const hora = new Date(turno.fecha_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      setNotificacion({
        isOpen: true,
        paciente: turno.pacientes,
        mensaje: plantillas.cancelacion({
          paciente_nombre: turno.pacientes.nombre,
          paciente_telefono: turno.pacientes.telefono,
          fecha_hora: `${hora} hs`,
          motivo: turno.motivo
        }),
        titulo: 'Turno Cancelado'
      })
    }
    setMenuAbiertoId(null)
  }

  async function handleGuardarReprogramacion(turno: Turno & { pacientes: Paciente }) {
    const nuevaFechaHora = new Date(`${editFecha}T${editHora}:00`).toISOString()
    const ok = await updateTurno(turno.id, { fecha_hora: nuevaFechaHora })
    if (ok) {
      const horaOriginal = new Date(turno.fecha_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      const horaNueva = new Date(nuevaFechaHora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      const fechaNueva = new Date(nuevaFechaHora).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
      
      setNotificacion({
        isOpen: true,
        paciente: turno.pacientes,
        mensaje: plantillas.reprogramacion({
          paciente_nombre: turno.pacientes.nombre,
          paciente_telefono: turno.pacientes.telefono,
          fecha_hora: `${horaOriginal} hs`,
          motivo: turno.motivo,
          nueva_fecha_hora: `${fechaNueva} a las ${horaNueva} hs`
        }),
        titulo: 'Turno Reprogramado'
      })
    }
    setReprogramandoId(null)
  }

  async function handleGuardarEdicion(id: string) {
    const ok = await updateTurno(id, { motivo: editMotivo })
    if (ok) setEditandoId(null)
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

  const badgeClasses = {
    confirmado: 'bg-green-50 text-green-800 border-green-200',
    pendiente:  'bg-amber-50 text-amber-800 border-amber-200',
    cancelado:  'bg-red-50   text-red-800   border-red-200',
  }

  const accentClasses = {
    confirmado: 'border-l-green-400',
    pendiente:  'border-l-amber-400',
    cancelado:  'border-l-red-400 opacity-65',
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <Link href="/agenda" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <CalendarIcon className="text-blue-600" size={20} />
          <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Agenda</h1>
        </Link>
        <button 
          onClick={() => {
            setIsModalOpen(true)
            setIsCalendarOpen(false)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors shadow-sm active:scale-95"
        >
          <Plus size={20} />
        </button>
      </header>

      <NuevoTurnoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTurnos}
        initialDate={fecha}
      />

      <ResumenPacienteModal
        isOpen={isResumenOpen}
        onClose={() => setIsResumenOpen(false)}
        paciente={pacienteResumen}
      />

      {notificacion && (
        <NotificacionModal 
          isOpen={notificacion.isOpen}
          onClose={() => setNotificacion(null)}
          paciente={notificacion.paciente}
          mensaje={notificacion.mensaje}
          titulo={notificacion.titulo}
        />
      )}

      {/* Date Selector */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shrink-0 relative">
        <button 
          onClick={() => setFecha(new Date(fecha.setDate(fecha.getDate() - 1)))} 
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        
        <div className="relative" ref={calendarRef}>
          <button 
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all group
              ${isCalendarOpen ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-blue-50 text-gray-900'}
            `}
          >
            <CalendarIcon size={16} className={`${isCalendarOpen ? 'text-white' : 'text-blue-600'} group-hover:scale-110 transition-transform`} />
            <span className="text-sm font-semibold capitalize">
              {fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </button>
          
          {isCalendarOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50">
              <Calendar 
                selectedDate={fecha}
                onSelect={(newDate) => {
                  setFecha(newDate)
                  setIsCalendarOpen(false)
                }}
                markedDates={diasConTurnos}
              />
            </div>
          )}
        </div>

        <button 
          onClick={() => setFecha(new Date(fecha.setDate(fecha.getDate() + 1)))} 
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Turnos List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-40">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : turnos.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500 text-sm">No hay turnos para este día</p>
          </div>
        ) : (
          turnos.map((turno) => {
            const { bg, text: avatarText } = getAvatarColor(turno.pacientes.nombre)
            const hora = new Date(turno.fecha_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
            const isMenuOpen = menuAbiertoId === turno.id
            const isEditing = editandoId === turno.id
            const isRescheduling = reprogramandoId === turno.id
            
            return (
              <div 
                key={turno.id}
                onClick={() => {
                  if (!isEditing && !isRescheduling) {
                    setPacienteResumen(turno.pacientes)
                    setIsResumenOpen(true)
                  }
                }}
                className={`
                  bg-white rounded-r-xl border border-gray-200 p-3
                  flex flex-col gap-3 shadow-sm relative transition-all active:scale-[0.99] cursor-pointer hover:border-blue-200
                  border-l-[4px] ${accentClasses[turno.estado]}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${bg} ${avatarText} rounded-full flex items-center justify-center font-semibold text-sm`}>
                      {turno.pacientes.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{turno.pacientes.nombre}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                        <Clock size={12} />
                        {hora} hs
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        abrirMenu(isMenuOpen ? null : turno.id)
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {isMenuOpen && (
                      <div 
                        className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-40 py-1 animate-in fade-in zoom-in duration-150"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button 
                          onClick={() => {
                            abrirEdicion(turno.id)
                            setEditMotivo(turno.motivo)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Edit2 size={16} className="text-gray-400" />
                          Editar motivo
                        </button>
                        <button 
                          onClick={() => {
                            abrirReprogramacion(turno.id)
                            setEditFecha(new Date(turno.fecha_hora).toISOString().split('T')[0])
                            setEditHora(new Date(turno.fecha_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }))
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <CalendarDays size={16} className="text-gray-400" />
                          Reprogramar
                        </button>
                        
                        {turno.pacientes.email && (
                          <a 
                            href={generarLinkEmail(
                              turno.pacientes.email, 
                              `Recordatorio de Turno - ${turno.pacientes.nombre}`,
                              plantillas.recordatorio({
                                paciente_nombre: turno.pacientes.nombre,
                                paciente_telefono: turno.pacientes.telefono,
                                fecha_hora: `${hora} hs`,
                                motivo: turno.motivo
                              })
                            )}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                          >
                            <MailIcon size={16} className="text-blue-400" />
                            Avisar por Email
                          </a>
                        )}

                        <div className="border-t border-gray-100 my-1" />
                        <button 
                          onClick={() => handleCancelar(turno)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <XCircle size={16} className="text-red-400" />
                          Cancelar turno
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pl-13">
                  {isEditing ? (
                    <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                      <textarea
                        value={editMotivo}
                        onChange={(e) => setEditMotivo(e.target.value)}
                        className="w-full p-2 text-sm border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleGuardarEdicion(turno.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
                        >
                          <Save size={14} /> Guardar
                        </button>
                        <button 
                          onClick={() => setEditandoId(null)}
                          className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : isRescheduling ? (
                    <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
                      <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Nueva fecha y hora</p>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={editFecha}
                          onChange={(e) => setEditFecha(e.target.value)}
                          className="p-2 text-xs border border-blue-200 rounded-lg outline-none text-gray-900"
                        />
                        <input
                          type="time"
                          value={editHora}
                          onChange={(e) => setEditHora(e.target.value)}
                          className="p-2 text-xs border border-blue-200 rounded-lg outline-none text-gray-900"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleGuardarReprogramacion(turno)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
                        >
                          <Save size={14} /> Confirmar
                        </button>
                        <button 
                          onClick={() => setReprogramandoId(null)}
                          className="px-3 py-1.5 bg-white text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-100 border border-gray-200"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600">{turno.motivo}</p>
                      
                      {turno.pacientes.alertas && (
                        <div className="mt-2 flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-2 py-1.5">
                          <AlertTriangle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                          <p className="text-[11px] text-red-700 font-medium leading-tight">{turno.pacientes.alertas}</p>
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-2">
                        <div onClick={(e) => e.stopPropagation()}>
                          <BotonWhatsApp 
                            telefono={turno.pacientes.telefono}
                            mensaje={plantillas.recordatorio({
                              paciente_nombre: turno.pacientes.nombre,
                              paciente_telefono: turno.pacientes.telefono,
                              fecha_hora: `${hora} hs`,
                              motivo: turno.motivo
                            })}
                            label="Recordar"
                          />
                        </div>
                        <span className={`
                          ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border
                          ${badgeClasses[turno.estado]}
                        `}>
                          {turno.estado}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}
        
        {/* Espaciador para evitar que el BottomNav tape el contenido */}
        <div className="h-28 md:hidden shrink-0" />
      </div>
    </div>
  )
}
