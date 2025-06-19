"use client";

import React, { createContext, useContext, useState } from "react";
import mockEvents from "../mock/mockEvents";

export interface CalendarEvent {
  id: string;
  year: number;
  month: number;
  event: {
    eventName: string;
    date: string; // dd/mm/yyyy
    startTime: string;
    endTime: string;
  };
}

interface EventsContextType {
  events: CalendarEvent[];
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const EventsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>(
    mockEvents.map((e, i) => ({ ...e, id: `event-${i}` }))
  );

  const addEvent = (newEvent: CalendarEvent) => {
    setEvents((prev) => [...prev, newEvent]);
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <EventsContext.Provider value={{ events, addEvent, updateEvent, deleteEvent }}>
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = (): EventsContextType => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return context;
};
