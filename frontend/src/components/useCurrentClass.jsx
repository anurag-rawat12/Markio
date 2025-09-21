import { useEffect, useState } from 'react';

const useCurrentClass = (timetable) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentClass, setCurrentClass] = useState(null);
  const [nextClass, setNextClass] = useState(null);

  const getClassInfo = () => {
    if (!timetable || timetable.length === 0) return { current: null, next: null };

    const now = currentTime;
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    let liveClass = null;
    let upcomingClass = null;
    let minMinutesUntilNext = Infinity;

    timetable.forEach(slot => {
      if (slot.day !== currentDay) return;

      const [startHour, startMinute] = slot.startTime.split(':').map(Number);
      const [endHour, endMinute] = slot.endTime.split(':').map(Number);

      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      if (currentTotalMinutes >= startMinutes && currentTotalMinutes <= endMinutes) {
        // Currently ongoing
        liveClass = slot;
      } else if (startMinutes > currentTotalMinutes && startMinutes - currentTotalMinutes < minMinutesUntilNext) {
        // Upcoming class
        minMinutesUntilNext = startMinutes - currentTotalMinutes;
        upcomingClass = slot;
      }
    });

    return { current: liveClass, next: upcomingClass };
  };

  useEffect(() => {
    // Update clock every 30 seconds
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);

    // Initial calculation
    const { current, next } = getClassInfo();
    setCurrentClass(current);
    setNextClass(next);

    return () => clearInterval(timer);
  }, [timetable]);

  useEffect(() => {
    // Update current/next class whenever time changes
    const { current, next } = getClassInfo();
    setCurrentClass(prev => (prev?.id !== current?.id ? current : prev));
    setNextClass(prev => (prev?.id !== next?.id ? next : prev));
  }, [currentTime, timetable]);

  return { currentClass, nextClass, currentTime };
};

export default useCurrentClass;
