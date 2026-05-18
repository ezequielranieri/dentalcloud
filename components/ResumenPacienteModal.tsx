'use client'

import { type Paciente } from '@/lib/supabase'
import { X, User, Phone, CreditCard, AlertTriangle, FileText, ChevronRight } from 'lucide-react'
import Link from 'next/link'

type Props = {
  isOpen: boolean
  onClose: () => void
  paciente: Paciente | null
}

export default function ResumenPacienteModal({ isOpen, onClose, paciente }: Props) {
  if (!isOpen || !paciente) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/40 p-0 md:p-4 animate-in fade-in duration-200">
      <div 
        className="fixed inset-0 z-[-1]" 
        onClick={onClose}
      />
      <div className="bg-white w-full max-w-md rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col">
        {/* Handle para móvil */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-1 md:hidden" />
        
        <div className="flex items-center justify-between p-5 border-b border-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <User size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Ficha del Paciente</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Vista Resumida</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Nombre y Datos Básicos */}
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Nombre Completo</p>
              <p className="text-base font-semibold text-gray-900">{paciente.nombre}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Teléfono</p>
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone size={14} className="text-blue-500" />
                  <span className="text-sm font-medium">{paciente.telefono}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Obra Social</p>
                <div className="flex items-center gap-2 text-gray-700">
                  <CreditCard size={14} className="text-blue-500" />
                  <span className="text-sm font-medium">{paciente.obra_social || 'No especificada'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Alertas Médicas */}
          {paciente.alertas ? (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Alertas Médicas</span>
              </div>
              <p className="text-sm text-red-800 font-medium leading-relaxed">
                {paciente.alertas}
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle size={16} />
              </div>
              <p className="text-xs text-green-800 font-medium">Sin alertas médicas registradas</p>
            </div>
          )}

          {/* Acciones */}
          <div className="pt-2">
            <Link
              href={`/pacientes/${paciente.id}/historia`}
              className="group w-full flex items-center justify-between p-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98]"
              onClick={onClose}
            >
              <div className="flex items-center gap-3">
                <FileText size={20} />
                <span>Ver Historia Clínica Completa</span>
              </div>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
