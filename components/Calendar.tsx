'use client';

import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  markedDates?: string[]; // Array de strings 'YYYY-MM-DD'
}

export default function Calendar({ selectedDate, onSelect, markedDates = [] }: CalendarProps) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const wheelTimeout = useRef<NodeJS.Timeout | null>(null);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setDirection('left');
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDirection('right');
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    // Solo si el swipe es mayoritariamente horizontal y supera el umbral
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) {
        handleNextMonth();
      } else {
        handlePrevMonth();
      }
    }
    
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const onWheel = (e: React.WheelEvent) => {
    if (wheelTimeout.current) return;

    // Detectamos scroll vertical significativo
    if (Math.abs(e.deltaY) > 20) {
      if (e.deltaY > 0) {
        handleNextMonth();
      } else {
        handlePrevMonth();
      }
      
      // Debounce para evitar cambios de mes ultrarrápidos
      wheelTimeout.current = setTimeout(() => {
        wheelTimeout.current = null;
      }, 400);
    }
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days = [];
  
  // Padding for first day of month (Monday as first day of week)
  const firstDay = (firstDayOfMonth(year, month) + 6) % 7;
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  const numDays = daysInMonth(year, month);
  for (let i = 1; i <= numDays; i++) {
    days.push(new Date(year, month, i));
  }

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date: Date) => {
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  const hasAppointment = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return markedDates.includes(dateStr);
  };

  const dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <div 
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="bg-white rounded-xl shadow-xl border border-gray-100 p-4 w-72 select-none overflow-hidden"
    >
      <div 
        key={viewDate.toISOString()}
        className={`
          animate-in fade-in duration-200
          ${direction === 'right' ? 'slide-in-from-right-4' : direction === 'left' ? 'slide-in-from-left-4' : ''}
        `}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 capitalize">
            {viewDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-1">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft size={18} className="text-gray-500" />
            </button>
            <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-[10px] font-bold text-gray-400 text-center uppercase">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            if (!date) return <div key={`empty-${index}`} />;
            
            const selected = isSelected(date);
            const today = isToday(date);
            const marked = hasAppointment(date);

            return (
              <button
                key={date.toISOString()}
                onClick={() => onSelect(date)}
                className={`
                  relative h-9 flex flex-col items-center justify-center rounded-lg text-sm transition-all
                  ${selected ? 'bg-blue-600 text-white font-bold' : 'hover:bg-blue-50 text-gray-700'}
                  ${today && !selected ? 'text-blue-600 font-bold border border-blue-200' : ''}
                `}
              >
                {date.getDate()}
                {marked && (
                  <div className={`
                    absolute bottom-1 w-1 h-1 rounded-full
                    ${selected ? 'bg-white' : 'bg-blue-500'}
                  `} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
