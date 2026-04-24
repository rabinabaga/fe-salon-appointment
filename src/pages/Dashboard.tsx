import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/ui/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Appointment, BulkJob } from '@/types';
import { CalendarDays, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function DashboardPage() {
  const { user, isStaff } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bulkJobs, setBulkJobs] = useState<BulkJob[]>([]);

  useEffect(() => {
    api.get('/appointments').then((r) => setAppointments(r.data.data));
    if (isStaff) api.get('/bulk-jobs').then((r) => setBulkJobs(r.data.data));
  }, [isStaff]);

  const pending = appointments.filter((a) => a.status === 'PENDING').length;
  const confirmed = appointments.filter((a) => a.status === 'CONFIRMED').length;
  const cancelled = appointments.filter((a) => a.status === 'CANCELLED').length;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl">Welcome back, {user?.name}</h1>
        <p className="text-espresso/50 text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Pending', value: pending, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'Confirmed', value: confirmed, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Cancelled', value: cancelled, icon: XCircle, color: 'text-red-600 bg-red-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`p-3 rounded-lg ${color}`}><Icon size={20} /></div>
            <div><p className="text-2xl font-display font-bold">{value}</p><p className="text-xs text-espresso/50 uppercase tracking-widest">{label}</p></div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl">Recent Appointments</h2>
          <Link to="/appointments" className="text-gold text-sm hover:underline">View all →</Link>
        </div>
        {appointments.length === 0 ? (
          <div className="text-center py-10 text-espresso/40">
            <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
            <p>No appointments yet.</p>
            <Link to="/appointments/new" className="btn-gold inline-block mt-4 text-sm">Book Now</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-cream-200">{['Service', 'Date', 'Time', 'Status'].map((h) => <th key={h} className="text-left py-2 text-xs uppercase tracking-widest text-espresso/40 font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {appointments.slice(0, 5).map((a) => (
                <tr key={a.id} className="border-b border-cream-100 hover:bg-cream-50 transition-colors">
                  <td className="py-3 font-semibold">{a.service?.name}</td>
                  <td className="py-3 text-espresso/70">{a.date}</td>
                  <td className="py-3 text-espresso/70">{a.startTime} – {a.endTime}</td>
                  <td className="py-3"><span className={`badge-${a.status.toLowerCase()}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isStaff && bulkJobs.length > 0 && (
        <div className="card mt-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl">Recent Bulk Jobs</h2>
            <Link to="/bulk-jobs/upload" className="text-gold text-sm hover:underline">Upload →</Link>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-cream-200">{['Total', 'Success', 'Failed', 'Status'].map((h) => <th key={h} className="text-left py-2 text-xs uppercase tracking-widest text-espresso/40 font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {bulkJobs.slice(0, 5).map((j) => (
                <tr key={j.id} className="border-b border-cream-100">
                  <td className="py-3">{j.totalRows}</td>
                  <td className="py-3 text-green-600">{j.successCount}</td>
                  <td className="py-3 text-red-600">{j.failCount}</td>
                  <td className="py-3"><span className={`badge-${j.status.toLowerCase()}`}>{j.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}