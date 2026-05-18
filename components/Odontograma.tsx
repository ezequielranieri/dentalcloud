'use client';

import React from 'react';

const DIENTES_SUPERIORES = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28
];

const DIENTES_INFERIORES = [
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38
];

export type EstadoSuperficie = 'sano' | 'caries' | 'tratamiento' | 'extracción' | 'ausente';
export type SuperficiesDiente = {
  oclusal: EstadoSuperficie;
  vestibular: EstadoSuperficie;
  lingual: EstadoSuperficie;
  mesial: EstadoSuperficie;
  distal: EstadoSuperficie;
};

interface OdontogramaProps {
  valor: Record<number, Partial<SuperficiesDiente>>;
  onChange: (diente: number, superficies: Partial<SuperficiesDiente>) => void;
  readOnly?: boolean;
}

const ESTADOS: { label: string; value: EstadoSuperficie; color: string; stroke: string }[] = [
  { label: 'Sano', value: 'sano', color: '#FFFFFF', stroke: '#D1D5DB' },
  { label: 'Caries', value: 'caries', color: '#3B82F6', stroke: '#1D4ED8' }, // Azul
  { label: 'Tratamiento', value: 'tratamiento', color: '#EF4444', stroke: '#B91C1C' }, // Rojo
  { label: 'Extracción', value: 'extracción', color: '#3B82F6', stroke: '#1D4ED8' }, // Azul (Cruz)
  { label: 'Ausente', value: 'ausente', color: '#EF4444', stroke: '#B91C1C' }, // Rojo (Cruz)
];

const ToothSVG = ({ 
  superficies, 
  onSurfaceClick, 
  readOnly 
}: { 
  superficies: Partial<SuperficiesDiente>; 
  onSurfaceClick: (s: keyof SuperficiesDiente) => void;
  readOnly: boolean;
}) => {
  const getColor = (estado?: EstadoSuperficie) => {
    if (estado === 'extracción' || estado === 'ausente') return '#FFFFFF';
    return ESTADOS.find(e => e.value === (estado || 'sano'))?.color || '#FFFFFF';
  };
  
  const getStroke = (estado?: EstadoSuperficie) => 
    ESTADOS.find(e => e.value === (estado || 'sano'))?.stroke || '#D1D5DB';

  const isFullTooth = superficies.oclusal === 'extracción' || superficies.oclusal === 'ausente';
  const fullToothColor = superficies.oclusal === 'extracción' ? '#3B82F6' : '#EF4444';

  const renderSurface = (name: keyof SuperficiesDiente, d: string) => {
    const estado = superficies[name] || 'sano';
    return (
      <path
        d={d}
        fill={getColor(estado)}
        stroke={getStroke(estado)}
        strokeWidth="1.5"
        className={`${!readOnly && 'cursor-pointer hover:brightness-90 active:brightness-75 transition-all'}`}
        onClick={() => !readOnly && onSurfaceClick(name)}
      />
    );
  };

  return (
    <svg viewBox="0 0 40 40" className="w-10 h-10 md:w-12 md:h-12 drop-shadow-sm overflow-visible">
      {/* Vestibular (Top) */}
      {renderSurface('vestibular', 'M 0 0 L 40 0 L 28 12 L 12 12 Z')}
      {/* Distal (Right) */}
      {renderSurface('distal', 'M 40 0 L 40 40 L 28 28 L 28 12 Z')}
      {/* Lingual/Palatino (Bottom) */}
      {renderSurface('lingual', 'M 12 28 L 28 28 L 40 40 L 0 40 Z')}
      {/* Mesial (Left) */}
      {renderSurface('mesial', 'M 0 0 L 12 12 L 12 28 L 0 40 Z')}
      {/* Oclusal (Center) */}
      {renderSurface('oclusal', 'M 12 12 L 28 12 L 28 28 L 12 28 Z')}

      {/* Cruz para Extracción o Ausente */}
      {isFullTooth && (
        <g stroke={fullToothColor} strokeWidth="3" strokeLinecap="round" className="pointer-events-none">
          <line x1="0" y1="0" x2="40" y2="40" />
          <line x1="40" y1="0" x2="0" y2="40" />
        </g>
      )}
    </svg>
  );
};

export default function Odontograma({ valor, onChange, readOnly = false }: OdontogramaProps) {
  
  const handleSurfaceChange = (num: number, surface: keyof SuperficiesDiente) => {
    const dienteActual = valor[num] || {
      oclusal: 'sano',
      vestibular: 'sano',
      lingual: 'sano',
      mesial: 'sano',
      distal: 'sano'
    };
    
    const estadoActual = dienteActual[surface] || 'sano';
    const currentIndex = ESTADOS.findIndex(e => e.value === estadoActual);
    const nextIndex = (currentIndex + 1) % ESTADOS.length;
    const nuevoEstado = ESTADOS[nextIndex].value;

    // Si el nuevo estado es extracción o ausente, O si el estado actual era uno de ellos,
    // aplicamos el cambio a todas las superficies del diente para que el cambio sea global.
    if (nuevoEstado === 'extracción' || nuevoEstado === 'ausente' || estadoActual === 'extracción' || estadoActual === 'ausente') {
      onChange(num, {
        oclusal: nuevoEstado,
        vestibular: nuevoEstado,
        lingual: nuevoEstado,
        mesial: nuevoEstado,
        distal: nuevoEstado
      });
    } else {
      onChange(num, {
        ...dienteActual,
        [surface]: nuevoEstado
      });
    }
  };

  const renderDiente = (num: number) => {
    return (
      <div key={num} className="flex flex-col items-center gap-1.5 group">
        <span className={`text-[10px] font-bold transition-colors ${valor[num] ? 'text-blue-600' : 'text-gray-400'}`}>
          {num}
        </span>
        <div className="relative">
          <ToothSVG 
            superficies={valor[num] || {}} 
            readOnly={readOnly}
            onSurfaceClick={(s) => handleSurfaceChange(num, s)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm overflow-x-auto">
      <div className="min-w-[800px] flex flex-col items-center gap-10 py-4">
        {/* Fila Superior */}
        <div className="flex justify-center gap-2">
          {DIENTES_SUPERIORES.map(renderDiente)}
        </div>

        {/* Línea Divisoria */}
        <div className="relative w-full h-px bg-gray-100">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-6 text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em]">
            Arcada Superior / Inferior
          </div>
        </div>

        {/* Fila Inferior */}
        <div className="flex justify-center gap-2">
          {DIENTES_INFERIORES.map(renderDiente)}
        </div>

        {/* Leyenda */}
        <div className="grid grid-cols-5 gap-4 mt-6 p-5 bg-gray-50 rounded-2xl border border-gray-100">
          {ESTADOS.map(e => (
            <div key={e.value} className="flex items-center gap-2.5">
              <div 
                className="w-5 h-5 rounded-md border border-gray-200 shadow-xs flex items-center justify-center bg-white relative"
              >
                {(e.value === 'extracción' || e.value === 'ausente') ? (
                  <svg viewBox="0 0 40 40" className="w-full h-full">
                    <g stroke={e.value === 'extracción' ? '#3B82F6' : '#EF4444'} strokeWidth="4" strokeLinecap="round">
                      <line x1="8" y1="8" x2="32" y2="32" />
                      <line x1="32" y1="8" x2="8" y2="32" />
                    </g>
                  </svg>
                ) : (
                  <div 
                    className="absolute inset-1 rounded-sm" 
                    style={{ backgroundColor: e.color }}
                  />
                )}
              </div>
              <span className="text-xs text-gray-600 font-bold">{e.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
