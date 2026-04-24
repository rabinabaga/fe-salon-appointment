import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/ui/DashboardLayout';
import api from '@/lib/api';
import { SalonService } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface FormData { name: string; duration: number; price: number; description?: string; }

export default function ServicesPage() {
  const { isStaff } = useAuth();
  const [services, setServices] = useState<SalonService[]>([]);
  const [editing, setEditing] = useState<SalonService | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const load = () => api.get('/services').then((r) => setServices(r.data.data));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); reset({}); setShowForm(true); };
  const openEdit = (s: SalonService) => { setEditing(s); reset({ name: s.name, duration: s.duration, price: s.price, description: s.description }); setShowForm(true); };

  const onSubmit = async (data: FormData) => {
    try {
      if (editing) { await api.patch(`/services/${editing.id}`, data); toast.success('Service updated'); }
      else { await api.post('/services', data); toast.success('Service created'); }
      setShowForm(false); load();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this service?')) return;
    try { await api.delete(`/services/${id}`); toast.success('Deleted'); load(); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Error'); }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Services</h1>
        {isStaff && <button onClick={openNew} className="btn-gold flex items-center gap-2"><Plus size={16} /> Add Service</button>}
      </div>

      {showForm && isStaff && (
        <div className="card mb-6 max-w-lg">
          <h2 className="font-display text-lg mb-4">{editing ? 'Edit Service' : 'New Service'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div><label className="label">Name</label><input {...register('name', { required: true })} className="input" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Duration (min)</label><input {...register('duration', { required: true, valueAsNumber: true })} type="number" min="15" step="15" className="input" /></div>
              <div><label className="label">Price ($)</label><input {...register('price', { required: true, valueAsNumber: true })} type="number" step="0.01" min="0" className="input" /></div>
            </div>
            <div><label className="label">Description</label><textarea {...register('description')} rows={2} className="input resize-none" /></div>
            <div className="flex gap-3">
              <button type="submit" className="btn-gold">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {services.map((s) => (
          <div key={s.id} className={`card flex items-start justify-between ${!s.isActive ? 'opacity-50' : ''}`}>
            <div>
              <h3 className="font-display text-lg">{s.name}</h3>
              <p className="text-sm text-espresso/60 mt-1">{s.duration} min · <span className="font-semibold text-espresso">${s.price}</span></p>
              {s.description && <p className="text-xs text-espresso/50 mt-2">{s.description}</p>}
              {!s.isActive && <span className="badge-cancelled mt-2 inline-block">Inactive</span>}
            </div>
            {isStaff && (
              <div className="flex gap-2 ml-4">
                <button onClick={() => openEdit(s)} className="p-1.5 text-espresso/40 hover:text-espresso transition-colors"><Pencil size={14} /></button>
                <button onClick={() => remove(s.id)} className="p-1.5 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}