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

const ESTADOS: { label: string; value: EstadoDiente; color: string; stroke: string }[] = [
  { label: 'Sano', value: 'sano', color: '#FFFFFF', stroke: '#D1D5DB' },
  { label: 'Caries', value: 'caries', color: '#EF4444', stroke: '#B91C1C' },
  { label: 'Corona', value: 'corona', color: '#3B82F6', stroke: '#1D4ED8' },
  { label: 'Extracción', value: 'extracción', color: '#1F2937', stroke: '#111827' },
  { label: 'Tratamiento', value: 'tratamiento', color: '#22C55E', stroke: '#15803D' },
];

const ToothIcon = ({ estado, isUpper }: { estado: EstadoDiente; isUpper: boolean }) => {
  const config = ESTADOS.find(e => e.value === estado) || ESTADOS[0];
  
  return (
    <svg 
      viewBox="0 0 40 50" 
      className="w-full h-full drop-shadow-sm transition-transform duration-200"
      style={{ transform: isUpper ? 'rotate(0deg)' : 'rotate(180deg)' }}
    >
      {/* Root area (simplified) */}
      <path
        d="M10,10 Q20,0 30,10 L30,25 Q20,20 10,25 Z"
        fill="#F3F4F6"
        stroke="#E5E7EB"
        strokeWidth="1"
      />
      {/* Crown area */}
      <path
        d="M5,25 Q5,20 10,20 L30,20 Q35,20 35,25 L35,40 Q35,48 20,48 Q5,48 5,40 Z"
        fill={config.color}
        stroke={config.stroke}
        strokeWidth="2"
      />
      {/* Detail for extraction */}
      {estado === 'extracción' && (
        <g stroke="white" strokeWidth="3" strokeLinecap="round">
          <line x1="10" y1="25" x2="30" y2="45" />
          <line x1="30" y1="25" x2="10" y2="45" />
        </g>
      )}
      {/* Detail for crown */}
      {estado === 'corona' && (
        <path
          d="M5,25 Q5,20 10,20 L30,20 Q35,20 35,25 L35,32 L5,32 Z"
          fill="#1D4ED8"
        />
      )}
    </svg>
  );
};

export default function Odontograma({ valor, onChange, readOnly = false }: OdontogramaProps) {
  const renderDiente = (num: number, isUpper: boolean) => {
    const estadoActual = valor[num] || 'sano';

    return (
      <div key={num} className="flex flex-col items-center gap-1 group">
        <span className={`text-[10px] font-bold transition-colors ${valor[num] ? 'text-blue-600' : 'text-gray-400'}`}>
          {num}
        </span>
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
            w-8 h-12 transition-all duration-150
            ${!readOnly && 'hover:scale-110 active:scale-95 cursor-pointer'}
          `}
        >
          <ToothIcon estado={estadoActual} isUpper={isUpper} />
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm overflow-x-auto">
      <div className="min-w-[700px] flex flex-col items-center gap-12 py-4">
        {/* Fila Superior */}
        <div className="flex justify-center gap-1.5">
          {DIENTES_SUPERIORES.map(n => renderDiente(n, true))}
        </div>

        {/* Arco Bucal (Decorativo) */}
        <div className="relative w-full h-px bg-gray-100">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            Línea de Oclusión
          </div>
        </div>

        {/* Fila Inferior */}
        <div className="flex justify-center gap-1.5">
          {DIENTES_INFERIORES.map(n => renderDiente(n, false))}
        </div>

        {/* Leyenda */}
        <div className="grid grid-cols-5 gap-4 mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
          {ESTADOS.map(e => (
            <button
              key={e.value}
              type="button"
              className="flex items-center gap-2 group transition-opacity hover:opacity-80"
            >
              <div className="w-5 h-6">
                <ToothIcon estado={e.value} isUpper={true} />
              </div>
              <span className="text-xs text-gray-600 font-semibold">{e.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
