// ✅ Mock calendar events across previous, current, and next month
const mockEvents = [
  {
    id: "event-1",
    year: 2025,
    month: 6,
    event: {
      eventName: "Team Standup 15",
      date: "15/6/2025",
      startTime: "9:00 AM",
      endTime: "9:30 AM",
    },
  },
  {
    id: "event-2",
    year: 2025,
    month: 6,
    event: {
      eventName: "Team Standup",
      date: "19/6/2025",
      startTime: "9:00 AM",
      endTime: "11:30 AM",
    },
  },
  {
    id: "event-3",
    year: 2025,
    month: 6,
    event: {
      eventName: "Team Standup",
      date: "19/6/2025",
      startTime: "2:00 AM",
      endTime: "3:10 AM",
    },
  },
  {
    id: "event-4",
    year: 2025,
    month: 6,
    event: {
      eventName: "Team Standup",
      date: "19/6/2025",
      startTime: "9:00 AM",
      endTime: "11:30 AM",
    },
  },
  {
    id: "event-5",
    year: 2025,
    month: 6,
    event: {
      eventName: "Client Sync",
      date: "19/6/2025",
      startTime: "1:10 PM",
      endTime: "4:00 PM",
    },
  },

  // ✅ Earlier this month
  {
    id: "event-6",
    year: 2025,
    month: 6,
    event: {
      eventName: "Marketing Review",
      date: "5/6/2025",
      startTime: "5:00 AM",
      endTime: "3:00 PM",
    },
  },
  {
    id: "event-7",
    year: 2025,
    month: 6,
    event: {
      eventName: "Sprint Planning",
      date: "12/6/2025",
      startTime: "10:00 AM",
      endTime: "11:30 AM",
    },
  },

  // ✅ Previous month
  {
    id: "event-8",
    year: 2025,
    month: 5,
    event: {
      eventName: "May Townhall",
      date: "20/5/2025",
      startTime: "3:00 PM",
      endTime: "4:00 PM",
    },
  },
  {
    id: "event-9",
    year: 2025,
    month: 5,
    event: {
      eventName: "Product Demo",
      date: "27/5/2025",
      startTime: "1:00 PM",
      endTime: "2:00 PM",
    },
  },

  // ✅ Next month
  {
    id: "event-10",
    year: 2025,
    month: 7,
    event: {
      eventName: "Q3 Kickoff",
      date: "3/7/2025",
      startTime: "10:00 AM",
      endTime: "11:00 AM",
    },
  },
  {
    id: "event-11",
    year: 2025,
    month: 7,
    event: {
      eventName: "Design Handoff",
      date: "10/7/2025",
      startTime: "2:00 PM",
      endTime: "3:30 PM",
    },
  },
];

export default mockEvents;
