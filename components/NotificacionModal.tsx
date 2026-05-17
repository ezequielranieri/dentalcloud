'use client'

import { X, Mail, MessageSquare } from 'lucide-react'
import { generarLinkWhatsApp, generarLinkEmail } from '@/lib/whatsapp'

type Props = {
  isOpen: boolean
  onClose: () => void
  paciente: {
    nombre: string
    telefono: string
    email?: string
  }
  mensaje: string
  titulo: string
}

export default function NotificacionModal({ isOpen, onClose, paciente, mensaje, titulo }: Props) {
  if (!isOpen) return null

  const waLink = generarLinkWhatsApp(paciente.telefono, mensaje)
  const mailLink = generarLinkEmail(paciente.email || '', titulo, mensaje)

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-gray-900">{titulo}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Se ha actualizado el turno. ¿Deseas notificar al paciente ahora?
          </p>

          <div className="space-y-3">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors shadow-md shadow-green-100"
            >
              <MessageSquare size={20} />
              Avisar por WhatsApp
            </a>

            <a
              href={mailLink}
              onClick={onClose}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-md shadow-blue-100"
            >
              <Mail size={20} />
              Avisar por Email
            </a>
            
            <button
              onClick={onClose}
              className="w-full text-center text-sm font-medium text-gray-500 py-2 hover:text-gray-700 transition-colors"
            >
              Cerrar sin avisar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
