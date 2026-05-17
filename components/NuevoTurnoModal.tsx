'use client'

import { useState, useEffect } from 'react'
import { supabase, type Paciente } from '@/lib/supabase'
import { X, Search, Calendar, Clock, AlignLeft, UserPlus, Phone, CreditCard, AlertTriangle } from 'lucide-react'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialDate?: Date
}

export default function NuevoTurnoModal({ isOpen, onClose, onSuccess, initialDate }: Props) {
  const [loading, setLoading] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null)
  const [showNuevoPacienteForm, setShowNuevoPacienteForm] = useState(false)
  
  const [formData, setFormData] = useState({
    fecha: initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    hora: '09:00',
    motivo: ''
  })

  const [nuevoPacienteData, setNuevoPacienteData] = useState({
    nombre: '',
    telefono: '',
    obra_social: '',
    alertas: ''
  })

  useEffect(() => {
    if (busqueda.length > 1) {
      buscarPacientes()
    } else {
      setPacientes([])
    }
  }, [busqueda])

  useEffect(() => {
    // Si el usuario empieza a escribir en búsqueda, reseteamos el formulario de nuevo paciente
    if (busqueda.length > 0) {
      setNuevoPacienteData(prev => ({ ...prev, nombre: busqueda }))
    }
  }, [busqueda])

  async function buscarPacientes() {
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .ilike('nombre', `%${busqueda}%`)
      .limit(5)

    if (data) setPacientes(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      let pacienteId = pacienteSeleccionado?.id

      // 1. Si es un paciente nuevo, primero lo creamos
      if (showNuevoPacienteForm) {
        const { data: newPaciente, error: pError } = await supabase
          .from('pacientes')
          .insert([{
            nombre: nuevoPacienteData.nombre,
            telefono: nuevoPacienteData.telefono,
            obra_social: nuevoPacienteData.obra_social || null,
            alertas: nuevoPacienteData.alertas || null,
            user_id: user?.id
          }])
          .select()
          .single()

        if (pError) throw pError
        pacienteId = newPaciente.id
      }

      if (!pacienteId) throw new Error('No se seleccionó paciente')

      // 2. Creamos el turno
      const fechaHora = new Date(`${formData.fecha}T${formData.hora}:00`).toISOString()
      const { error: tError } = await supabase
        .from('turnos')
        .insert([{
          paciente_id: pacienteId,
          fecha_hora: fechaHora,
          motivo: formData.motivo,
          estado: 'pendiente',
          user_id: user?.id
        }])

      if (tError) throw tError

      // 3. Éxito
      onSuccess()
      handleClose()
    } catch (err: any) {
      console.error('Error:', err)
      alert(err.message || 'Error al procesar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    onClose()
    setPacienteSeleccionado(null)
    setShowNuevoPacienteForm(false)
    setBusqueda('')
    setFormData({ ...formData, motivo: '' })
    setNuevoPacienteData({ nombre: '', telefono: '', obra_social: '', alertas: '' })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/40 p-0 md:p-4">
      <div className="bg-white w-full max-w-md rounded-t-2xl md:rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Nuevo Turno</h2>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
          {/* SECCIÓN PACIENTE */}
          <div className="space-y-3">
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">Paciente</label>
            
            {!showNuevoPacienteForm ? (
              <>
                {pacienteSeleccionado ? (
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-blue-700">{pacienteSeleccionado.nombre}</span>
                      <span className="text-xs text-blue-500">{pacienteSeleccionado.telefono}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setPacienteSeleccionado(null)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Search size={16} />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar por nombre..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                    />
                    
                    {busqueda.length > 1 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {pacientes.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setPacienteSeleccionado(p)
                              setPacientes([])
                              setBusqueda('')
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex flex-col border-b border-gray-50 last:border-0"
                          >
                            <span className="font-medium text-gray-900">{p.nombre}</span>
                            <span className="text-xs text-gray-500">{p.telefono}</span>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setShowNuevoPacienteForm(true)
                            setPacientes([])
                          }}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 text-blue-600 font-medium flex items-center gap-2"
                        >
                          <UserPlus size={16} />
                          Crear "{busqueda}" como nuevo paciente
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Formulario Nuevo Paciente Inline */
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-3 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">Nuevo Registro</span>
                  <button 
                    type="button" 
                    onClick={() => setShowNuevoPacienteForm(false)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Volver a buscar
                  </button>
                </div>
                
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={nuevoPacienteData.nombre}
                  onChange={(e) => setNuevoPacienteData({...nuevoPacienteData, nombre: e.target.value})}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />

                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-2 text-gray-400" size={14} />
                    <input
                      type="tel"
                      placeholder="Teléfono"
                      value={nuevoPacienteData.telefono}
                      onChange={(e) => setNuevoPacienteData({...nuevoPacienteData, telefono: e.target.value})}
                      className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      required
                    />
                  </div>
                  <div className="relative">
                    <CreditCard className="absolute left-2.5 top-2 text-gray-400" size={14} />
                    <input
                      type="text"
                      placeholder="Obra Social"
                      value={nuevoPacienteData.obra_social}
                      onChange={(e) => setNuevoPacienteData({...nuevoPacienteData, obra_social: e.target.value})}
                      className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                </div>

                <div className="relative">
                  <AlertTriangle className="absolute left-2.5 top-2 text-red-400" size={14} />
                  <textarea
                    placeholder="Alertas médicas (alergias, etc.)"
                    value={nuevoPacienteData.alertas}
                    onChange={(e) => setNuevoPacienteData({...nuevoPacienteData, alertas: e.target.value})}
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-14 resize-none text-gray-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECCIÓN TURNO */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">Fecha</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">Hora</label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData({...formData, hora: e.target.value})}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">Motivo / Tratamiento</label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <textarea
                value={formData.motivo}
                onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                placeholder="Ej: Limpieza, Control..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none text-gray-900"
                required
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3 shrink-0 pb-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || (!pacienteSeleccionado && !showNuevoPacienteForm)}
              className="flex-1 px-4 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all shadow-md shadow-blue-100"
            >
              {loading ? 'Guardando...' : 'Confirmar Turno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
