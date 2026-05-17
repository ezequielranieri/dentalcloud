'use client';

import React from 'react';

const DIENTES_SUPERIORES = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28
];

const DIENTES_INFERIORES = [
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38
];

export type EstadoDiente = 'sano' | 'caries' | 'corona' | 'extracción' | 'tratamiento';

interface OdontogramaProps {
  valor: Record<number, EstadoDiente>;
  onChange: (diente: number, estado: EstadoDiente) => void;
  readOnly?: boolean;
}

const ESTADOS: { label: string; value: EstadoDiente; color: string; border: string }[] = [
  { label: 'Sano', value: 'sano', color: 'bg-white', border: 'border-gray-200' },
  { label: 'Caries', value: 'caries', color: 'bg-red-500', border: 'border-red-600' },
  { label: 'Corona', value: 'corona', color: 'bg-blue-500', border: 'border-blue-600' },
  { label: 'Extracción', value: 'extracción', color: 'bg-gray-800', border: 'border-gray-900' },
  { label: 'Tratamiento', value: 'tratamiento', color: 'bg-green-500', border: 'border-green-600' },
];

export default function Odontograma({ valor, onChange, readOnly = false }: OdontogramaProps) {
  const renderDiente = (num: number) => {
    const estadoActual = valor[num] || 'sano';
    const config = ESTADOS.find(e => e.value === estadoActual) || ESTADOS[0];

    return (
      <div key={num} className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-bold text-gray-400">{num}</span>
        <button
          type="button"
          disabled={readOnly}
          onClick={() => {
            if (readOnly) return;
            const currentIndex = ESTADOS.findIndex(e => e.value === estadoActual);
            const nextIndex = (currentIndex + 1) % ESTADOS.length;
            onChange(num, ESTADOS[nextIndex].value);
          }}
          className={`
            w-8 h-10 rounded-t-lg rounded-b-md border-2 transition-all duration-150
            ${config.color} ${config.border}
            ${!readOnly && 'hover:scale-110 active:scale-95 cursor-pointer shadow-sm'}
            ${estadoActual === 'extracción' ? 'relative overflow-hidden' : ''}
          `}
        >
          {estadoActual === 'extracción' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-[2px] bg-white rotate-45 absolute" />
              <div className="w-full h-[2px] bg-white -rotate-45 absolute" />
            </div>
          )}
          {estadoActual === 'corona' && (
            <div className="w-full h-1/3 bg-blue-700/50 mt-auto rounded-t-sm" />
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 overflow-x-auto">
      <div className="min-w-[600px] space-y-8">
        {/* Fila Superior */}
        <div className="flex justify-center gap-2 md:gap-3">
          {DIENTES_SUPERIORES.map(renderDiente)}
        </div>

        {/* Separador */}
        <div className="h-px bg-gray-100 w-full" />

        {/* Fila Inferior */}
        <div className="flex justify-center gap-2 md:gap-3">
          {DIENTES_INFERIORES.map(renderDiente)}
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap justify-center gap-4 pt-4 border-t border-gray-100">
          {ESTADOS.map(e => (
            <div key={e.value} className="flex items-center gap-2">
              <div className={`w-3 h-4 rounded-sm border ${e.color} ${e.border}`} />
              <span className="text-xs text-gray-600 font-medium">{e.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
