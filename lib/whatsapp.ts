type TurnoData = {
  paciente_nombre: string
  paciente_telefono: string
  fecha_hora: string
  motivo: string
  nueva_fecha_hora?: string
}

function formatearTelefono(telefono: string, codigoPais = '54'): string {
  const soloDigitos = telefono.replace(/\D/g, '')
  if (soloDigitos.startsWith(codigoPais)) return soloDigitos
  return `${codigoPais}${soloDigitos}`
}

export function generarLinkWhatsApp(telefono: string, mensaje: string): string {
  const tel = formatearTelefono(telefono)
  return `https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}`
}

export const plantillas = {
  recordatorio: (turno: TurnoData): string =>
    `Hola ${turno.paciente_nombre} 👋\n\n` +
    `Te recordamos que tenés un turno hoy:\n` +
    `📅 ${turno.fecha_hora}\n` +
    `📋 ${turno.motivo}\n\n` +
    `¿Podés confirmar tu asistencia? Respondé este mensaje.`,

  reprogramacion: (turno: TurnoData): string =>
    `Hola ${turno.paciente_nombre} 👋\n\n` +
    `Te informamos que tu turno de hoy (${turno.fecha_hora}) fue reprogramado para:\n` +
    `📅 ${turno.nueva_fecha_hora}\n\n` +
    `¡Te esperamos!`,

  cancelacion: (turno: TurnoData): string =>
    `Hola ${turno.paciente_nombre} 👋\n\n` +
    `Te informamos que tu turno de hoy (${turno.fecha_hora}) fue cancelado.\n\n` +
    `Por favor, comunicate para coordinar un nuevo horario.`,
}

export function generarLinkEmail(email: string, asunto: string, cuerpo: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`
}
