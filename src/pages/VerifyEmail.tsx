// VerifyEmail.tsx
import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '@/lib/api';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

const called = useRef(false);

useEffect(() => {
  if (called.current) return;
  called.current = true;

  if (!token) { setStatus('error'); setMessage('No token provided.'); return; }

  api.get(`/auth/verify-email?token=${token}`)
    .then((r) => { setStatus('success'); setMessage(r.data.data.message); })
    .catch((e) => { setStatus('error'); setMessage(e.response?.data?.message || 'Verification failed.'); });
}, [token]);

  return (
    <div className="min-h-screen bg-espresso flex items-center justify-center px-4">
      <div className="bg-cream-50 rounded-xl p-10 max-w-md w-full text-center shadow-2xl">
        {status === 'loading' && <p className="font-display text-xl">Verifying…</p>}
        {status === 'success' && (<><div className="text-5xl mb-4">✅</div><h2 className="font-display text-2xl mb-3">Email Verified!</h2><p className="text-espresso/70 text-sm mb-6">{message}</p><Link to="/login" className="btn-primary">Sign In</Link></>)}
        {status === 'error' && (<><div className="text-5xl mb-4">❌</div><h2 className="font-display text-2xl mb-3">Verification Failed</h2><p className="text-espresso/70 text-sm mb-6">{message}</p><Link to="/login" className="btn-secondary">Back to Login</Link></>)}
      </div>
    </div>
  );
}