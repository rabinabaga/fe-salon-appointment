import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/ui/DashboardLayout';
import api from '@/lib/api';
import { NotificationTemplate, Settings } from '@/types';
import { CheckCircle } from 'lucide-react';

export function TemplatesPage() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  const load = async () => {
    const [t, s] = await Promise.all([api.get('/notifications/templates'), api.get('/settings')]);
    setTemplates(t.data.data); setSettings(s.data.data);
  };
  useEffect(() => { load(); }, []);

  const activate = async (id: string) => { await api.put(`/settings/active-template/${id}`); toast.success('Template activated'); load(); };
  const deactivate = async () => { await api.delete('/settings/active-template'); toast.success('Cleared'); load(); };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl">Notification Templates</h1>
        {settings?.activeTemplate && <p className="text-espresso/50 text-sm mt-1">Active: <strong>{settings.activeTemplate.name}</strong></p>}
      </div>
      <div className="space-y-4">
        {templates.map((t) => {
          const isActive = settings?.activeTemplateId === t.id;
          return (
            <div key={t.id} className={`card border-2 transition-colors ${isActive ? 'border-gold' : 'border-cream-200'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg">{t.name}</h3>
                    {isActive && <span className="badge-confirmed flex items-center gap-1"><CheckCircle size={10} /> Active</span>}
                  </div>
                  <p className="text-xs text-espresso/50 mt-1"><strong>Subject:</strong> {t.subject}</p>
                  <div className="mt-3 text-xs bg-cream-100 rounded p-3 text-espresso/70 max-h-28 overflow-y-auto font-sans"
                    dangerouslySetInnerHTML={{ __html: t.body }} />
                </div>
                <div className="ml-4">
                  {isActive
                    ? <button onClick={deactivate} className="btn-secondary text-xs py-1 px-3">Deactivate</button>
                    : <button onClick={() => activate(t.id)} className="btn-gold text-xs py-1 px-3">Set Active</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  useEffect(() => { api.get('/settings').then((r) => setSettings(r.data.data)); }, []);

  return (
    <DashboardLayout>
      <h1 className="font-display text-3xl mb-8">Settings</h1>
      <div className="card max-w-lg">
        <h2 className="font-display text-lg mb-4">Active Notification Template</h2>
        {settings?.activeTemplate
          ? <p className="text-sm">Currently using: <strong>{settings.activeTemplate.name}</strong>. <Link to="/templates" className="text-gold hover:underline">Change →</Link></p>
          : <p className="text-sm text-espresso/60">No active template. A default fallback will be used. <Link to="/templates" className="text-gold hover:underline">Select one →</Link></p>}
      </div>
    </DashboardLayout>
  );
}

export function LogsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/bulk-jobs').then((r) => { setJobs(r.data.data); setLoading(false); }); }, []);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl">Notification Logs</h1>
        <p className="text-espresso/50 text-sm mt-1">History of all bulk notification jobs</p>
      </div>
      {loading ? <p className="text-espresso/40">Loading…</p> : jobs.length === 0 ? (
        <div className="card text-center py-16 text-espresso/40">
          <p>No bulk jobs yet.</p>
          <Link to="/bulk-jobs/upload" className="btn-gold inline-block mt-4">Upload Excel</Link>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-cream-100">
              <tr>{['Date', 'Total', 'Success', 'Failed', 'Status', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-widest text-espresso/50 font-semibold">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id} className="border-t border-cream-100 hover:bg-cream-50">
                  <td className="px-4 py-3 text-espresso/70">{new Date(j.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{j.totalRows}</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">{j.successCount}</td>
                  <td className="px-4 py-3 text-red-600 font-semibold">{j.failCount}</td>
                  <td className="px-4 py-3"><span className={`badge-${j.status.toLowerCase()}`}>{j.status}</span></td>
                  <td className="px-4 py-3"><Link to={`/bulk-jobs/${j.id}`} className="text-gold text-xs hover:underline">View logs →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}