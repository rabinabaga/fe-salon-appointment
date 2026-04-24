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
  callbackRef.current = onSlotsUpdated;

  // Create socket once on mount
  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
    socketRef.current = io(`${wsUrl}/appointments`, { transports: ['websocket'] });

    socketRef.current.on('slots-updated', (payload: { serviceId: string; date: string; availableSlots: string[] }) => {
      // Guard: only fire for the room we care about (server already filters by room, but belt-and-suspenders)
      if (payload.serviceId === serviceId && payload.date === date) {
        callbackRef.current(payload.availableSlots);
      }
    });

    return () => { socketRef.current?.disconnect(); socketRef.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe / unsubscribe when serviceId or date changes
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    if (!serviceId || !date) return;

    socket.emit('subscribe-slots', { serviceId, date });
    return () => { socket.emit('unsubscribe-slots', { serviceId, date }); };
  }, [serviceId, date]);
}