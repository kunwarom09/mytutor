'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  Users 
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, socialLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await login(email, password);
      redirectByRole(user.role);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError(null);
  };

  const handleSocialMock = async (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    setError(null);
    try {
      const mockId = `${provider}_${Date.now()}`;
      const mockEmail = `${provider}.parent@example.com`;
      const mockName = provider === 'google' ? 'Google Parent User' : 'Facebook Parent User';
      const user = await socialLogin(provider, mockId, mockEmail, mockName);
      redirectByRole(user.role);
    } catch (err: any) {
      setError(err.message || 'Social login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const redirectByRole = (role: string) => {
    if (role === 'admin') {
      router.push('/admin/dashboard');
    } else if (role === 'teacher') {
      router.push('/teacher/opportunities');
    } else {
      router.push('/parent/requests');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#f7f9fc]">
      <div className="max-w-md w-full space-y-8 card-theme p-8 sm:p-10 shadow-lg">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-[#dbe8ff] border border-[#b8d2ff] rounded-2xl flex items-center justify-center text-[#0a5cff] shadow-xs mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="font-heading text-3xl font-extrabold text-[#111318] tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-[#5b6270]">
            Sign in to access your tuition marketplace dashboard
          </p>
        </div>

        {/* Demo Accounts Quick-Fill Pills */}
        <div className="bg-[#f7f9fc] border border-[#e8ecf2] rounded-2xl p-3.5 space-y-2">
          <span className="eyebrow-label block text-center">
            ⚡ Quick Demo Sign-In (Password: Password123!)
          </span>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => handleDemoFill('admin@mytutor.com')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#e8dcff]/50 text-[#5b6270] hover:text-[#7c3aed] border border-[#e8ecf2] font-medium transition-colors text-left"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#7c3aed] shrink-0" />
              <span className="truncate">Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('ramesh.sharma@example.com')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#d9f5c9]/50 text-[#5b6270] hover:text-[#1e6b20] border border-[#e8ecf2] font-medium transition-colors text-left"
            >
              <Users className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
              <span className="truncate">Approved Teacher</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('sandeep.karki@example.com')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#fff1a8]/50 text-[#5b6270] hover:text-[#d97706] border border-[#e8ecf2] font-medium transition-colors text-left"
            >
              <Clock className="w-3.5 h-3.5 text-[#d97706] shrink-0" />
              <span className="truncate">Pending Teacher</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('sunita.maharjan@example.com')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#dbe8ff]/50 text-[#5b6270] hover:text-[#0a5cff] border border-[#e8ecf2] font-medium transition-colors text-left"
            >
              <Users className="w-3.5 h-3.5 text-[#0a5cff] shrink-0" />
              <span className="truncate">Parent</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#111318] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-pill-yellow w-full mt-2 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-[#111318]/30 border-t-[#111318] rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e8ecf2]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-[#5b6270] font-medium tracking-wider">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSocialMock('google')}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-full border border-[#e8ecf2] bg-white hover:bg-[#f7f9fc] text-[#111318] text-sm font-semibold transition-colors disabled:opacity-60 shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
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

        {/* Footer Links */}
        <div className="text-center text-sm text-[#5b6270] pt-2">
          Don&apos;t have an account yet?{' '}
          <Link
            href="/register"
            className="font-bold text-[#0a5cff] hover:underline"
          >
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
}
