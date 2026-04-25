import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface RowProcessedEvent {
  jobId: string; rowIndex: number; total: number; processedCount: number;
  successCount: number; failCount: number; customerEmail: string;
  status: 'SUCCESS' | 'FAILED'; error?: string;
}
export interface JobCompletedEvent { jobId: string; successCount: number; failCount: number; total: number; }

interface Options {
  jobId: string | null;
  onRowProcessed?: (e: RowProcessedEvent) => void;
  onJobCompleted?: (e: JobCompletedEvent) => void;
  onJobStarted?: (e: { jobId: string; totalRows: number }) => void;
}

export function useBulkJobSocket({ jobId, onRowProcessed, onJobCompleted, onJobStarted }: Options) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!jobId) return;
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
    const socket = io(`${wsUrl}/bulk-jobs`, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => socket.emit('subscribe-job', { jobId }));
    if (onJobStarted)  socket.on('job-started',   onJobStarted);
    if (onRowProcessed) socket.on('row-processed', onRowProcessed);
    if (onJobCompleted) socket.on('job-completed', onJobCompleted);

    return () => { socket.emit('unsubscribe-job', { jobId }); socket.disconnect(); };
  }, [jobId]); // eslint-disable-line react-hooks/exhaustive-deps
}