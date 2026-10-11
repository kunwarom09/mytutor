'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  Send, 
  Users, 
  CheckCircle2, 
  X, 
  Home, 
  Globe, 
  AlertCircle, 
  ShieldAlert 
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

export default function TeacherOpportunitiesPage() {
  const { user } = useAuth();

  const [requests, setRequests] = useState<TutorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [location, setLocation] = useState('all');

  // Application Modal state
  const [selectedRequest, setSelectedRequest] = useState<TutorRequest | null>(null);
  const [applyMessage, setApplyMessage] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  const fetchOpportunities = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (subject) params.append('subject', subject);
      if (location && location !== 'all') params.append('location_city', location);
      params.append('status', 'open');

      const res = await api.get<{ requests: TutorRequest[] }>(`/requests?${params.toString()}`);
      if (res.data?.requests) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      console.error('Failed to load opportunities:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, subject, location]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleOpenApply = (req: TutorRequest) => {
    if (user?.verification_status !== 'approved') {
      alert('Your teacher profile is pending document verification by an administrator. You will be able to apply once verified.');
      return;
    }

    setSelectedRequest(req);
    setApplyMessage(`Namaste ${req.parent_name}, I have verified experience teaching ${req.subjects} and would be delighted to mentor ${req.child_name}.`);
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

      setApplySuccess('Application sent successfully!');
      setTimeout(() => {
        setSelectedRequest(null);
        fetchOpportunities();
      }, 1500);
    } catch (err: any) {
      setApplyError(err.message || 'Failed to submit application.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-12 left-10 w-72 h-72 rounded-full bg-[#dbe8ff]/30 blur-3xl pointer-events-none" />
      <div className="absolute top-96 right-10 w-64 h-64 rounded-full bg-[#fff1a8]/30 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="eyebrow-label block mb-1">
              TEACHING JOBS
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111318] tracking-tight font-heading">
              Teaching Opportunities
            </h1>
            <p className="text-sm text-[#5b6270] mt-1.5 font-sans">
              Browse open tuition requests from parents and apply directly with your teaching proposal.
            </p>
          </div>

          <Link
            href="/teacher/applications"
            className="px-5 py-2.5 rounded-full bg-white border border-[#e8ecf2] text-[#111318] hover:bg-[#f7f9fc] font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto transition-all shadow-sm"
          >
            Track My Applications →
          </Link>
        </div>

        {/* Pending Verification Notice */}
        {user?.verification_status !== 'approved' && (
          <div className="p-4 rounded-2xl bg-[#fff1a8]/60 border border-[#ffd23f] flex items-start gap-3 text-[#111318] text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 text-[#f26a0f] shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-[#111318]">Account Status: Pending Document Verification</strong>
              You can browse current requests, but applying unlocks once our administration team verifies your uploaded ID document.
            </div>
          </div>
        )}

        {/* Filter controls */}
        <div className="card-theme p-4 flex flex-col sm:flex-row gap-3 bg-white">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#5b6270]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by subject or area..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full border border-[#e8ecf2] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] bg-[#f7f9fc] focus:bg-white transition-all"
            />
          </div>

          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-[#e8ecf2] text-xs sm:text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] transition-all"
          >
            <option value="all">City: All Cities</option>
            <option value="Kathmandu">Kathmandu</option>
            <option value="Lalitpur">Lalitpur</option>
            <option value="Bhaktapur">Bhaktapur</option>
            <option value="Pokhara">Pokhara</option>
          </select>
        </div>

        {/* Requests Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-60 card-theme animate-pulse p-6" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="card-theme p-12 text-center max-w-md mx-auto space-y-3 bg-white">
            <div className="w-16 h-16 rounded-2xl bg-[#dbe8ff] text-[#0a5cff] flex items-center justify-center mx-auto">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#111318] font-heading">No open opportunities found</h3>
            <p className="text-sm text-[#5b6270]">
              There are currently no open tutor requests matching your search. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map((req) => (
              <div
                key={req.id}
                className="card-theme p-6 sm:p-7 hover:border-[#0a5cff]/30 transition-all flex flex-col justify-between space-y-5 bg-white"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-bold text-[#111318] font-heading">
                          {req.subjects}
                        </h2>
                        <span className="px-3 py-1 rounded-full bg-[#dbe8ff] text-[#0a5cff] text-xs font-bold">
                          {req.grade_level}
                        </span>
                      </div>
                      <p className="text-xs text-[#5b6270] mt-1">
                        Student: <strong className="text-[#111318]">{req.child_name}</strong> • Parent: {req.parent_name}
                      </p>
                    </div>

                    <span className="text-xs font-bold text-[#5b6270] bg-[#f1f3f7] px-3 py-1 rounded-full shrink-0">
                      {req.applicants_count} Applied
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="flex items-center gap-2 text-[#5b6270] bg-[#f7f9fc] p-2.5 rounded-xl border border-[#e8ecf2]">
                      <div className="w-6 h-6 rounded-lg bg-[#dbe8ff] flex items-center justify-center shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-[#0a5cff]" />
                      </div>
                      <span className="truncate">{req.location_city}, {req.location_area}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[#5b6270] bg-[#f7f9fc] p-2.5 rounded-xl border border-[#e8ecf2]">
                      <div className="w-6 h-6 rounded-lg bg-[#c9f3f0] flex items-center justify-center shrink-0">
                        {req.mode === 'home' ? <Home className="w-3.5 h-3.5 text-[#0a8075]" /> : <Globe className="w-3.5 h-3.5 text-[#0a8075]" />}
                      </div>
                      <span className="capitalize">{req.mode} Tuition</span>
                    </div>

                    <div className="flex items-center gap-2 text-[#5b6270] bg-[#f7f9fc] p-2.5 rounded-xl border border-[#e8ecf2]">
                      <div className="w-6 h-6 rounded-lg bg-[#fff1a8] flex items-center justify-center shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-[#b28200]" />
                      </div>
                      <span className="truncate">{req.schedule_days}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[#5b6270] bg-[#f7f9fc] p-2.5 rounded-xl border border-[#e8ecf2]">
                      <div className="w-6 h-6 rounded-lg bg-[#ffe3d1] flex items-center justify-center shrink-0">
                        <Clock className="w-3.5 h-3.5 text-[#f26a0f]" />
                      </div>
                      <span className="truncate">{req.schedule_time}</span>
                    </div>
                  </div>

                  {req.additional_notes && (
                    <p className="text-xs text-[#5b6270] italic bg-[#f7f9fc] p-3 rounded-xl border border-[#e8ecf2]">
                      &ldquo;{req.additional_notes}&rdquo;
                    </p>
                  )}

                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-[#5b6270] uppercase tracking-wider block">
                      Parent Budget:
                    </span>
                    <span className="text-lg font-extrabold text-[#0a5cff] font-heading">
                      Rs. {Math.round(Number(req.budget_min))} - {Math.round(Number(req.budget_max))} / mo
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#e8ecf2]">
                  {req.has_applied ? (
                    <div className="w-full py-2.5 px-4 rounded-full bg-[#d9f5c9] text-[#1e6b22] text-xs font-bold text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#1e6b22]" />
                      <span>Applied (Status: {req.my_application_status})</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenApply(req)}
                      className="btn-pill-yellow w-full py-2.5 px-4 text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Apply for this Opportunity
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Apply Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111318]/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-[#e8ecf2] space-y-6 relative">
            
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute right-5 top-5 p-2 text-[#5b6270] hover:text-[#111318] rounded-full hover:bg-[#f7f9fc]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="eyebrow-label block mb-1">
                APPLICATION
              </span>
              <span className="text-xs font-bold text-[#0a5cff] uppercase tracking-wider">
                Submit Teaching Proposal
              </span>
              <h2 className="text-2xl font-bold text-[#111318] font-heading mt-1">
                {selectedRequest.subjects} ({selectedRequest.grade_level})
              </h2>
              <p className="text-xs text-[#5b6270] mt-0.5">
                Parent: {selectedRequest.parent_name} • {selectedRequest.location_city} ({selectedRequest.location_area})
              </p>
            </div>

            {applySuccess && (
              <div className="p-4 rounded-xl bg-[#d9f5c9] border border-[#b2e896] text-[#1e6b22] text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#1e6b22] shrink-0" />
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
                <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1.5">
                  Proposed Monthly Fee (NPR)
                </label>
                <input
                  type="number"
                  required
                  value={proposedRate}
                  onChange={(e) => setProposedRate(e.target.value)}
                  placeholder="e.g. 8500"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] bg-white transition-all"
                />
                <span className="text-[11px] text-[#5b6270] mt-1 block">
                  Parent Budget Range: Rs. {Math.round(Number(selectedRequest.budget_min))} - {Math.round(Number(selectedRequest.budget_max))}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1.5">
                  Proposal Message to Parent *
                </label>
                <textarea
                  required
                  rows={4}
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  placeholder="Introduce yourself, your relevant teaching experience in these subjects, and how you will help the student..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] bg-white transition-all"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 py-3 px-4 rounded-full border border-[#e8ecf2] text-[#5b6270] font-bold text-sm hover:bg-[#f7f9fc] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApplying || Boolean(applySuccess)}
                  className="btn-pill-blue flex-1 py-3 px-4 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
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
