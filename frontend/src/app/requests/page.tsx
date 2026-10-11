'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  BookOpen, 
  Send, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  RotateCcw, 
  Home, 
  Globe, 
  Sparkles 
} from 'lucide-react';

interface TutorRequest {
  id: number;
  child_name: string;
  grade_level: string;
  subjects: string;
  location_city: string;
  location_area: string;
  mode: 'home' | 'online' | 'both';
  schedule_days: string;
  schedule_time: string;
  budget_min: number | string;
  budget_max: number | string;
  additional_notes?: string | null;
  status: 'open' | 'in_progress' | 'closed';
  applicants_count: number;
  parent_name: string;
  created_at: string;
  has_applied?: boolean;
  my_application_status?: string | null;
}

export default function RequestsDirectoryPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [requests, setRequests] = useState<TutorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [location, setLocation] = useState('all');
  const [mode, setMode] = useState('all');
  const [statusFilter, setStatusFilter] = useState('open');

  // Application Modal state
  const [selectedRequest, setSelectedRequest] = useState<TutorRequest | null>(null);
  const [applyMessage, setApplyMessage] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (subject) params.append('subject', subject);
      if (location && location !== 'all') params.append('location_city', location);
      if (mode && mode !== 'all') params.append('mode', mode);
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get<{ requests: TutorRequest[] }>(`/requests?${params.toString()}`);
      if (res.data?.requests) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, subject, location, mode, statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleOpenApplyModal = (req: TutorRequest) => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'teacher') {
      alert('Only registered teachers can apply to tutor requests.');
      return;
    }

    if (user.verification_status !== 'approved') {
      alert('Your teacher profile is pending document verification. You can apply once an admin approves your document.');
      return;
    }

    setSelectedRequest(req);
    setApplyMessage(`Namaste ${req.parent_name}, I have relevant teaching experience in ${req.subjects} and would be glad to guide ${req.child_name}.`);
    setProposedRate(String(Math.round(Number(req.budget_min) || 0)));
    setApplyError(null);
    setApplySuccess(null);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setIsApplying(true);
    setApplyError(null);

    try {
      await api.post(`/requests/${selectedRequest.id}/apply`, {
        message: applyMessage,
        proposed_rate: proposedRate ? Number(proposedRate) : null,
      });

      setApplySuccess('Application submitted successfully!');
      setTimeout(() => {
        setSelectedRequest(null);
        fetchRequests();
      }, 1500);
    } catch (err: any) {
      setApplyError(err.message || 'Failed to submit application.');
    } finally {
      setIsApplying(false);
    }
  };

  const subjectsList = ['Mathematics', 'Science', 'Physics', 'Chemistry', 'English', 'Computer Science'];

  return (
    <div className="min-h-screen bg-[#f7f9fc] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="mb-2">
              <span className="eyebrow-label">
                Parent Tuition Job Postings
              </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#111318] tracking-tight">
              Tutor Requests &amp; Opportunities
            </h1>
            <p className="text-[#5b6270] text-sm sm:text-base mt-1">
              Browse tuition opportunities posted by parents across Kathmandu, Lalitpur, and Pokhara.
            </p>
          </div>

          {user?.role === 'parent' && (
            <Link
              href="/parent/requests/create"
              className="btn-pill-blue self-start md:self-auto text-sm"
            >
              + Post a New Request
            </Link>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="card-theme p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by subject, grade level, or area..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm text-[#111318] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff]"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* City */}
            <div>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#e8ecf2] text-sm bg-white text-[#111318] font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff]"
              >
                <option value="all">City: All Locations</option>
                <option value="Kathmandu">Kathmandu</option>
                <option value="Lalitpur">Lalitpur</option>
                <option value="Bhaktapur">Bhaktapur</option>
                <option value="Pokhara">Pokhara</option>
              </select>
            </div>

            {/* Tuition Mode */}
            <div>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#e8ecf2] text-sm bg-white text-[#111318] font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff]"
              >
                <option value="all">Mode: Home &amp; Online</option>
                <option value="home">Home Tuition</option>
                <option value="online">Online Tuition</option>
                <option value="both">Both</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#e8ecf2] text-sm bg-white text-[#111318] font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff]"
              >
                <option value="open">Status: Open Only</option>
                <option value="in_progress">In Progress</option>
                <option value="all">All Requests</option>
              </select>
            </div>
          </div>

          {/* Quick Subject Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#e8ecf2] text-xs">
            <span className="text-[#5b6270] font-bold uppercase tracking-wider mr-1">
              Subjects:
            </span>
            <button
              onClick={() => setSubject('')}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                subject === ''
                  ? 'bg-[#0a5cff] text-white shadow-xs'
                  : 'bg-[#f7f9fc] border border-[#e8ecf2] text-[#5b6270] hover:bg-[#e8ecf2]'
              }`}
            >
              All
            </button>
            {subjectsList.map((sub) => (
              <button
                key={sub}
                onClick={() => setSubject(sub === subject ? '' : sub)}
                className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                  subject === sub
                    ? 'bg-[#0a5cff] text-white shadow-xs'
                    : 'bg-[#f7f9fc] border border-[#e8ecf2] text-[#5b6270] hover:bg-[#e8ecf2]'
                }`}
              >
                {sub}
              </button>
            ))}

            {(search || subject || (location && location !== 'all') || (mode && mode !== 'all')) && (
              <button
                onClick={() => {
                  setSearch('');
                  setSubject('');
                  setLocation('all');
                  setMode('all');
                  setStatusFilter('open');
                }}
                className="ml-auto flex items-center gap-1 text-[#f26a0f] hover:text-[#ea580c] font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Requests Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-64 bg-white rounded-2xl border border-[#e8ecf2] animate-pulse p-6 space-y-4"
              />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="card-theme p-12 text-center max-w-md mx-auto space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold font-heading text-[#111318]">No requests found</h3>
            <p className="text-sm text-[#5b6270]">
              There are currently no tutor requests matching your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map((req) => (
              <div
                key={req.id}
                className="card-theme p-6 sm:p-7 hover:shadow-[0_8px_30px_rgba(20,40,90,0.09)] transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  
                  {/* Top: Subjects & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg font-bold font-heading text-[#111318]">
                          {req.subjects}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#dbe8ff] text-[#0a5cff] text-xs font-bold border border-[#b8d2ff]">
                          {req.grade_level}
                        </span>
                      </div>
                      <p className="text-xs text-[#5b6270]">
                        For student: <strong className="text-[#111318]">{req.child_name}</strong> (Posted by {req.parent_name})
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {req.status === 'open' && (
                        <span className="px-3 py-1 rounded-full bg-[#d9f5c9] text-[#1e6b20] text-xs font-bold border border-[#c2eeb0] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping" />
                          Open
                        </span>
                      )}
                      {req.status === 'in_progress' && (
                        <span className="px-3 py-1 rounded-full bg-[#dbe8ff] text-[#0a5cff] text-xs font-bold border border-[#b8d2ff]">
                          In Progress
                        </span>
                      )}
                      {req.status === 'closed' && (
                        <span className="px-3 py-1 rounded-full bg-[#f1f4f9] text-[#5b6270] text-xs font-bold border border-[#e8ecf2]">
                          Closed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[#5b6270] bg-[#f7f9fc] p-2.5 rounded-xl border border-[#e8ecf2]">
                      <MapPin className="w-3.5 h-3.5 text-[#0a5cff] shrink-0" />
                      <span className="truncate">{req.location_city}, {req.location_area}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[#5b6270] bg-[#f7f9fc] p-2.5 rounded-xl border border-[#e8ecf2]">
                      {req.mode === 'home' ? (
                        <>
                          <Home className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
                          <span>Home Tuition</span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-3.5 h-3.5 text-[#0a5cff] shrink-0" />
                          <span>Online Classes</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[#5b6270] bg-[#f7f9fc] p-2.5 rounded-xl border border-[#e8ecf2]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{req.schedule_days}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[#5b6270] bg-[#f7f9fc] p-2.5 rounded-xl border border-[#e8ecf2]">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{req.schedule_time}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {req.additional_notes && (
                    <p className="text-xs text-[#5b6270] bg-[#fff1a8]/30 p-3 rounded-xl border border-[#ffe3d1] leading-relaxed italic">
                      &ldquo;{req.additional_notes}&rdquo;
                    </p>
                  )}

                  {/* Budget & Applicants */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-[11px] font-bold text-[#5b6270] uppercase tracking-wider block">
                        Monthly Budget:
                      </span>
                      <span className="text-base font-extrabold text-[#0a5cff]">
                        Rs. {Math.round(Number(req.budget_min))} - {Math.round(Number(req.budget_max))}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5b6270] bg-[#f7f9fc] px-3 py-1.5 rounded-full border border-[#e8ecf2]">
                      <Users className="w-3.5 h-3.5 text-[#0a5cff]" />
                      <span>{req.applicants_count} Applicants</span>
                    </div>
                  </div>

                </div>

                {/* Bottom CTA */}
                <div className="pt-4 border-t border-[#e8ecf2] flex items-center justify-between gap-3">
                  {req.has_applied ? (
                    <div className="w-full py-2.5 px-4 rounded-full bg-[#d9f5c9] text-[#1e6b20] text-xs font-bold text-center flex items-center justify-center gap-1.5 border border-[#c2eeb0]">
                      <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                      <span>Applied (Status: {req.my_application_status})</span>
                    </div>
                  ) : req.status === 'open' ? (
                    <button
                      onClick={() => handleOpenApplyModal(req)}
                      className="btn-pill-yellow w-full py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Apply for this Opportunity
                    </button>
                  ) : (
                    <span className="w-full py-2.5 px-4 rounded-full bg-[#f1f4f9] text-[#5b6270] text-xs font-medium text-center">
                      Request is no longer accepting applications
                    </span>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Apply Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="card-theme max-w-lg w-full p-8 shadow-2xl relative space-y-6">
            
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute right-5 top-5 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="eyebrow-label">
                Submit Teaching Proposal
              </span>
              <h2 className="text-xl font-bold font-heading text-[#111318] mt-1">
                {selectedRequest.subjects} ({selectedRequest.grade_level})
              </h2>
              <p className="text-xs text-[#5b6270] mt-0.5">
                Parent: {selectedRequest.parent_name} • {selectedRequest.location_city}
              </p>
            </div>

            {applySuccess && (
              <div className="p-4 rounded-xl bg-[#d9f5c9] border border-[#c2eeb0] text-[#1e6b20] text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0" />
                <span>{applySuccess}</span>
              </div>
            )}

            {applyError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{applyError}</span>
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#111318] uppercase tracking-wider mb-1">
                  Proposed Monthly Fee (NPR)
                </label>
                <input
                  type="number"
                  required
                  value={proposedRate}
                  onChange={(e) => setProposedRate(e.target.value)}
                  placeholder="e.g. 8000"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm text-[#111318] font-medium focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff]"
                />
                <span className="text-[11px] text-[#5b6270] mt-1 block">
                  Parent Budget Range: Rs. {Math.round(Number(selectedRequest.budget_min))} - {Math.round(Number(selectedRequest.budget_max))}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111318] uppercase tracking-wider mb-1">
                  Proposal Message to Parent *
                </label>
                <textarea
                  required
                  rows={4}
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  placeholder="Introduce yourself, your relevant teaching experience in these subjects, and how you will help the student..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm text-[#111318] font-medium focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff]"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 py-2.5 px-4 rounded-full border border-[#e8ecf2] text-[#5b6270] font-semibold text-sm hover:bg-[#f7f9fc] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApplying || Boolean(applySuccess)}
                  className="btn-pill-blue flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isApplying ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Proposal
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
