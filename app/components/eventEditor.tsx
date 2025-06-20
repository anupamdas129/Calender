"use client";
import React, { useEffect, useState } from "react";
import { useEvents } from "../context/EventsContext";
import moment from "moment";

interface EventFormData {
  id?: string;
  eventName: string;
  startTime: string;
  endTime: string;
  date: string;
}

interface EventFormProps {
  onClose: () => void;
  initialData?: Partial<EventFormData>;
}


const EventForm: React.FC<EventFormProps> = ({ onClose, initialData = {} }) => {
  const { events: allEvents, addEvent, updateEvent, deleteEvent } = useEvents();
  const isEdit = Boolean(initialData?.id);
  const [formData, setFormData] = useState<EventFormData>({
    id: initialData.id,
    eventName: initialData.eventName ?? "",
    startTime: initialData.startTime ?? "09:00 AM",
    endTime: initialData.endTime ?? "10:00 AM",
    date: initialData.date ?? new Date().toLocaleDateString("en-GB"),
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [endYear, setEndYear] = useState<number>(new Date().getFullYear() + 1);
  const [timeError, setTimeError] = useState<string | null>(null);

   useEffect(() => {
    const parts = formData.date.split("/");
    const startYear = parts.length === 3 ? parseInt(parts[2]) : new Date().getFullYear();
    setEndYear((prev) => (prev <= startYear ? startYear + 1 : prev));
  }, [formData.date]);

   const handleEndYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parts = formData.date.split("/");
    const startYear = parts.length === 3 ? parseInt(parts[2]) : new Date().getFullYear();

    let value = parseInt(e.target.value);
    if (isNaN(value)) return;
    if (value <= startYear) {
      value = startYear + 1;
    }
    setEndYear(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  const [_, month, year] = formData.date.split("/").map(Number);

  const parseToMoment = (timeStr: string, dateStr: string) =>
    moment(`${dateStr} ${timeStr}`, "DD/MM/YYYY hh:mm A");

  const start = parseToMoment(formData.startTime, formData.date);
  const end = parseToMoment(formData.endTime, formData.date);

  if (!start.isBefore(end)) {
    setTimeError("Start time must be earlier than end time.");
    return;
  }

  setTimeError(null);

  const createEvent = (dateStr: string) => ({
    id: `event-${dateStr.replace(/\//g, '')}-${Date.now()}`,
    year: Number(dateStr.split("/")[2]),
    month: Number(dateStr.split("/")[1]),
    event: {
      eventName: formData.eventName,
      date: dateStr,
      startTime: formData.startTime,
      endTime: formData.endTime,
    },
  });

  if (showAdvanced) {
    const dayOfWeek = moment(formData.date, "DD/MM/YYYY").day();
    const start = moment(formData.date, "DD/MM/YYYY");
    const end = moment(`${endYear}-12-31`, "YYYY-MM-DD");

    let current = start.clone();
    while (current.isSameOrBefore(end)) {
      if (current.day() === dayOfWeek) {
        const dateStr = current.format("DD/MM/YYYY");

        // Check if event already exists on this date
        const existingEvent = allEvents.find(
          (e) => e.event.date === dateStr && e.event.eventName === formData.eventName
        );

        const eventData = {
          year: current.year(),
          month: current.month() + 1,
          event: {
            eventName: formData.eventName,
            date: dateStr,
            startTime: formData.startTime,
            endTime: formData.endTime,
          },
        };

        if (existingEvent) {
          updateEvent(existingEvent.id, { id: existingEvent.id, ...eventData });
        } else {
          const newId = `event-${dateStr.replace(/\//g, '')}-${Date.now()}`;
          addEvent({ id: newId, ...eventData });
        }
      }
      current.add(1, "week");
    }
  } else {
    const calendarEvent = {
      id: formData.id ?? `event-${Date.now()}`,
      year,
      month,
      event: {
        eventName: formData.eventName,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
      },
    };

    if (isEdit && formData.id) {
      updateEvent(formData.id, calendarEvent);
    } else {
      addEvent(calendarEvent);
    }
  }

  onClose();
};



  const handleDelete = () => {
    if (formData.id) {
      deleteEvent(formData.id);
      onClose();
    }
  };

  const pad2 = (num: string | number) => num.toString().padStart(2, "0");

  const parseTime = (time: string) => {
    const [t, ampm] = time.split(" ");
    let [hour, minute] = t.split(":");
    hour = pad2(hour);
    minute = pad2(minute);
    return { hour, minute, ampm };
  };

  const buildTime = (hour: string, minute: string, ampm: string) => {
    return `${pad2(hour)}:${pad2(minute)} ${ampm}`;
  }

  const { hour: startHour, minute: startMinute, ampm: startAmPm } = parseTime(formData.startTime);
  const { hour: endHour, minute: endMinute, ampm: endAmPm } = parseTime(formData.endTime);

  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-96 space-y-4">
        <h2 className="text-lg font-semibold">{isEdit ? "Update Event" : "Create Event"}</h2>

        <div>
          <label className="block text-sm font-medium">Event Name</label>
          <input
            name="eventName"
            value={formData.eventName}
            onChange={handleChange}
            className="w-full border rounded p-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Start Time</label>
          <div className="flex gap-2">
            <select
              name="startHour"
              value={startHour}
              onChange={(e) => {
                const newHour = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  startTime: buildTime(newHour, startMinute, startAmPm),
                }));
              }}
              className="border rounded p-2 text-sm"
              required
            >
              {[...Array(12)].map((_, i) => {
                const val = (i + 1).toString().padStart(2, "0");
                return <option key={val} value={val}>{val}</option>;
              })}
            </select>

            <select
              name="startMinute"
              value={startMinute}
              onChange={(e) => {
                const newMinute = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  startTime: buildTime(startHour, newMinute, startAmPm),
                }));
              }}
              className="border rounded p-2 text-sm"
              required
            >
              {["00", "15", "30", "45"].map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>

            <select
              name="startAmPm"
              value={startAmPm}
              onChange={(e) => {
                const newAmPm = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  startTime: buildTime(startHour, startMinute, newAmPm),
                }));
              }}
              className="border rounded p-2 text-sm"
              required
            >
              {["AM", "PM"].map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">End Time</label>
          <div className="flex gap-2">
              <select
                name="endHour"
                value={endHour}
                onChange={(e) => {
                  const newHour = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    endTime: buildTime(newHour, endMinute, endAmPm),
                  }));
                }}
                className="border rounded p-2 text-sm"
                required
              >
                {[...Array(12)].map((_, i) => {
                  const val = (i + 1).toString().padStart(2, "0");
                  return <option key={val} value={val}>{val}</option>;
                })}
              </select>

              <select
                name="endMinute"
                value={endMinute}
                onChange={(e) => {
                  const newMinute = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    endTime: buildTime(endHour, newMinute, endAmPm),
                  }));
                }}
                className="border rounded p-2 text-sm"
                required
              >
                {["00", "15", "30", "45"].map(val => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>

              <select
                name="endAmPm"
                value={endAmPm}
                onChange={(e) => {
                  const newAmPm = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    endTime: buildTime(endHour, endMinute, newAmPm),
                  }));
                }}
                className="border rounded p-2 text-sm"
                required
              >
                {["AM", "PM"].map(val => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </div>
            {timeError && (
              <p className="text-red-600 text-xs mt-1">{timeError}</p>
            )}
        </div>

        <div>
          <label className="block text-sm font-medium">Date</label>
          <input
            type="date"
            name="date"
            value={moment(formData.date, "DD/MM/YYYY").format("YYYY-MM-DD")}
            onChange={(e) =>
              setFormData({
                ...formData,
                date: moment(e.target.value, "YYYY-MM-DD").format("DD/MM/YYYY"),
              })
            }
            className="w-full border rounded p-2 text-sm"
            required
          />
        </div>

        <div className="mt-4">
  <button
    type="button"
    onClick={() => setShowAdvanced((prev) => !prev)}
    className="text-blue-600 text-sm underline"
  >
    {showAdvanced ? "Hide Advanced Options" : "Show Advanced Options"}
  </button>

  {showAdvanced && (
      <div className="mt-3 space-y-2">
        <div>
          <label className="block text-sm font-medium">End Year</label>
          <input
            type="number"
            max={2100}
            value={endYear}
            onChange={handleEndYearChange}
            className="w-full border rounded p-2 text-sm"
          />
        </div>
      </div>
    )}
</div>


        <div className="flex justify-between items-center">
          {isEdit ? (
            <button
              type="button"
              onClick={handleDelete}
              className="text-red-600 text-sm hover:underline"
            >
              Delete
            </button>
          ) : <div />}

          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded hover:bg-gray-100">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
