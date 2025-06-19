"use client";
import React, { useMemo, useEffect, useRef, useState } from "react";
import { days } from "../helper";
import EventForm from "../components/eventEditor";
import { useEvents } from "../context/EventsContext";

const SLOT_MINUTES = 60;
const SLOT_WIDTH = 100;
const EVENT_HEIGHT = 60;
const EVENT_MARGIN = 2;

function toMinutes(t: string) {
  const [hour, minPart] = t.split(":");
  const [minute, ampm] = minPart.split(" ");
  let h = parseInt(hour, 10);
  let m = parseInt(minute, 10);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

function getDuration(start: string, end: string): number {
  return toMinutes(end) - toMinutes(start);
}

function getWeekDates(selectedDate: Date): Date[] {
  const start = new Date(selectedDate);
  start.setDate(selectedDate.getDate() - selectedDate.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function isOverlapping(a: Event, b: Event): boolean {
  return toMinutes(a.start) < toMinutes(b.end) && toMinutes(b.start) < toMinutes(a.end);
}

function groupOverlapping(events: Event[]): Event[][] {
  const groups: Event[][] = [];
  events.forEach((event) => {
    let placed = false;
    for (const group of groups) {
      if (!group.some((e) => isOverlapping(e, event))) {
        group.push(event);
        placed = true;
        break;
      }
    }
    if (!placed) groups.push([event]);
  });
  return groups;
}

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
}

interface CalendarEvent {
  id: string;
  year: number;
  month: number;
  event: {
    eventName: string;
    date: string;
    startTime: string;
    endTime: string;
  };
}

interface Props {
  selectedDate: Date;
  events: CalendarEvent[];
  startHour?: number;
}

const WeekCalendar: React.FC<Props> = ({ selectedDate, events, startHour = 0 }) => {
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<any | null>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = startHour * SLOT_WIDTH;
    }
  }, [startHour]);

  const times = useMemo(() => {
    return Array.from({ length: 24 }, (_, h) => {
      const hour = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? "AM" : "PM";
      return `${hour}:00 ${ampm}`;
    });
  }, []);

  const eventsByDay = useMemo(() => {
    const map: Record<string, Event[]> = {};
    events.forEach((e) => {
      const { event } = e;
      const [day, month, year] = event.date.split("/").map(Number);
      const d = new Date(year, month - 1, day);
      const dayName = days[d.getDay()];
      if (!map[dayName]) map[dayName] = [];
      map[dayName].push({
        id: e.id,
        title: event.eventName,
        start: event.startTime,
        end: event.endTime,
      });
    });
    return map;
  }, [events]);

  const rowHeights: Record<string, number> = {};
  days.forEach((day) => {
    const rowEvents = eventsByDay[day] ?? [];
    const grouped = groupOverlapping(rowEvents);
    rowHeights[day] = grouped.length * (EVENT_HEIGHT + EVENT_MARGIN) + 80;
  });

  const openForm = (date: Date, startTime?: string, data?: CalendarEvent) => {
    setFormData(
      data
        ? {
            id: data.id,
            eventName: data.event.eventName,
            startTime: data.event.startTime,
            endTime: data.event.endTime,
            date: data.event.date,
          }
        : {
            date: date.toLocaleDateString("en-GB"),
            startTime: startTime || "09:00 AM",
            endTime: startTime ? new Date(new Date(`1970-01-01T${(() => {let [t, m] = startTime.split(' '); let [h, min] = t.split(':').map(Number); h += (m === 'PM' && h !== 12) ? 12 : 0; h = (m === 'AM' && h === 12) ? 0 : h; return `${h.toString().padStart(2,'0')}:${min.toString().padStart(2,'0')}:00`; })()}`).getTime() + 3600000).toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit', hour12:true}) : "10:00 AM",
          }
    );
  };

  return (
    <div className="w-full font-sans text-sm text-gray-700">
      <div className="flex">
        <div className="w-32 flex flex-col border-r bg-gray-200">
          <div className="h-[33px] border-b border-r border-gray-300 p-2 font-semibold text-gray-600 bg-gray-200 sticky top-0 z-10 tracking-wide uppercase text-xs">
            Day
          </div>
          {days.map((day) => (
            <div
              key={day}
              className="flex flex-col justify-center items-center border-b border-gray-300 bg-gray-200 p-2 hover:bg-gray-100 transition-colors duration-200"
              style={{ height: `${rowHeights[day]}px` }}
            >
              <div className="text-gray-600 font-medium">{day}</div>
              <div className="text-xs text-gray-400">{weekDates[days.indexOf(day)].getDate()}</div>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100" ref={scrollContainerRef}>
          <div style={{ minWidth: `${24 * SLOT_WIDTH}px` }}>
            <div className="flex sticky top-0 z-10 bg-white border-b">
              {times.map((time) => (
                <div
                  key={time}
                  className="border-r text-center text-gray-500 py-2 px-1 text-xs bg-gray-200 font-medium border-gray-300"
                  style={{ width: SLOT_WIDTH }}
                >
                  {time}
                </div>
              ))}
            </div>

            {days.map((day, dayIdx) => {
              const rowEvents = eventsByDay[day] ?? [];
              const grouped = groupOverlapping(rowEvents);
              const rowHeight = rowHeights[day];
              const isEmpty = rowEvents.length === 0;
              const dateObj = weekDates[dayIdx];

              return (
                <div
                  key={day}
                  className={`relative flex border-b border-gray-200 ${isEmpty ? "bg-gray-50" : "bg-white"}`}
                  style={{ height: `${rowHeight}px` }}
                >
                  {times.map((time, i) => (
                    <div
                      key={`${day}-bg-${i}`}
                      className="border-r border-gray-200"
                      style={{ width: SLOT_WIDTH, height: "100%" }}
                      onClick={() => openForm(dateObj, time)}
                    />
                  ))}

                  {grouped.flatMap((group, groupIdx) =>
                    group.map((event, idxInGroup) => {
                      const offset = toMinutes(event.start);
                      const duration = getDuration(event.start, event.end);
                      const left = (offset / SLOT_MINUTES) * SLOT_WIDTH;
                      const width = (duration / SLOT_MINUTES) * SLOT_WIDTH;
                      const top = groupIdx * (EVENT_HEIGHT + EVENT_MARGIN);
                      const targetEvent = events.find(e => e.id === event.id);
                      return (
                        <div
                          key={`${day}-event-${groupIdx}-${idxInGroup}`}
                          className="absolute bg-[#2e26be] text-white text-xs rounded-md p-1 shadow-sm ring-1 ring-white/10"
                          style={{
                            left,
                            width,
                            top,
                            height: EVENT_HEIGHT - EVENT_MARGIN,
                            marginBottom: EVENT_MARGIN,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (targetEvent) openForm(dateObj, undefined, targetEvent);
                          }}
                        >
                          <div className="font-semibold truncate">{event.title}</div>
                          <div className="text-[10px]">
                            {event.start} - {event.end}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {formData && <EventForm initialData={formData} onClose={() => setFormData(null)} />}
    </div>
  );
};

export default WeekCalendar;
