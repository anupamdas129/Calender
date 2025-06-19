"use client";
import React, { useState, useRef, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import { createPopper } from '@popperjs/core';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
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
    start.setDate(start.getDate() - start.getDay());
    const weekStart = new Date(start);
    const weekEnd = new Date(start);
    weekEnd.setDate(weekStart.getDate() + 6);

    return allEvents.filter(({ event }) => {
      const [day, month, year] = event.date.split("/").map(Number);
      const d = new Date(year, month - 1, day);
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
      <div className="flex items-center justify-between px-4 py-3 border-b relative">
        <div className="flex items-center space-x-3">
          <button onClick={() => changeWeek(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-lg font-medium">{formatFullDate()}</span>

          <button
            ref={buttonRef}
            onClick={toggleCalendar}
            className="flex items-center text-gray-600"
          >
            <ChevronDown className="w-4 h-4 ml-1" />
          </button>

          {calendarOpen && (
            <div
              ref={calendarRef}
              className="z-50 bg-white shadow-lg rounded mt-2 absolute"
              style={{ top: '100%', left: '10%' }}
            >
              <DatePicker
                selected={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  setCalendarOpen(false);
                }}
                inline
                calendarClassName="bg-white shadow-md border rounded-md"
              />
            </div>
          )}

          <button onClick={() => changeWeek(1)}>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => setSelectedDate(new Date())}
          className="text-blue-600 hover:underline"
        >
          Today
        </button>
      </div>
      <WeekCalendar selectedDate={selectedDate} events={weeklyEvents} startHour={startHour} />
    </div>
  );
};

export default YearCalendar;
