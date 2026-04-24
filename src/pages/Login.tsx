import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
type F = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: F) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      const { accessToken, user } = res.data.data;
      login(accessToken, user);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-espresso flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl text-cream-100 tracking-wider">✦ Salon</h1>
          <p className="text-cream-200/50 text-sm mt-2 tracking-widest uppercase">Sign in to your account</p>
        </div>
        <div className="bg-cream-50 rounded-xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input {...register('email')} type="email" placeholder="you@example.com" className="input" />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <input {...register('password')} type="password" placeholder="••••••••" className="input" />
              {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm mt-6 text-espresso/60">
            No account? <Link to="/register" className="text-gold hover:underline font-semibold">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}