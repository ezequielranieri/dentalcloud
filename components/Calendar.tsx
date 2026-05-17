'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  markedDates?: string[]; // Array de strings 'YYYY-MM-DD'
}

export default function Calendar({ selectedDate, onSelect, markedDates = [] }: CalendarProps) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
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
    <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4 w-72 select-none animate-in fade-in zoom-in duration-150">
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
  );
}
