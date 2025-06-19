export const times = Array.from({ length: 24 }, (_, h) => new Date(0, 0, 0, h).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
export const days = Array.from({ length: 7 }, (_, i) => new Date(1970, 0, 4 + i).toLocaleDateString('en-US', { weekday: 'long' }));
