'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Users,
  GraduationCap,
  FileText,
  MessageSquare,
  Clock,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface DashboardStats {
  total_teachers: number;
  total_parents: number;
  open_tutor_requests: number;
  total_messages_today: number;
  pending_verifications: number;
}

interface LocationCount {
  location_city: string;
  count: number;
}

interface ClickDay {
  date: string;
  clicks: number;
  views: number;
  actions: number;
}

interface NewTeacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  qualification: string;
  experience_years: number;
  verification_status: 'pending' | 'approved' | 'rejected';
  location_city: string;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [locations, setLocations] = useState<LocationCount[]>([]);
  const [clicks7Days, setClicks7Days] = useState<ClickDay[]>([]);
  const [newestTeachers, setNewestTeachers] = useState<NewTeacher[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/dashboard');
      if (res.success && res.data) {
        setStats(res.data.stats);
        setLocations(res.data.location_breakdown || []);
        setClicks7Days(res.data.clicks_7_days || []);
        setNewestTeachers(res.data.newest_teachers || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Synthesizing platform analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-rose-600" />
          <span>{error}</span>
        </div>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const totalTeachersInLocations = locations.reduce((acc, loc) => acc + Number(loc.count), 0) || 1;
  const maxClicks = Math.max(...clicks7Days.map(d => Number(d.clicks) || 0), 10);

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Top Welcome & Refresh bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#111318] tracking-tight">Admin Intelligence Overview</h1>
          <p className="text-sm text-[#5b6270]">
            Real-time platform metrics, verification queue, and engagement metrics across Nepal.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboard}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#e8ecf2] hover:bg-[#f7f9fc] text-[#111318] rounded-full text-sm font-medium transition-colors shadow-2xs"
          >
            <RefreshCw className="w-4 h-4 text-[#5b6270]" />
            Refresh Data
          </button>
          {stats && stats.pending_verifications > 0 && (
            <Link
              href="/admin/teachers?status=pending"
              className="btn-pill-yellow inline-flex items-center gap-2 px-4 py-2 text-sm font-bold"
            >
              <Clock className="w-4 h-4" />
              Review {stats.pending_verifications} Pending
            </Link>
          )}
        </div>
      </div>

      {/* 5 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Total Teachers */}
        <div className="card-theme p-5 relative overflow-hidden group hover:border-[#0a5cff]/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="eyebrow-label text-slate-400">Tutors</span>
            <div className="w-9 h-9 rounded-xl bg-[#dbe8ff] text-[#0a5cff] flex items-center justify-center border border-[#b8d2ff]">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-heading text-[#111318] tracking-tight">
            {stats?.total_teachers ?? 0}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-[#5b6270]">Registered teachers</span>
            <Link href="/admin/teachers" className="text-[#0a5cff] font-semibold hover:underline flex items-center gap-0.5">
              Manage <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Total Parents */}
        <div className="card-theme p-5 relative overflow-hidden group hover:border-[#0a5cff]/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="eyebrow-label text-slate-400">Parents</span>
            <div className="w-9 h-9 rounded-xl bg-[#c9f3f0] text-[#0d9488] flex items-center justify-center border border-[#a2eae5]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-heading text-[#111318] tracking-tight">
            {stats?.total_parents ?? 0}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-[#5b6270]">Registered families</span>
            <Link href="/admin/parents" className="text-[#0a5cff] font-semibold hover:underline flex items-center gap-0.5">
              Directory <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Open Requests */}
        <div className="card-theme p-5 relative overflow-hidden group hover:border-[#0a5cff]/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="eyebrow-label text-slate-400">Open Requests</span>
            <div className="w-9 h-9 rounded-xl bg-[#e8dcff] text-[#7c3aed] flex items-center justify-center border border-[#d3beff]">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-heading text-[#111318] tracking-tight">
            {stats?.open_tutor_requests ?? 0}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-[#5b6270]">Active parent ads</span>
            <Link href="/admin/requests" className="text-[#0a5cff] font-semibold hover:underline flex items-center gap-0.5">
              Moderate <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Messages Today */}
        <div className="card-theme p-5 relative overflow-hidden group hover:border-[#0a5cff]/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="eyebrow-label text-slate-400">Messages Today</span>
            <div className="w-9 h-9 rounded-xl bg-[#d9f5c9] text-[#1e6b20] flex items-center justify-center border border-[#c2eeb0]">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-heading text-[#111318] tracking-tight">
            {stats?.total_messages_today ?? 0}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-[#5b6270]">Daily communications</span>
            <span className="text-[#1e6b20] font-semibold flex items-center gap-0.5">
              Live Flow
            </span>
          </div>
        </div>

        {/* Pending Verifications */}
        <div className={`p-5 rounded-2xl border shadow-sm relative overflow-hidden group transition-all ${
          (stats?.pending_verifications ?? 0) > 0
            ? 'bg-[#fff1a8]/30 border-[#ffd23f] text-[#111318]'
            : 'bg-white border-[#e8ecf2] text-[#111318]'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="eyebrow-label text-[#f26a0f]">Pending Review</span>
            <div className="w-9 h-9 rounded-xl bg-[#fff1a8] text-[#d97706] border border-[#fde68a] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-heading text-[#f26a0f] tracking-tight">
            {stats?.pending_verifications ?? 0}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-[#5b6270]">Awaiting approval</span>
            <Link href="/admin/teachers?status=pending" className="text-[#f26a0f] font-bold hover:underline flex items-center gap-0.5">
              Review <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics Chart & Nepal Regional Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 7-Day Engagement & Clicks Chart */}
        <div className="lg:col-span-2 card-theme p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-heading text-base font-bold text-[#111318] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#0a5cff]" />
                  7-Day Platform Activity Trend
                </h2>
                <p className="text-xs text-[#5b6270] mt-0.5">
                  Daily profile views, interaction clicks, and user applications in Nepal
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-[#0a5cff]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#0a5cff]"></span> Total Clicks
                </span>
                <span className="flex items-center gap-1.5 font-medium text-[#1e6b20]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#22c55e]"></span> Page Views
                </span>
              </div>
            </div>

            {/* SVG Interactive Visual Bar Chart */}
            <div className="space-y-4">
              <div className="h-52 flex items-end justify-between gap-3 pt-6 border-b border-[#e8ecf2] px-2">
                {clicks7Days.map((item, index) => {
                  const clickHeightPct = Math.round((Number(item.clicks) / maxClicks) * 100);
                  const viewHeightPct = Math.round((Number(item.views) / maxClicks) * 100);
                  const displayDate = item.date ? item.date.slice(5) : ''; // e.g. "10-10"

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] py-1 px-2.5 rounded-lg pointer-events-none whitespace-nowrap shadow-lg z-10 font-mono">
                        {item.date}: {item.clicks} clicks / {item.views} views
                      </div>

                      <div className="w-full flex items-end justify-center gap-1.5 h-full">
                        {/* Clicks Bar */}
                        <div
                          style={{ height: `${Math.max(clickHeightPct, 6)}%` }}
                          className="w-1/2 max-w-[24px] bg-[#0a5cff] rounded-t-md group-hover:brightness-110 transition-all"
                        ></div>
                        {/* Views Bar */}
                        <div
                          style={{ height: `${Math.max(viewHeightPct, 4)}%` }}
                          className="w-1/2 max-w-[24px] bg-[#ffd23f] rounded-t-md group-hover:brightness-110 transition-all"
                        ></div>
                      </div>

                      <span className="text-[11px] text-[#5b6270] mt-2 font-mono">
                        {displayDate}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs text-[#5b6270] px-2 pt-1 font-mono">
                <span>Earliest: {clicks7Days[0]?.date || 'N/A'}</span>
                <span>Peak Volume: {maxClicks} actions</span>
                <span>Latest: {clicks7Days[clicks7Days.length - 1]?.date || 'Today'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nepal Location Breakdown */}
        <div className="card-theme p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-heading text-base font-bold text-[#111318] flex items-center gap-2 mb-1">
              <MapPin className="w-5 h-5 text-[#f26a0f]" />
              Teacher Geographic Reach
            </h2>
            <p className="text-xs text-[#5b6270] mb-6">
              Distribution of verified & applicant tutors by city
            </p>

            <div className="space-y-4">
              {locations.map((loc, idx) => {
                const percentage = Math.round((Number(loc.count) / totalTeachersInLocations) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-[#111318]">{loc.location_city || 'Unspecified'}</span>
                      <span className="font-mono text-[#5b6270]">
                        {loc.count} tutors ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#f7f9fc] rounded-full h-2.5 overflow-hidden border border-[#e8ecf2]">
                      <div
                        className="bg-[#0a5cff] h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}

              {locations.length === 0 && (
                <p className="text-xs text-slate-400 py-4 text-center">No location records available.</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#e8ecf2]">
            <Link
              href="/teachers"
              className="w-full py-2.5 px-3 rounded-full border border-[#e8ecf2] hover:bg-[#f7f9fc] text-[#0a5cff] font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
            >
              Explore Public Map & Directory <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* Recent Teachers Queue Table */}
      <div className="card-theme overflow-hidden">
        <div className="p-6 border-b border-[#e8ecf2] flex items-center justify-between">
          <div>
            <h2 className="font-heading text-base font-bold text-[#111318]">Recent Tutor Submissions</h2>
            <p className="text-xs text-[#5b6270] mt-0.5">
              Review credential documents and approve or reject prospective instructors
            </p>
          </div>
          <Link
            href="/admin/teachers"
            className="text-xs font-semibold text-[#0a5cff] hover:underline flex items-center gap-1"
          >
            View All Tutors <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f7f9fc] text-xs font-semibold text-[#5b6270] uppercase tracking-wider border-b border-[#e8ecf2]">
              <tr>
                <th className="px-6 py-3.5">Instructor</th>
                <th className="px-6 py-3.5">City</th>
                <th className="px-6 py-3.5">Qualification & Exp</th>
                <th className="px-6 py-3.5">Verification</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8ecf2]">
              {newestTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-[#f7f9fc]/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-[#111318]">{teacher.name}</div>
                    <div className="text-xs text-[#5b6270]">{teacher.email} &bull; {teacher.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-xs text-[#5b6270] bg-[#f7f9fc] border border-[#e8ecf2] px-2.5 py-1 rounded-full font-medium">
                      <MapPin className="w-3 h-3 text-[#0a5cff]" />
                      {teacher.location_city || 'Nepal'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-medium text-[#111318]">{teacher.qualification || 'Not provided'}</div>
                    <div className="text-xs text-[#5b6270]">{teacher.experience_years} years experience</div>
                  </td>
                  <td className="px-6 py-4">
                    {teacher.verification_status === 'approved' ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#d9f5c9] text-[#1e6b20] border border-[#c2eeb0] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" /> Approved
                      </span>
                    ) : teacher.verification_status === 'rejected' ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" /> Rejected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#fff1a8] text-[#92400e] border border-[#fde68a] font-semibold">
                        <Clock className="w-3.5 h-3.5 text-[#d97706]" /> Pending Review
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/teachers?q=${encodeURIComponent(teacher.name)}`}
                      className="btn-pill-blue inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5"
                    >
                      Inspect Credentials
                    </Link>
                  </td>
                </tr>
              ))}

              {newestTeachers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#5b6270] text-xs">
                    No registered teachers found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
