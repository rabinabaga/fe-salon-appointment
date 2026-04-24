import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/ui/DashboardLayout';
import api from '@/lib/api';
import { SalonService } from '@/types';
import { useSlotSocket } from '@/hooks/useSlotSocket';
import { Wifi } from 'lucide-react';

interface FormData { serviceId: string; date: string; startTime: string; notes?: string; }

export default function NewAppointmentPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState<SalonService[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [liveFlash, setLiveFlash] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>();
  const watchService = watch('serviceId') || null;
  const watchDate = watch('date') || null;
  const watchStartTime = watch('startTime');

  useEffect(() => { api.get('/services?activeOnly=true').then((r) => setServices(r.data.data)); }, []);

  useEffect(() => {
    if (!watchService || !watchDate) { setAvailableSlots([]); return; }
    setLoadingSlots(true);
    setValue('startTime', '');
    api.get(`/appointments/available-slots?serviceId=${watchService}&date=${watchDate}`)
      .then((r) => setAvailableSlots(r.data.data))
      .catch(() => toast.error('Failed to load slots'))
      .finally(() => setLoadingSlots(false));
  }, [watchService, watchDate]); // eslint-disable-line

  // Called by socket when another user books/cancels on this service+date
  const handleSlotsUpdated = useCallback((freshSlots: string[]) => {
    setAvailableSlots(freshSlots);
    setLiveFlash(true);
    setTimeout(() => setLiveFlash(false), 2500);

    // If the user had already selected a slot that is now gone, warn them
    if (watchStartTime && !freshSlots.includes(watchStartTime)) {
      setValue('startTime', '');
      toast.error(
        `⚡ The ${watchStartTime} slot was just taken by another customer. Please choose a different time.`,
        { duration: 6000 },
      );
    }
  }, [watchStartTime, setValue]);

  useSlotSocket({ serviceId: watchService, date: watchDate, onSlotsUpdated: handleSlotsUpdated });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await api.post('/appointments', data);
      toast.success('Appointment booked!');
      navigate('/appointments');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Booking failed');
      // Re-fetch fresh slots in case of race condition
      if (watchService && watchDate) {
        api.get(`/appointments/available-slots?serviceId=${watchService}&date=${watchDate}`)
          .then((r) => { setAvailableSlots(r.data.data); setValue('startTime', ''); });
      }
    } finally { setSubmitting(false); }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl">Book an Appointment</h1>
        <p className="text-espresso/50 text-sm mt-1">Choose your service, date, and time</p>
      </div>

      <div className="max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">

          <div>
            <label className="label">Service</label>
            <select {...register('serviceId', { required: 'Please select a service' })} className="input">
              <option value="">— Select a service —</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.duration} min · ${s.price})</option>
              ))}
            </select>
            {errors.serviceId && <p className="text-red-600 text-xs mt-1">{errors.serviceId.message}</p>}
          </div>

          <div>
            <label className="label">Date</label>
            <input {...register('date', { required: 'Please select a date' })} type="date" min={today} className="input" />
            {errors.date && <p className="text-red-600 text-xs mt-1">{errors.date.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0">Available Time Slots</label>
              {watchService && watchDate && (
                <span className={`flex items-center gap-1 text-xs transition-colors duration-500 ${liveFlash ? 'text-gold font-semibold' : 'text-espresso/30'}`}>
                  <Wifi size={11} /> {liveFlash ? 'Updated live' : 'Live'}
                </span>
              )}
            </div>
            {!watchService || !watchDate ? (
              <p className="text-espresso/40 text-sm">Select a service and date to see available slots</p>
            ) : loadingSlots ? (
              <p className="text-espresso/40 text-sm">Loading slots…</p>
            ) : availableSlots.length === 0 ? (
              <p className="text-red-600 text-sm">No available slots on this date. Try another day.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {availableSlots.map((slot) => (
                  <label key={slot} className="cursor-pointer">
                    <input {...register('startTime', { required: 'Please select a time' })} type="radio" value={slot} className="sr-only peer" />
                    <span className="block text-center py-2 text-xs border border-cream-200 rounded peer-checked:bg-espresso peer-checked:text-cream-100 peer-checked:border-espresso hover:border-gold transition-colors">
                      {slot}
                    </span>
                  </label>
                ))}
              </div>
            )}
            {errors.startTime && <p className="text-red-600 text-xs mt-1">{errors.startTime.message}</p>}
          </div>

          <div>
            <label className="label">Notes <span className="normal-case text-espresso/40">(optional)</span></label>
            <textarea {...register('notes')} rows={3} placeholder="Any special requests…" className="input resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn-gold">{submitting ? 'Booking…' : 'Book Appointment'}</button>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}