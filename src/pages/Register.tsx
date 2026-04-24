import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, 'Min 8 characters'),
});
type F = z.infer<typeof schema>;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: F) => {
    setLoading(true);
    try { await api.post('/auth/register', data); setDone(true); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  if (done) return (
    <div className="min-h-screen bg-espresso flex items-center justify-center px-4">
      <div className="bg-cream-50 rounded-xl p-10 max-w-md w-full text-center shadow-2xl">
        <div className="text-5xl mb-4">✉️</div>
        <h2 className="font-display text-2xl mb-3">Check your inbox</h2>
        <p className="text-espresso/70 text-sm leading-relaxed">We've sent a verification link. Click it to activate your account, then sign in.</p>
        <Link to="/login" className="btn-primary inline-block mt-6">Go to Login</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-espresso flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl text-cream-100 tracking-wider">✦ Salon</h1>
          <p className="text-cream-200/50 text-sm mt-2 tracking-widest uppercase">Create your account</p>
        </div>
        <div className="bg-cream-50 rounded-xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Full Name</label>
              <input {...register('name')} placeholder="Jane Doe" className="input" />
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Email</label>
              <input {...register('email')} type="email" placeholder="you@example.com" className="input" />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <input {...register('password')} type="password" placeholder="Min 8 characters" className="input" />
              {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
            </div>
      
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm mt-6 text-espresso/60">
            Already registered? <Link to="/login" className="text-gold hover:underline font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}