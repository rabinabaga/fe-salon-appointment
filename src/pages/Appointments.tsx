import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/ui/DashboardLayout';
import api from '@/lib/api';
import { Appointment } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { Plus, CheckCircle } from 'lucide-react';

export default function AppointmentsPage() {
  const { isStaff } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/appointments').then((r) => { setAppointments(r.data.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const confirmAppt = async (id: string) => {
    try { await api.patch(`/appointments/${id}/confirm`); toast.success('Confirmed'); load(); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const cancelAppt = async (id: string) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try { await api.patch(`/appointments/${id}/cancel`); toast.success('Cancelled'); load(); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Appointments</h1>
        <Link to="/appointments/new" className="btn-gold flex items-center gap-2"><Plus size={16} /> Book Appointment</Link>
      </div>

      {loading ? <p className="text-espresso/40">Loading…</p> : appointments.length === 0 ? (
        <div className="card text-center py-16 text-espresso/40">
          <p className="text-lg font-display mb-2">No appointments found</p>
          <Link to="/appointments/new" className="btn-gold inline-block mt-4">Book your first appointment</Link>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-cream-100">
              <tr>{(isStaff ? ['Customer','Service','Date','Time','Status','Actions'] : ['Service','Date','Time','Status','Actions']).map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-widest text-espresso/50 font-semibold">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id} className="border-t border-cream-100 hover:bg-cream-50">
                  {isStaff && <td className="px-4 py-3 font-semibold">{a.user?.name}</td>}
                  <td className="px-4 py-3">{a.service?.name}</td>
                  <td className="px-4 py-3 text-espresso/70">{a.date}</td>
                  <td className="px-4 py-3 text-espresso/70">{a.startTime} – {a.endTime}</td>
                  <td className="px-4 py-3"><span className={`badge-${a.status.toLowerCase()}`}>{a.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isStaff && a.status === 'PENDING' && (
                        <button onClick={() => confirmAppt(a.id)} className="btn-primary py-1 px-3 text-xs flex items-center gap-1"><CheckCircle size={12} /> Confirm</button>
                      )}
                      {a.status !== 'CANCELLED' && (
                        <button onClick={() => cancelAppt(a.id)} className="btn-danger py-1 px-3 text-xs">Cancel</button>
                      )}
                      {a.status === 'PENDING' && (
                        <Link to={`/appointments/${a.id}`} className="btn-secondary py-1 px-3 text-xs">Edit</Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}