'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { 
  PlusCircle, 
  Users, 
  MapPin, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  MessageSquare, 
  Award, 
  X, 
  BookOpen, 
  UserCheck, 
  Home, 
  Globe 
} from 'lucide-react';

interface ParentRequest {
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
  status: 'open' | 'in_progress' | 'closed';
  applicants_count: number;
  shortlisted_count: number;
  hired_teacher_name?: string | null;
  created_at: string;
}

interface Applicant {
  application_id: number;
  message: string;
  proposed_rate: number | string | null;
  application_status: 'applied' | 'shortlisted' | 'rejected' | 'hired';
  created_at: string;
  teacher_id: number;
  teacher_name: string;
  teacher_email: string;
  teacher_phone: string;
  qualification: string;
  experience: string;
  experience_years: number;
  hourly_rate?: number | string | null;
  location_city: string;
  verification_status: string;
}

export default function ParentRequestsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [requests, setRequests] = useState<ParentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Applicants Modal state
  const [activeRequest, setActiveRequest] = useState<ParentRequest | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchMyRequests = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ requests: ParentRequest[] }>('/parent/my-requests');
      if (res.data?.requests) {
        setRequests(res.data.requests);
      }
    } catch (err: any) {
      if (err.status === 401 || err.status === 403) {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const handleOpenApplicants = async (req: ParentRequest) => {
    setActiveRequest(req);
    setIsLoadingApplicants(true);
    setStatusMessage(null);
    try {
      const res = await api.get<{ applicants: Applicant[] }>(`/requests/${req.id}/applicants`);
      if (res.data?.applicants) {
        setApplicants(res.data.applicants);
      }
    } catch (err) {
      console.error('Failed to load applicants:', err);
    } finally {
      setIsLoadingApplicants(false);
    }
  };

  const handleUpdateApplicantStatus = async (appId: number, newStatus: 'shortlisted' | 'hired' | 'rejected') => {
    try {
      await api.patch(`/applications/${appId}/status`, { status: newStatus });
      setStatusMessage(`Applicant marked as ${newStatus}!`);

      // Refresh applicants list
      setApplicants((prev) =>
        prev.map((a) => (a.application_id === appId ? { ...a, application_status: newStatus } : a))
      );

      // Refresh parent requests to update status
      fetchMyRequests();

      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update applicant status.');
    }
  };

  const handleCloseRequest = async (id: number) => {
    if (!confirm('Are you sure you want to close this request? No more teachers will be able to apply.')) return;
    try {
      await api.patch(`/requests/${id}/close`);
      fetchMyRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to close request.');
    }
  };

  const handleDeleteRequest = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this request?')) return;
    try {
      await api.delete(`/requests/${id}`);
      fetchMyRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to delete request.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-12 left-10 w-64 h-64 rounded-full bg-[#dbe8ff]/40 blur-3xl pointer-events-none" />
      <div className="absolute top-96 right-10 w-72 h-72 rounded-full bg-[#fff1a8]/30 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="eyebrow-label block mb-1">
              TUITION MANAGEMENT
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111318] tracking-tight font-heading">
              My Tutor Requests
            </h1>
            <p className="text-sm text-[#5b6270] mt-1.5 font-sans">
              Manage your tuition job postings, review applicants, shortlist, and hire tutors.
            </p>
          </div>

          <Link
            href="/parent/requests/create"
            className="btn-pill-blue self-start sm:self-auto flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Post a New Request
          </Link>
        </div>

        {/* Requests List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 card-theme animate-pulse p-6" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="card-theme p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#dbe8ff] text-[#0a5cff] flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#111318] font-heading">No requests posted yet</h3>
            <p className="text-sm text-[#5b6270]">
              Create your first tutor request to start receiving proposals from verified tuition teachers.
            </p>
            <Link
              href="/parent/requests/create"
              className="btn-pill-yellow inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Post a Tutor Request
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {requests.map((req) => (
              <div
                key={req.id}
                className="card-theme p-6 sm:p-7 space-y-5 hover:border-[#0a5cff]/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-xl font-bold text-[#111318] font-heading">
                        {req.subjects}
                      </h2>
                      <span className="px-3 py-1 rounded-full bg-[#dbe8ff] text-[#0a5cff] text-xs font-bold">
                        {req.grade_level}
                      </span>
                      {req.status === 'open' && (
                        <span className="px-3 py-1 rounded-full bg-[#d9f5c9] text-[#1e6b22] text-xs font-bold">
                          Open
                        </span>
                      )}
                      {req.status === 'in_progress' && (
                        <span className="px-3 py-1 rounded-full bg-[#dbe8ff] text-[#0a5cff] text-xs font-bold">
                          In Progress (Hired: {req.hired_teacher_name})
                        </span>
                      )}
                      {req.status === 'closed' && (
                        <span className="px-3 py-1 rounded-full bg-[#f1f3f7] text-[#5b6270] text-xs font-bold">
                          Closed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#5b6270] mt-1.5">
                      Student: <strong className="text-[#111318]">{req.child_name}</strong> • Posted on {new Date(req.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-[#5b6270] font-semibold block">Monthly Budget:</span>
                    <span className="text-xl font-extrabold text-[#0a5cff] font-heading">
                      Rs. {Math.round(Number(req.budget_min))} - {Math.round(Number(req.budget_max))}
                    </span>
                  </div>
                </div>

                {/* Details Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="flex items-center gap-2 text-[#5b6270] bg-[#f7f9fc] p-3 rounded-xl border border-[#e8ecf2]">
                    <div className="w-6 h-6 rounded-lg bg-[#dbe8ff] flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-[#0a5cff]" />
                    </div>
                    <span className="truncate">{req.location_city}, {req.location_area}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#5b6270] bg-[#f7f9fc] p-3 rounded-xl border border-[#e8ecf2]">
                    <div className="w-6 h-6 rounded-lg bg-[#c9f3f0] flex items-center justify-center shrink-0">
                      {req.mode === 'home' ? <Home className="w-3.5 h-3.5 text-[#0a8075]" /> : <Globe className="w-3.5 h-3.5 text-[#0a8075]" />}
                    </div>
                    <span className="capitalize">{req.mode} Tuition</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#5b6270] bg-[#f7f9fc] p-3 rounded-xl border border-[#e8ecf2]">
                    <div className="w-6 h-6 rounded-lg bg-[#fff1a8] flex items-center justify-center shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-[#b28200]" />
                    </div>
                    <span className="truncate">{req.schedule_days}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#5b6270] bg-[#f7f9fc] p-3 rounded-xl border border-[#e8ecf2]">
                    <div className="w-6 h-6 rounded-lg bg-[#ffe3d1] flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5 text-[#f26a0f]" />
                    </div>
                    <span className="truncate">{req.schedule_time}</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-[#e8ecf2] flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => handleOpenApplicants(req)}
                    className="px-5 py-2.5 rounded-full bg-[#dbe8ff] hover:bg-[#c9dcff] text-[#0a5cff] font-bold text-xs flex items-center gap-2 transition-all"
                  >
                    <Users className="w-4 h-4 text-[#0a5cff]" />
                    View Applicants ({req.applicants_count})
                  </button>

                  <div className="flex items-center gap-2 text-xs font-semibold">
                    {req.status === 'open' && (
                      <button
                        onClick={() => handleCloseRequest(req.id)}
                        className="px-4 py-2 rounded-full text-[#5b6270] hover:text-[#111318] border border-[#e8ecf2] hover:bg-white transition-all"
                      >
                        Close Request
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteRequest(req.id)}
                      className="p-2.5 rounded-full text-[#5b6270] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Applicants Management Modal */}
      {activeRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111318]/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-[#e8ecf2] space-y-6 max-h-[90vh] overflow-y-auto relative">
            
            <button
              onClick={() => setActiveRequest(null)}
              className="absolute right-5 top-5 p-2 text-[#5b6270] hover:text-[#111318] rounded-full hover:bg-[#f7f9fc]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="eyebrow-label block mb-1">
                Applicants Review
              </span>
              <h2 className="text-2xl font-bold text-[#111318] font-heading mt-0.5">
                {activeRequest.subjects} ({activeRequest.grade_level})
              </h2>
              <p className="text-xs text-[#5b6270]">
                {applicants.length} teachers applied for this request
              </p>
            </div>

            {statusMessage && (
              <div className="p-3.5 rounded-xl bg-[#d9f5c9] border border-[#b2e896] text-[#1e6b22] text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1e6b22] shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {isLoadingApplicants ? (
              <div className="py-12 text-center">
                <div className="w-7 h-7 border-3 border-[#0a5cff]/30 border-t-[#0a5cff] rounded-full animate-spin mx-auto" />
              </div>
            ) : applicants.length === 0 ? (
              <div className="py-12 text-center text-[#5b6270] text-sm space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#f7f9fc] text-[#5b6270] flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <p>No teachers have applied to this request yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applicants.map((app) => (
                  <div
                    key={app.application_id}
                    className="p-5 rounded-xl bg-[#f7f9fc] border border-[#e8ecf2] space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-[#111318] text-base font-heading">
                            {app.teacher_name}
                          </h3>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#d9f5c9] text-[#1e6b22]">
                            Verified Tutor
                          </span>
                        </div>
                        <p className="text-xs font-medium text-[#5b6270] mt-0.5">
                          {app.qualification} • {app.experience_years} Years Experience
                        </p>
                        <p className="text-xs text-[#5b6270]">
                          Location: {app.location_city} • Contact: {app.teacher_phone}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        {app.proposed_rate ? (
                          <>
                            <span className="text-xs text-[#5b6270] font-semibold block">Proposed Fee:</span>
                            <span className="text-base font-extrabold text-[#0a5cff] font-heading">
                              Rs. {Math.round(Number(app.proposed_rate))}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-[#5b6270] font-medium">Standard Rate</span>
                        )}
                      </div>
                    </div>

                    {/* Proposal Message */}
                    <div className="bg-white p-3.5 rounded-xl border border-[#e8ecf2] text-xs text-[#5b6270] leading-relaxed">
                      <strong className="text-[#111318]">Teacher Proposal:</strong>
                      <p className="mt-1 italic">&ldquo;{app.message}&rdquo;</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-[#5b6270] font-medium mr-1">Status:</span>
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
                            app.application_status === 'hired'
                              ? 'bg-[#d9f5c9] text-[#1e6b22]'
                              : app.application_status === 'shortlisted'
                              ? 'bg-[#fff1a8] text-[#8a6500]'
                              : app.application_status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-[#e8ecf2] text-[#5b6270]'
                          }`}
                        >
                          {app.application_status.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Direct Chat Link */}
                        <Link
                          href={`/messages?teacher_id=${app.teacher_id}`}
                          className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#f7f9fc] text-[#0a5cff] border border-[#e8ecf2] font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Chat
                        </Link>

                        {/* Shortlist */}
                        {app.application_status !== 'shortlisted' && app.application_status !== 'hired' && (
                          <button
                            onClick={() => handleUpdateApplicantStatus(app.application_id, 'shortlisted')}
                            className="px-3.5 py-1.5 rounded-full bg-[#fff1a8] hover:bg-[#ffe66d] text-[#111318] font-bold text-xs transition-all shadow-sm"
                          >
                            Shortlist
                          </button>
                        )}

                        {/* Hire */}
                        {app.application_status !== 'hired' && (
                          <button
                            onClick={() => handleUpdateApplicantStatus(app.application_id, 'hired')}
                            className="btn-pill-blue !py-1.5 !px-4 !text-xs flex items-center gap-1 shadow-sm"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Hire Tutor
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
