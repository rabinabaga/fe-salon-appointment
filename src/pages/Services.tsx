import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/ui/DashboardLayout';
import api from '@/lib/api';
import { SalonService } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { Plus, X } from 'lucide-react';

interface FormData {
  name: string;
  duration: number;
  price: number;
  description?: string;
}

export default function ServicesPage() {
  const { isStaff } = useAuth();
  const [services, setServices] = useState<SalonService[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const load = () =>
    api.get('/services').then((r) => setServices(r.data.data));

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await api.post('/services', data);
      toast.success('Service created');
      reset();
      setShowForm(false);
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to create service');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Services</h1>
        {isStaff && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="btn-gold flex items-center gap-2"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Cancel' : 'Add Service'}
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && isStaff && (
        <div className="card mb-6 max-w-lg">
          <h2 className="font-display text-lg mb-4">New Service</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input
                {...register('name', { required: 'Name is required' })}
                placeholder="e.g. Haircut"
                className="input"
              />
              {errors.name && (
                <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Duration (min)</label>
                <input
                  {...register('duration', {
                    required: 'Required',
                    valueAsNumber: true,
                    min: { value: 15, message: 'Min 15 min' },
                  })}
                  type="number"
                  min="15"
                  step="15"
                  placeholder="30"
                  className="input"
                />
                {errors.duration && (
                  <p className="text-red-600 text-xs mt-1">{errors.duration.message}</p>
                )}
              </div>
              <div>
                <label className="label">Price ($)</label>
                <input
                  {...register('price', {
                    required: 'Required',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Min 0' },
                  })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="25.00"
                  className="input"
                />
                {errors.price && (
                  <p className="text-red-600 text-xs mt-1">{errors.price.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="label">
                Description{' '}
                <span className="normal-case text-espresso/40">(optional)</span>
              </label>
              <textarea
                {...register('description')}
                rows={2}
                placeholder="Brief description of the service"
                className="input resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting} className="btn-gold">
                {submitting ? 'Creating…' : 'Create Service'}
              </button>
              <button
                type="button"
                onClick={() => { reset(); setShowForm(false); }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Services grid */}
      {services.length === 0 ? (
        <div className="card text-center py-16 text-espresso/40">
          <p className="font-display text-lg mb-2">No services yet</p>
          {isStaff && (
            <button onClick={() => setShowForm(true)} className="btn-gold inline-block mt-4">
              Add your first service
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {services.map((s) => (
            <div
              key={s.id}
              className={`card ${!s.isActive ? 'opacity-50' : ''}`}
            >
              <h3 className="font-display text-lg">{s.name}</h3>
              <p className="text-sm text-espresso/60 mt-1">
                {s.duration} min ·{' '}
                <span className="font-semibold text-espresso">${s.price}</span>
              </p>
              {s.description && (
                <p className="text-xs text-espresso/50 mt-2">{s.description}</p>
              )}
              {!s.isActive && (
                <span className="badge-cancelled mt-2 inline-block">Inactive</span>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}