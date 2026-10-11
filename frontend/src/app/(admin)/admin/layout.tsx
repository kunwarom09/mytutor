'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  FileText,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Loader2
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [pendingCounts, setPendingCounts] = useState<{
    pendingTeachers: number;
    pendingReports: number;
  }>({
    pendingTeachers: 0,
    pendingReports: 0,
  });

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/login?redirect=' + encodeURIComponent(pathname));
    }
  }, [user, isLoading, router, pathname]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      // Fetch badge counts for sidebar
      api.get('/admin/dashboard')
        .then((res) => {
          if (res.data?.stats) {
            setPendingCounts({
              pendingTeachers: res.data.stats.pending_verifications || 0,
              pendingReports: 0,
            });
          }
        })
        .catch(() => {});

      api.get('/admin/reports')
        .then((res) => {
          if (res.data?.reports) {
            const pending = res.data.reports.filter((r: any) => r.status === 'pending').length;
            setPendingCounts(prev => ({ ...prev, pendingReports: pending }));
          }
        })
        .catch(() => {});
    }
  }, [user, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#f7f9fc]">
        <Loader2 className="w-10 h-10 text-[#0a5cff] animate-spin mb-4" />
        <p className="text-[#5b6270] font-medium font-heading">Loading administrative workspace...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-[#e8ecf2] rounded-2xl shadow-sm text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-heading text-[#111318] mb-2">Restricted Access</h2>
        <p className="text-[#5b6270] text-sm mb-6 leading-relaxed">
          This portal is restricted to authorized platform administrators only. Please log in with an administrator account to continue.
        </p>
        <Link
          href="/login"
          className="btn-pill-blue w-full justify-center"
        >
          Sign In as Admin
        </Link>
      </div>
    );
  }

  const navItems = [
    {
      name: 'Overview',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Teacher Verifications',
      href: '/admin/teachers',
      icon: GraduationCap,
      badge: pendingCounts.pendingTeachers > 0 ? pendingCounts.pendingTeachers : null,
      badgeColor: 'bg-[#ffd23f] text-[#111318]',
    },
    {
      name: 'Parents Directory',
      href: '/admin/parents',
      icon: Users,
      badge: null,
    },
    {
      name: 'Tutor Requests',
      href: '/admin/requests',
      icon: FileText,
      badge: null,
    },
    {
      name: 'Reports & Safety',
      href: '/admin/reports',
      icon: AlertTriangle,
      badge: pendingCounts.pendingReports > 0 ? pendingCounts.pendingReports : null,
      badgeColor: 'bg-rose-500 text-white',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f7f9fc] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white text-[#5b6270] flex-shrink-0 flex flex-col border-r border-[#e8ecf2]">
        <div className="p-5 border-b border-[#e8ecf2] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0a5cff] flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-[#111318] text-sm block">Admin Console</span>
              <span className="text-[11px] text-[#0a5cff] font-semibold">Superadmin Active</span>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1.5 flex-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-[#dbe8ff] text-[#0a5cff] shadow-xs'
                    : 'text-[#5b6270] hover:text-[#111318] hover:bg-[#f7f9fc]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-[#0a5cff]' : 'text-[#5b6270]'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      item.badgeColor || 'bg-[#f7f9fc] text-[#111318]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Links & Info footer */}
        <div className="p-4 border-t border-[#e8ecf2] bg-[#f7f9fc]/60">
          <div className="text-[11px] uppercase tracking-wider text-[#5b6270] mb-2 font-bold">Quick Navigation</div>
          <div className="space-y-1">
            <Link
              href="/teachers"
              target="_blank"
              className="flex items-center justify-between text-xs text-[#5b6270] hover:text-[#0a5cff] py-1 transition-colors font-medium"
            >
              <span>Public Teacher Directory</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/requests"
              target="_blank"
              className="flex items-center justify-between text-xs text-[#5b6270] hover:text-[#0a5cff] py-1 transition-colors font-medium"
            >
              <span>Public Requests Board</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 pt-3 border-t border-[#e8ecf2] flex items-center justify-between text-[11px] text-[#5b6270]">
            <span>MyTutor Platform</span>
            <span className="font-mono text-xs">Nepal (NPT)</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#f7f9fc]">
        <header className="bg-white border-b border-[#e8ecf2] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[#5b6270]">
            <span className="font-bold text-[#111318] font-heading">Admin Portal</span>
            <ChevronRight className="w-4 h-4 text-[#e8ecf2]" />
            <span className="text-[#0a5cff] font-semibold capitalize font-heading">
              {pathname.replace('/admin/', '').replace('-', ' ') || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#5b6270]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-[#111318]">API Status: Operational</span>
            </div>
            <span className="text-[#e8ecf2]">|</span>
            <span>Logged in as: <strong className="text-[#111318]">{user.email}</strong></span>
          </div>
        </header>

        <main className="p-6 md:p-8 flex-1 bg-[#f7f9fc]">
          {children}
        </main>
      </div>
    </div>
  );
}
