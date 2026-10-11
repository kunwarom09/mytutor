'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  DollarSign, 
  MessageSquare, 
  Send, 
  Sparkles, 
  ArrowRight, 
  AlertCircle 
} from 'lucide-react';

interface TeacherApp {
  application_id: number;
  message: string;
  proposed_rate: number | string | null;
  application_status: 'applied' | 'shortlisted' | 'rejected' | 'hired';
  created_at: string;
  request_id: number;
  child_name: string;
  grade_level: string;
  subjects: string;
  location_city: string;
  location_area: string;
  mode: string;
  schedule_days: string;
  schedule_time: string;
  budget_min: number | string;
  budget_max: number | string;
  request_status: string;
  parent_id: number;
  parent_name: string;
}

export default function TeacherApplicationsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [applications, setApplications] = useState<TeacherApp[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadApplications() {
      setIsLoading(true);
      try {
        const res = await api.get<{ applications: TeacherApp[] }>('/teacher/my-applications');
        if (res.data?.applications) {
          setApplications(res.data.applications);
        }
      } catch (err: any) {
        if (err.status === 401 || err.status === 403) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadApplications();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f7f9fc] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-12 left-10 w-72 h-72 rounded-full bg-[#dbe8ff]/30 blur-3xl pointer-events-none" />
      <div className="absolute top-96 right-10 w-64 h-64 rounded-full bg-[#fff1a8]/30 blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="eyebrow-label block mb-1">
              PROPOSAL TRACKER
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111318] tracking-tight font-heading">
              My Job Applications
            </h1>
            <p className="text-sm text-[#5b6270] mt-1.5 font-sans">
              Track the status of your applications to open parent tutor requests.
            </p>
          </div>

          <Link
            href="/requests"
            className="btn-pill-yellow self-start sm:self-auto flex items-center gap-1.5"
          >
            <Briefcase className="w-4 h-4" />
            Browse New Requests
          </Link>
        </div>

        {/* Applications List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 card-theme animate-pulse p-6" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="card-theme p-12 text-center max-w-md mx-auto space-y-4 bg-white">
            <div className="w-16 h-16 rounded-2xl bg-[#dbe8ff] text-[#0a5cff] flex items-center justify-center mx-auto">
              <Send className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#111318] font-heading">No applications submitted</h3>
            <p className="text-sm text-[#5b6270]">
              You haven&apos;t applied to any tutor requests yet. Browse open opportunities to find students.
            </p>
            <Link
              href="/requests"
              className="btn-pill-yellow inline-flex items-center gap-2"
            >
              Browse Open Opportunities
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.application_id}
                className={`card-theme p-6 sm:p-7 bg-white transition-all space-y-4 ${
                  app.application_status === 'hired'
                    ? '!border-[#0a5cff] ring-2 ring-[#0a5cff]/20'
                    : ''
                }`}
              >
                {/* Status Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold text-[#111318] font-heading">
                        {app.subjects}
                      </h2>
                      <span className="px-3 py-1 rounded-full bg-[#dbe8ff] text-[#0a5cff] text-xs font-bold">
                        {app.grade_level}
                      </span>
                    </div>
                    <p className="text-xs text-[#5b6270]">
                      Parent: <strong className="text-[#111318]">{app.parent_name}</strong> • Student: {app.child_name} • Location: {app.location_city} ({app.location_area})
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {app.application_status === 'hired' && (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#d9f5c9] text-[#1e6b22] text-xs font-black shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-[#1e6b22]" />
                        HIRED &amp; CONFIRMED
                      </span>
                    )}
                    {app.application_status === 'shortlisted' && (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#fff1a8] text-[#8a6500] text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#8a6500]" />
                        Shortlisted by Parent
                      </span>
                    )}
                    {app.application_status === 'applied' && (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#dbe8ff] text-[#0a5cff] text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5 text-[#0a5cff]" />
                        Application Submitted
                      </span>
                    )}
                    {app.application_status === 'rejected' && (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold">
                        Not Selected
                      </span>
                    )}
                  </div>
                </div>

                {/* Proposal Snippet */}
                <div className="bg-[#f7f9fc] p-4 rounded-xl border border-[#e8ecf2] space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-[#5b6270] font-semibold">
                    <span className="text-[#111318]">Your Proposal:</span>
                    {app.proposed_rate && (
                      <span className="text-[#0a5cff] font-bold font-heading">
                        Proposed Fee: Rs. {Math.round(Number(app.proposed_rate))} / month
                      </span>
                    )}
                  </div>
                  <p className="text-[#5b6270] italic">
                    &ldquo;{app.message}&rdquo;
                  </p>
                </div>

                {/* Bottom Row */}
                <div className="pt-3 border-t border-[#e8ecf2] flex items-center justify-between text-xs">
                  <span className="text-[#5b6270]">
                    Applied on {new Date(app.created_at).toLocaleDateString()}
                  </span>

                  <Link
                    href={`/messages?parent_id=${app.parent_id}`}
                    className="btn-pill-blue !py-2 !px-4 !text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Message Parent
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
