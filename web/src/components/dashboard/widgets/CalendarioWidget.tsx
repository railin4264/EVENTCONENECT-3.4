'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarioWidgetProps {
  widget: any;
  onRemove: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onSettingsChange: (settings: any) => void;
}

const CalendarioWidget: React.FC<CalendarioWidgetProps> = ({
  widget,
  onRemove,
  onMinimize,
  onMaximize,
  onSettingsChange
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

  const renderCalendarDays = () => {
    const days = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === new Date().getDate() && 
                     currentDate.getMonth() === new Date().getMonth() &&
                     currentDate.getFullYear() === new Date().getFullYear();
      
      days.push(
        <div
          key={day}
          className={`h-8 flex items-center justify-center text-sm rounded-full cursor-pointer hover:bg-blue-100 transition-colors ${
            isToday ? 'bg-blue-600 text-white' : 'text-gray-700'
          }`}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4">
        {/* Header del calendario */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Calendario</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousMonth}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Mes y año actual */}
        <div className="text-center mb-4">
          <h4 className="text-lg font-medium text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h4>
        </div>
        
        {/* Nombres de los días */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        {/* Días del calendario */}
        <div className="grid grid-cols-7 gap-1">
          {renderCalendarDays()}
        </div>
        
        {/* Eventos del día seleccionado */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-medium text-gray-900 mb-2">Eventos de hoy</h5>
          <div className="space-y-2">
            <div className="flex items-center text-xs text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span>Festival de Música - 20:00</span>
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>Clase de Yoga - 07:00</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 p-3">
        <button className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium">
          Ver calendario completo
        </button>
      </div>
    </div>
  );
};

export default CalendarioWidget;