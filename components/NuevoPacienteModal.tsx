'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { X, User, Phone, CreditCard, AlertTriangle, Loader2, Mail } from 'lucide-react'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function NuevoPacienteModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    obra_social: '',
    alertas: ''
  })

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('pacientes')
        .insert([{
          nombre: formData.nombre,
          telefono: formData.telefono,
          email: formData.email || null,
          obra_social: formData.obra_social || null,
          alertas: formData.alertas || null,
          user_id: user?.id
        }])

      if (error) throw error

      onSuccess()
      handleClose()
    } catch (err: any) {
      console.error('Error:', err)
      alert(err.message || 'Error al crear el paciente')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setFormData({ nombre: '', telefono: '', email: '', obra_social: '', alertas: '' })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/40 p-0 md:p-4">
      <div className="bg-white w-full max-w-md rounded-t-2xl md:rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Nuevo Paciente</h2>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5 ml-1">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5 ml-1">
                Teléfono
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="tel"
                  required
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="Sin espacios ni guiones"
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5 ml-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ejemplo@correo.com"
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5 ml-1">
                Obra Social
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="text"
                  value={formData.obra_social}
                  onChange={(e) => setFormData({ ...formData, obra_social: e.target.value })}
                  placeholder="Ej: OSDE, Galeno..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5 ml-1">
                Alertas Médicas
              </label>
              <div className="relative">
                <AlertTriangle className="absolute left-3 top-3 text-red-400" size={18} />
                <textarea
                  value={formData.alertas}
                  onChange={(e) => setFormData({ ...formData, alertas: e.target.value })}
                  placeholder="Alergias, condiciones importantes..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex gap-3 pb-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-blue-100 active:scale-95 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Guardando...
                </>
              ) : (
                'Crear Paciente'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
