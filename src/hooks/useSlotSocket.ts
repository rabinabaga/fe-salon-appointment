import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Options {
  serviceId: string | null;
  date: string | null;
  onSlotsUpdated: (slots: string[]) => void;
}

export function useSlotSocket({ serviceId, date, onSlotsUpdated }: Options) {
  const socketRef = useRef<Socket | null>(null);
  const callbackRef = useRef(onSlotsUpdated);
  const serviceIdRef = useRef(serviceId);   // ← add
  const dateRef = useRef(date);             // ← add

  callbackRef.current = onSlotsUpdated;
  serviceIdRef.current = serviceId;         // ← keep in sync
  dateRef.current = date;                   // ← keep in sync

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
    socketRef.current = io(`${wsUrl}/appointments`, { transports: ['websocket'] });

    socketRef.current.on('slots-updated', (payload: { serviceId: string; date: string; availableSlots: string[] }) => {
      console.log('slots-updated received', payload);           // ← add this
      console.log('current filter', serviceIdRef.current, dateRef.current); // ← add this

      if (payload.serviceId === serviceIdRef.current && payload.date === dateRef.current) {
        callbackRef.current(payload.availableSlots);
      }
    });

    return () => { socketRef.current?.disconnect(); socketRef.current = null; };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    if (!serviceId || !date) return;

    socket.emit('subscribe-slots', { serviceId, date });
    return () => { socket.emit('unsubscribe-slots', { serviceId, date }); };
  }, [serviceId, date]);
}