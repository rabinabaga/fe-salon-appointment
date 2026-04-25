import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/ui/DashboardLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Upload } from 'lucide-react';

interface RowResult { rowIndex: number; customerEmail: string; status: 'SUCCESS' | 'FAILED'; error?: string; }
interface Progress { total: number; processedCount: number; successCount: number; failCount: number; }

export default function BulkUploadPage() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [rows, setRows] = useState<RowResult[]>([]);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

 
  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return toast.error('Please select an Excel file');
    const form = new FormData();
    form.append('file', file);
    setUploading(true);
    try {
      const res = await api.post('/bulk-jobs/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setJobId(res.data.data.id);
      setRows([]); setDone(false); setProgress(null);
      toast.success('File uploaded — processing started');
    } catch (e: any) { toast.error(e.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const pct = progress ? Math.round((progress.processedCount / progress.total) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl">Bulk Appointment Notifications</h1>
        <p className="text-espresso/50 text-sm mt-1">Upload an Excel file to send confirmation emails to multiple customers at once</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="card space-y-4">
          <h2 className="font-display text-lg">Upload Excel File</h2>
          <p className="text-sm text-espresso/60">Required columns: <code className="bg-cream-100 px-1 rounded text-xs">customerName, customerEmail, service, date, startTime</code></p>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="input text-sm" />
          <button onClick={handleUpload} disabled={uploading} className="btn-gold flex items-center gap-2 w-full justify-center">
            <Upload size={15} /> {uploading ? 'Uploading…' : 'Upload & Process'}
          </button>
          {done && jobId && <Link to={`/bulk-jobs/${jobId}`} className="btn-secondary block text-center text-sm">View Full Log →</Link>}
        </div>

        
      </div>

      {rows.length > 0 && (
        <div className="card overflow-hidden p-0">
          <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between">
            <h2 className="font-display text-lg">Live Processing Log</h2>
            <span className="text-xs text-espresso/40">{rows.length} rows processed</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-100 sticky top-0">
                <tr>{['#', 'Email', 'Status', 'Error'].map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs uppercase tracking-widest text-espresso/50 font-semibold">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.rowIndex} className="border-t border-cream-100">
                    <td className="px-4 py-2 text-espresso/40">{r.rowIndex + 1}</td>
                    <td className="px-4 py-2">{r.customerEmail}</td>
                    <td className="px-4 py-2"><span className={`badge-${r.status.toLowerCase()}`}>{r.status}</span></td>
                    <td className="px-4 py-2 text-red-500 text-xs">{r.error ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}