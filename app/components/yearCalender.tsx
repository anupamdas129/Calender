"use client";
import React, { useState, useRef, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import { createPopper } from '@popperjs/core';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';
import WeekCalendar from '../components/weekCalendar';
import { useEvents } from '../context/EventsContext';

const YearCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const { events: allEvents } = useEvents();

  const weeklyEvents = useMemo(() => {
    if (!selectedDate) return [];
  
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay());
  
    const weekStart = new Date(start);
    const weekEnd = new Date(start);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
  
    return allEvents.filter(({ event }) => {
      const [day, month, year] = event.date.split("/").map(Number);
      const d = new Date(year, month - 1, day);
      d.setHours(0, 0, 0, 0);
      return d >= weekStart && d <= weekEnd;
    });
  }, [selectedDate, allEvents]);

  const startHour = useMemo(() => {
    if (weeklyEvents.length === 0) return 0;

    let minMinutes = Infinity;
    weeklyEvents.forEach(({ event }) => {
      const [hour, minPart] = event.startTime.split(":");
      const [minute, ampm] = minPart.split(" ");
      let h = parseInt(hour, 10);
      let m = parseInt(minute, 10);
      if (ampm === "PM" && h !== 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      const total = h * 60 + m;
      if (total < minMinutes) minMinutes = total;
    });

    return Math.floor(minMinutes / 60);
  }, [weeklyEvents]);

  const toggleCalendar = () => {
    setCalendarOpen(!calendarOpen);
    if (buttonRef.current && calendarRef.current) {
      createPopper(buttonRef.current, calendarRef.current, {
        placement: 'bottom-start',
      });
    }
  };

  const changeWeek = (direction: number) => {
    if (!selectedDate) return;
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setSelectedDate(newDate);
  };

  if (!selectedDate) return null;

  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const formatDate = (date: Date): string =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const formatFullDate = (): string =>
    `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}, ${selectedDate.getFullYear()}`;

  return (
    <div>
      <div className="border-b px-4 py-3 flex items-center justify-between relative bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => changeWeek(-1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            ref={buttonRef}
            onClick={toggleCalendar}
            className="flex items-center text-lg font-medium text-gray-700 hover:bg-gray-100 rounded p-2 focus:outline-none"
          >
            {formatFullDate()}
            {calendarOpen ? (
              <ChevronUp className="w-4 h-4 ml-1" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-1" />
            )}
          </button>

          {calendarOpen && (
            <div
              ref={calendarRef}
              className="absolute z-50 mt-2 bg-white border shadow-md rounded-md"
              style={{ top: '100%', left: '10%' }}
            >
              <DatePicker
                selected={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  setCalendarOpen(false);
                }}
                inline
                calendarClassName="bg-white"
              />
            </div>
          )}

          <button
            onClick={() => changeWeek(1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => setSelectedDate(new Date())}
          className="text-gray-700 text-lg hover:bg-gray-100 rounded p-2"
        >
          Today
        </button>
      </div>
      <WeekCalendar selectedDate={selectedDate} events={weeklyEvents} startHour={startHour} dateFormat="DD MMM YYYY"/>
    </div>
  );
};

export default YearCalendar;
