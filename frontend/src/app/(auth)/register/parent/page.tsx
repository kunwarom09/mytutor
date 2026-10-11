'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  BookOpen, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';

export default function RegisterParentPage() {
  const router = useRouter();
  const { registerParent, socialLogin } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[e.target.name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await registerParent(formData);
      router.push('/parent/requests');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check the fields below.');
      if (err.errors) {
        setFieldErrors(err.errors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialMock = async (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    setError(null);
    try {
      const mockId = `${provider}_parent_${Date.now()}`;
      const mockEmail = `${provider}.parent@example.com`;
      const mockName = provider === 'google' ? 'Google Parent' : 'Facebook Parent';
      await socialLogin(provider, mockId, mockEmail, mockName);
      router.push('/parent/requests');
    } catch (err: any) {
      setError(err.message || 'Social sign-up failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#f7f9fc]">
      <div className="max-w-md w-full space-y-8 card-theme p-8 sm:p-10 shadow-lg">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-[#dbe8ff] border border-[#b8d2ff] rounded-2xl flex items-center justify-center text-[#0a5cff] shadow-xs mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="font-heading text-3xl font-extrabold text-[#111318] tracking-tight">
            Create Parent Account
          </h2>
          <p className="mt-2 text-sm text-[#5b6270]">
            Find the right tutor for your child or post a custom tuition request
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Social Quick Sign-Up */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSocialMock('google')}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-full border border-[#e8ecf2] bg-white hover:bg-[#f7f9fc] text-[#111318] text-sm font-semibold transition-colors disabled:opacity-60 shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Google
          </button>

          <button
            type="button"
            onClick={() => handleSocialMock('facebook')}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-full border border-[#e8ecf2] bg-white hover:bg-[#f7f9fc] text-[#111318] text-sm font-semibold transition-colors disabled:opacity-60 shadow-2xs"
          >
            <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </button>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e8ecf2]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-[#5b6270] font-medium tracking-wider">
              Or sign up with email
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#111318] mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Sunita Maharjan"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#e8ecf2] focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] transition-all text-sm font-medium"
              />
            </div>
            {fieldErrors.name && (
              <p className="text-xs text-rose-600 mt-1">{fieldErrors.name[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111318] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="sunita@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#e8ecf2] focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] transition-all text-sm font-medium"
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-rose-600 mt-1">{fieldErrors.email[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111318] mb-1.5">
              Phone Number <span className="text-[#5b6270] font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+977-98XXXXXXXX"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#e8ecf2] focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111318] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full pl-11 pr-11 py-3 rounded-xl border border-[#e8ecf2] focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] transition-all text-sm font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-rose-600 mt-1">{fieldErrors.password[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111318] mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirm_password"
                required
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#e8ecf2] focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] transition-all text-sm font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-pill-blue w-full mt-2 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Create Parent Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-sm text-[#5b6270] pt-2">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-[#0a5cff] hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
