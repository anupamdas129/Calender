"use client";
import React, { useState } from "react";
import { useEvents } from "../context/EventsContext";

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
  const { addEvent, updateEvent, deleteEvent } = useEvents();

  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState<EventFormData>({
    id: initialData.id,
    eventName: initialData.eventName ?? "",
    startTime: initialData.startTime ?? "09:00 AM",
    endTime: initialData.endTime ?? "10:00 AM",
    date: initialData.date ?? new Date().toLocaleDateString("en-GB"),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const [_, month, year] = formData.date.split("/").map(Number);
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
        </div>

        <div>
          <label className="block text-sm font-medium">Date</label>
          <input
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border rounded p-2 text-sm"
            placeholder="DD/MM/YYYY"
            required
          />
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
