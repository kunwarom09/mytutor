'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  FileText,
  Search,
  MapPin,
  Calendar,
  XCircle,
  Trash2,
  CheckCircle2,
  Users,
  DollarSign,
  Loader2,
  AlertCircle,
  ExternalLink,
  X
} from 'lucide-react';

interface RequestRecord {
  id: number;
  parent_id: number;
  title: string;
  grade_level: string;
  subjects: string;
  location_city: string;
  location_area: string | null;
  preferred_mode: string;
  budget_monthly: string | number;
  description: string;
  status: 'open' | 'in_progress' | 'closed' | 'cancelled';
  created_at: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  applications_count: number;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Deletion Modal
  const [deletingRequest, setDeletingRequest] = useState<RequestRecord | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/requests?status=${encodeURIComponent(statusFilter)}&q=${encodeURIComponent(searchQuery)}`);
      if (res.success && res.data) {
        setRequests(res.data.requests || []);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to fetch tutor requests.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests();
  };

  const handleClose = async (req: RequestRecord) => {
    if (!confirm(`Are you sure you want to CLOSE tutor request #${req.id} ("${req.title}")?`)) return;

    setActionLoadingId(req.id);
    setFeedback(null);
    try {
      const res = await api.patch(`/admin/requests/${req.id}/close`);
      if (res.success) {
        setFeedback({ type: 'success', text: `Request #${req.id} has been marked as closed.` });
        fetchRequests();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to close request.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRequest) return;

    setActionLoadingId(deletingRequest.id);
    setFeedback(null);
    try {
      const res = await api.delete(`/admin/requests/${deletingRequest.id}`);
      if (res.success) {
        setFeedback({ type: 'success', text: `Request #${deletingRequest.id} and all teacher applications were deleted.` });
        setDeletingRequest(null);
        fetchRequests();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to delete request.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#111318] tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#0a5cff]" />
            Tutor Requests Moderation
          </h1>
          <p className="text-sm text-[#5b6270] mt-0.5">
            Oversee tuition postings, review applications, and manage listing statuses.
          </p>
        </div>

        {/* Filter status tabs */}
        <div className="flex items-center gap-1 bg-[#f7f9fc] border border-[#e8ecf2] p-1 rounded-full text-xs font-semibold">
          {[
            { id: 'all', label: 'All Postings' },
            { id: 'open', label: 'Open' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'closed', label: 'Closed' },
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

      {/* Alert feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-[#d9f5c9] text-[#1e6b20] border border-[#c2eeb0]'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="card-theme p-4">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by request title, subject, grade level, city, or parent name..."
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
                fetchRequests();
              }}
              className="px-4 py-2 bg-white hover:bg-[#f7f9fc] border border-[#e8ecf2] text-[#5b6270] text-sm font-medium rounded-full transition-colors"
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Requests Table */}
      <div className="card-theme overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#0a5cff] animate-spin mb-3" />
            <p className="text-sm text-[#5b6270]">Querying tuition requests...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f7f9fc] text-xs font-semibold text-[#5b6270] uppercase tracking-wider border-b border-[#e8ecf2]">
                <tr>
                  <th className="px-6 py-4">Request & Subject</th>
                  <th className="px-6 py-4">Parent Details</th>
                  <th className="px-6 py-4">Location & Budget</th>
                  <th className="px-6 py-4">Applicants</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8ecf2]">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-[#f7f9fc]/60 transition-colors">
                    {/* Request & Subject */}
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-bold text-[#111318]">{r.title}</div>
                      <div className="text-xs text-[#0a5cff] font-semibold mt-0.5">
                        {r.subjects} &bull; {r.grade_level}
                      </div>
                      <p className="text-[11px] text-[#5b6270] line-clamp-1 mt-1">
                        {r.description}
                      </p>
                    </td>

                    {/* Parent Details */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#111318] text-xs">{r.parent_name}</div>
                      <div className="text-xs text-[#5b6270]">{r.parent_email}</div>
                      <div className="text-xs text-[#5b6270]">{r.parent_phone}</div>
                    </td>

                    {/* Location & Budget */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs font-semibold text-[#111318]">
                        <MapPin className="w-3.5 h-3.5 text-[#0a5cff]" />
                        <span>{r.location_city} {r.location_area ? `(${r.location_area})` : ''}</span>
                      </div>
                      <div className="text-xs text-[#0a5cff] mt-0.5 flex items-center gap-1 font-bold">
                        <DollarSign className="w-3 h-3 text-[#0a5cff]" />
                        <span>Rs. {Number(r.budget_monthly || 0).toLocaleString()} /mo</span>
                      </div>
                      <span className="text-[11px] text-[#5b6270] capitalize">
                        Mode: {r.preferred_mode}
                      </span>
                    </td>

                    {/* Applicants */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-[#f7f9fc] border border-[#e8ecf2] text-[#5b6270]">
                        <Users className="w-3 h-3 text-[#0a5cff]" />
                        {r.applications_count} Tutors Applied
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {r.status === 'open' ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#d9f5c9] text-[#1e6b20] border border-[#c2eeb0] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" /> Open
                        </span>
                      ) : r.status === 'in_progress' ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#dbe8ff] text-[#0a5cff] border border-[#b8d2ff] font-bold">
                          In Progress
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#f7f9fc] text-[#5b6270] border border-[#e8ecf2] font-bold capitalize">
                          {r.status}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                        {r.created_at ? r.created_at.slice(0, 10) : 'N/A'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {r.status === 'open' && (
                          <button
                            onClick={() => handleClose(r)}
                            disabled={actionLoadingId === r.id}
                            className="p-1.5 bg-[#fff1a8] hover:bg-[#fde68a] text-[#92400e] rounded-full text-xs font-semibold transition-colors"
                            title="Close Listing"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => setDeletingRequest(r)}
                          disabled={actionLoadingId === r.id}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full text-xs font-semibold transition-colors"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {requests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#5b6270] text-sm">
                      No tuition requests found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {deletingRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-theme max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#e8ecf2] pb-3">
              <h3 className="font-heading font-bold text-rose-600 text-base flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Delete Tutor Request
              </h3>
              <button onClick={() => setDeletingRequest(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#5b6270]">
              Are you sure you want to delete tutor request #{deletingRequest.id} (<strong>"{deletingRequest.title}"</strong>)?
              All teacher applications submitted for this request will also be permanently deleted.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingRequest(null)}
                className="px-4 py-2 border border-[#e8ecf2] text-[#5b6270] hover:bg-[#f7f9fc] text-xs font-semibold rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={actionLoadingId === deletingRequest.id}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-full transition-colors disabled:opacity-50"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
