'use client'

import { generarLinkWhatsApp } from '@/lib/whatsapp'
import { MessageCircle } from 'lucide-react'

type Props = {
  telefono: string
  mensaje: string
  label?: string
  variant?: 'primary' | 'outline'
}

export default function BotonWhatsApp({ telefono, mensaje, label = 'Recordar', variant = 'outline' }: Props) {
  const link = generarLinkWhatsApp(telefono, mensaje)

  const baseStyles = "inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors duration-150"
  const variants = {
    primary: "bg-green-600 hover:bg-green-700 text-white",
    outline: "bg-white hover:bg-green-50 text-green-700 border border-gray-200 hover:border-green-300"
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseStyles} ${variants[variant]}`}
    >
      <MessageCircle size={16} />
      {label}
    </a>
  )
}
