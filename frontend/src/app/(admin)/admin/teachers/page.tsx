'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import {
  GraduationCap,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Trash2,
  Eye,
  AlertCircle,
  MapPin,
  Mail,
  Phone,
  BookOpen,
  DollarSign,
  Loader2,
  ExternalLink,
  ShieldCheck,
  X
} from 'lucide-react';

interface DocumentRecord {
  id: number;
  teacher_id: number;
  document_type: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  uploaded_at: string;
}

interface TeacherRecord {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  bio: string | null;
  hourly_rate: string | number;
  experience_years: number;
  qualification: string | null;
  subjects: string | null;
  location_city: string | null;
  teaching_mode: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  verified_at: string | null;
  documents: DocumentRecord[];
}

function TeachersContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';
  const initialQ = searchParams.get('q') || '';

  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reject Modal State
  const [rejectingTeacher, setRejectingTeacher] = useState<TeacherRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Delete Modal State
  const [deletingTeacher, setDeletingTeacher] = useState<TeacherRecord | null>(null);

  // Document Viewing State
  const [viewingDoc, setViewingDoc] = useState<{ id: number; name: string; url?: string; mime: string } | null>(null);
  const [docLoading, setDocLoading] = useState(false);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/teachers?status=${encodeURIComponent(statusFilter)}&q=${encodeURIComponent(searchQuery)}`);
      if (res.success && res.data) {
        setTeachers(res.data.teachers || []);
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to load teachers.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTeachers();
  };

  const handleApprove = async (teacher: TeacherRecord) => {
    if (!confirm(`Are you sure you want to APPROVE ${teacher.name}'s tuition profile?`)) return;

    setActionLoadingId(teacher.id);
    setFeedbackMsg(null);
    try {
      const res = await api.patch(`/admin/teachers/${teacher.id}/verify`, {
        action: 'approve',
        status: 'approved',
        admin_notes: 'Verified and approved by Administrator.',
      });
      if (res.success) {
        setFeedbackMsg({ type: 'success', text: `${teacher.name} has been approved successfully.` });
        fetchTeachers();
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to approve teacher.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingTeacher) return;
    if (!rejectReason.trim()) {
      alert('Please specify a rejection reason for the teacher.');
      return;
    }

    setActionLoadingId(rejectingTeacher.id);
    setFeedbackMsg(null);
    try {
      const res = await api.patch(`/admin/teachers/${rejectingTeacher.id}/verify`, {
        action: 'reject',
        status: 'rejected',
        rejection_reason: rejectReason,
        admin_notes: rejectReason,
      });
      if (res.success) {
        setFeedbackMsg({ type: 'success', text: `${rejectingTeacher.name} has been marked as rejected.` });
        setRejectingTeacher(null);
        setRejectReason('');
        fetchTeachers();
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to reject teacher.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTeacher) return;

    setActionLoadingId(deletingTeacher.id);
    setFeedbackMsg(null);
    try {
      const res = await api.delete(`/admin/teachers/${deletingTeacher.id}`);
      if (res.success) {
        setFeedbackMsg({ type: 'success', text: `${deletingTeacher.name}'s account and credentials deleted.` });
        setDeletingTeacher(null);
        fetchTeachers();
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to delete teacher.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const openDocument = async (doc: DocumentRecord) => {
    setDocLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('mytutor_token') : '';
      const response = await fetch(`http://localhost:8000/api/admin/documents/${doc.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download secure verification document.');
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setViewingDoc({
        id: doc.id,
        name: doc.file_name,
        url: objectUrl,
        mime: doc.mime_type,
      });
    } catch (err: any) {
      alert(err.message || 'Could not stream document.');
    } finally {
      setDocLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#111318] tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#0a5cff]" />
            Teacher Verification & Directory
          </h1>
          <p className="text-sm text-[#5b6270] mt-0.5">
            Audit national ID credentials, academic qualifications, and moderate teacher profiles.
          </p>
        </div>

        {/* Filter status tabs */}
        <div className="flex items-center gap-1 bg-[#f7f9fc] border border-[#e8ecf2] p-1 rounded-full text-xs font-semibold">
          {[
            { id: 'all', label: 'All Tutors' },
            { id: 'pending', label: 'Pending Review' },
            { id: 'approved', label: 'Approved' },
            { id: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full transition-colors ${
                statusFilter === tab.id
                  ? 'bg-[#0a5cff] text-white shadow-xs font-bold'
                  : 'text-[#5b6270] hover:text-[#111318]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alert message */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between ${
            feedbackMsg.type === 'success'
              ? 'bg-[#d9f5c9] text-[#1e6b20] border border-[#c2eeb0]'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="card-theme p-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by tutor name, email, phone number, city, or academic degree..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#f7f9fc] border border-[#e8ecf2] rounded-xl text-sm text-[#111318] focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff]"
            />
          </div>
          <button
            type="submit"
            className="btn-pill-blue px-5 py-2 text-sm font-semibold"
          >
            Search
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                fetchTeachers();
              }}
              className="px-4 py-2 bg-white hover:bg-[#f7f9fc] border border-[#e8ecf2] text-[#5b6270] text-sm font-medium rounded-full transition-colors"
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Teachers List / Table */}
      <div className="card-theme overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#0a5cff] animate-spin mb-3" />
            <p className="text-sm text-[#5b6270]">Querying teacher records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f7f9fc] text-xs font-semibold text-[#5b6270] uppercase tracking-wider border-b border-[#e8ecf2]">
                <tr>
                  <th className="px-6 py-4">Tutor Details</th>
                  <th className="px-6 py-4">Location & Rates</th>
                  <th className="px-6 py-4">Academics & Subjects</th>
                  <th className="px-6 py-4">Verification Docs</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8ecf2]">
                {teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-[#f7f9fc]/60 transition-colors">
                    {/* Tutor Details */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#111318]">{t.name}</div>
                      <div className="flex items-center gap-1.5 text-xs text-[#5b6270] mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{t.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#5b6270] mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{t.phone}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                        Registered: {t.created_at ? t.created_at.slice(0, 10) : 'N/A'}
                      </span>
                    </td>

                    {/* Location & Rates */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs font-semibold text-[#111318]">
                        <MapPin className="w-3.5 h-3.5 text-[#0a5cff]" />
                        <span>{t.location_city || 'Nepal'}</span>
                      </div>
                      <div className="text-xs text-[#0a5cff] mt-1 flex items-center gap-1 font-bold">
                        <DollarSign className="w-3 h-3 text-[#0a5cff]" />
                        <span>Rs. {Number(t.hourly_rate || 500).toLocaleString()}/hr</span>
                      </div>
                      <div className="text-[11px] text-[#5b6270] capitalize mt-0.5">
                        Mode: {t.teaching_mode}
                      </div>
                    </td>

                    {/* Academics & Subjects */}
                    <td className="px-6 py-4 max-w-xs">
                      <div className="text-xs font-semibold text-[#111318] line-clamp-1">
                        {t.qualification || 'Not provided'}
                      </div>
                      <div className="text-xs text-[#5b6270]">
                        {t.experience_years} years teaching experience
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-[#0a5cff] mt-1 line-clamp-1 font-semibold">
                        <BookOpen className="w-3 h-3 text-[#0a5cff] shrink-0" />
                        <span>{t.subjects || 'General Subjects'}</span>
                      </div>
                    </td>

                    {/* Verification Documents */}
                    <td className="px-6 py-4">
                      {t.documents && t.documents.length > 0 ? (
                        <div className="space-y-1.5">
                          {t.documents.map((doc) => (
                            <button
                              key={doc.id}
                              onClick={() => openDocument(doc)}
                              disabled={docLoading}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f7f9fc] hover:bg-[#dbe8ff] hover:text-[#0a5cff] text-[#5b6270] rounded-full text-xs font-medium transition-colors border border-[#e8ecf2] w-full"
                              title="Click to securely review file"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#0a5cff] shrink-0" />
                              <span className="truncate max-w-[120px]">{doc.document_type}</span>
                              <Eye className="w-3 h-3 ml-auto text-slate-400" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-[#5b6270] italic flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-[#f26a0f]" /> No files uploaded
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {t.verification_status === 'approved' ? (
                        <div>
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#d9f5c9] text-[#1e6b20] border border-[#c2eeb0] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" /> Approved
                          </span>
                          {t.verified_at && (
                            <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                              Verified {t.verified_at ? t.verified_at.slice(0, 10) : ''}
                            </span>
                          )}
                        </div>
                      ) : t.verification_status === 'rejected' ? (
                        <div>
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Rejected
                          </span>
                          {t.admin_notes && (
                            <p className="text-[11px] text-rose-700 mt-1 italic max-w-[150px] truncate" title={t.admin_notes}>
                              {t.admin_notes}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#fff1a8] text-[#92400e] border border-[#fde68a] font-bold animate-pulse">
                          <Clock className="w-3.5 h-3.5 text-[#d97706]" /> Pending Review
                        </span>
                      )}
                    </td>

                    {/* Moderation Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {t.verification_status !== 'approved' && (
                          <button
                            onClick={() => handleApprove(t)}
                            disabled={actionLoadingId === t.id}
                            className="p-1.5 bg-[#d9f5c9] hover:bg-[#c2eeb0] text-[#1e6b20] rounded-full text-xs font-semibold transition-colors disabled:opacity-50"
                            title="Approve Teacher"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {t.verification_status !== 'rejected' && (
                          <button
                            onClick={() => {
                              setRejectingTeacher(t);
                              setRejectReason('');
                            }}
                            disabled={actionLoadingId === t.id}
                            className="p-1.5 bg-[#fff1a8] hover:bg-[#fde68a] text-[#92400e] rounded-full text-xs font-semibold transition-colors disabled:opacity-50"
                            title="Reject Teacher"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => setDeletingTeacher(t)}
                          disabled={actionLoadingId === t.id}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full text-xs font-semibold transition-colors disabled:opacity-50"
                          title="Delete Teacher Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {teachers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#5b6270] text-sm">
                      No teacher records found matching the active criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REJECT MODAL */}
      {rejectingTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-theme max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#e8ecf2] pb-3">
              <h3 className="font-heading font-bold text-[#111318] text-base flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                Reject Verification Application
              </h3>
              <button onClick={() => setRejectingTeacher(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#5b6270]">
              Rejecting <strong>{rejectingTeacher.name}</strong> will keep their profile hidden from parents. Please provide a clear feedback note.
            </p>

            <div>
              <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1">
                Reason for Rejection *
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Citizenship photo is blurry, please re-upload clear government ID."
                className="w-full p-3 bg-[#f7f9fc] border border-[#e8ecf2] rounded-xl text-xs text-[#111318] focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectingTeacher(null)}
                className="px-4 py-2 border border-[#e8ecf2] text-[#5b6270] hover:bg-[#f7f9fc] text-xs font-semibold rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={actionLoadingId === rejectingTeacher.id}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-full transition-colors disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deletingTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-theme max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#e8ecf2] pb-3">
              <h3 className="font-heading font-bold text-rose-600 text-base flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Permanent Account Deletion
              </h3>
              <button onClick={() => setDeletingTeacher(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#5b6270]">
              Are you sure you want to permanently delete teacher <strong>{deletingTeacher.name}</strong> ({deletingTeacher.email})?
              All uploaded verification documents, profile details, and applications will be deleted from disk and the database.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingTeacher(null)}
                className="px-4 py-2 border border-[#e8ecf2] text-[#5b6270] hover:bg-[#f7f9fc] text-xs font-semibold rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={actionLoadingId === deletingTeacher.id}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-full transition-colors disabled:opacity-50"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT VIEWER MODAL */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-theme max-w-3xl w-full p-6 shadow-2xl space-y-4 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-[#e8ecf2] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0a5cff]" />
                <h3 className="font-heading font-bold text-[#111318] text-sm truncate max-w-md">
                  Verification Document: {viewingDoc.name}
                </h3>
              </div>
              <button
                onClick={() => {
                  if (viewingDoc.url) URL.revokeObjectURL(viewingDoc.url);
                  setViewingDoc(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-[#f7f9fc] rounded-xl p-4 flex items-center justify-center min-h-[350px]">
              {viewingDoc.mime.startsWith('image/') ? (
                <img
                  src={viewingDoc.url}
                  alt="Teacher Verification Document"
                  className="max-h-[500px] object-contain rounded-lg shadow-sm"
                />
              ) : viewingDoc.mime === 'application/pdf' ? (
                <iframe
                  src={viewingDoc.url}
                  className="w-full h-[500px] rounded-lg border border-[#e8ecf2]"
                  title="PDF Document Viewer"
                />
              ) : (
                <div className="text-center p-8">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-[#5b6270] mb-4">
                    Document Format: {viewingDoc.mime}
                  </p>
                  <a
                    href={viewingDoc.url}
                    download={viewingDoc.name}
                    className="btn-pill-blue inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold"
                  >
                    Download File to View
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#e8ecf2] text-xs">
              <span className="text-[#5b6270] font-mono text-[11px]">
                Served securely from isolated storage via Admin HMAC Authorization
              </span>
              <a
                href={viewingDoc.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[#0a5cff] font-semibold hover:underline"
              >
                Open in Full Window <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminTeachersPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading teacher verification portal...</div>}>
      <TeachersContent />
    </Suspense>
  );
}
