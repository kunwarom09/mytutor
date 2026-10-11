'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  MessageSquare,
  UserX,
  AlertCircle,
  Clock,
  Send,
  Loader2,
  RefreshCw,
  X
} from 'lucide-react';

interface ReportRecord {
  id: number;
  conversation_id: number;
  reported_by: number;
  reported_user_id: number;
  reason: string;
  details: string | null;
  status: 'pending' | 'reviewed' | 'dismissed';
  admin_notes: string | null;
  action_taken: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  created_at: string;
  reported_by_name: string;
  reported_by_role: string;
  reported_user_name: string;
  reported_user_role: string;
  reported_user_status: string;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Moderation Action Modal
  const [activeReport, setActiveReport] = useState<ReportRecord | null>(null);
  const [chosenAction, setChosenAction] = useState<'warn' | 'suspend_user' | 'dismiss'>('warn');
  const [adminNotes, setAdminNotes] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reports');
      if (res.success && res.data) {
        setReports(res.data.reports || []);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to fetch platform safety reports.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExecuteAction = async () => {
    if (!activeReport) return;

    if (chosenAction === 'suspend_user' && !confirm(`CRITICAL: Are you sure you want to SUSPEND ${activeReport.reported_user_name}? Their account will be locked immediately.`)) {
      return;
    }

    setSubmittingAction(true);
    setFeedback(null);
    try {
      const res = await api.patch(`/admin/reports/${activeReport.id}/action`, {
        action: chosenAction,
        admin_notes: adminNotes || `Moderated by admin with action: ${chosenAction}`,
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          text: `Action "${chosenAction}" successfully applied to report #${activeReport.id}.`,
        });
        setActiveReport(null);
        setAdminNotes('');
        fetchReports();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to take report action.' });
    } finally {
      setSubmittingAction(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (statusFilter === 'pending') return r.status === 'pending';
    if (statusFilter === 'resolved') return r.status !== 'pending';
    return true;
  });

  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const resolvedCount = reports.length - pendingCount;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#111318] tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-[#f26a0f]" />
            Safety & Moderation Queue
          </h1>
          <p className="text-sm text-[#5b6270] mt-0.5">
            Review abuse reports, investigate messaging violations, and enact suspension sanctions.
          </p>
        </div>

        <button
          onClick={fetchReports}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#e8ecf2] hover:bg-[#f7f9fc] text-[#111318] rounded-full text-sm font-medium transition-colors shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-[#5b6270]" />
          Refresh Queue
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-theme p-4 flex items-center justify-between">
          <div>
            <span className="eyebrow-label">Total Reported Incidents</span>
            <div className="text-xl font-extrabold font-heading text-[#111318] mt-0.5">{reports.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#dbe8ff] text-[#0a5cff] border border-[#b8d2ff] flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-xl border shadow-sm flex items-center justify-between ${
          pendingCount > 0 ? 'bg-[#fff1a8]/30 border-[#ffd23f] text-[#111318]' : 'bg-white border-[#e8ecf2]'
        }`}>
          <div>
            <span className="eyebrow-label text-[#f26a0f]">Awaiting Moderation</span>
            <div className="text-xl font-extrabold font-heading text-[#f26a0f] mt-0.5">{pendingCount} pending</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#fff1a8] text-[#d97706] border border-[#fde68a] flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="card-theme p-4 flex items-center justify-between">
          <div>
            <span className="eyebrow-label">Resolved & Dismissed</span>
            <div className="text-xl font-extrabold font-heading text-[#1e6b20] mt-0.5">{resolvedCount} cases</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#d9f5c9] text-[#1e6b20] border border-[#c2eeb0] flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1 bg-[#f7f9fc] border border-[#e8ecf2] p-1 rounded-full text-xs font-semibold w-fit">
        {[
          { id: 'all', label: 'All Incidents' },
          { id: 'pending', label: `Pending (${pendingCount})` },
          { id: 'resolved', label: `Resolved (${resolvedCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as any)}
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

      {/* Alert Banner */}
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

      {/* Reports List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center card-theme">
            <Loader2 className="w-8 h-8 text-[#0a5cff] animate-spin mb-3" />
            <p className="text-sm text-[#5b6270]">Retrieving moderation records...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center card-theme">
            <CheckCircle2 className="w-12 h-12 text-[#22c55e] mx-auto mb-3" />
            <h3 className="font-heading text-base font-bold text-[#111318]">Clean Moderation Queue</h3>
            <p className="text-xs text-[#5b6270] mt-1">No reported incidents match the selected filter.</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className={`card-theme p-6 transition-all ${
                report.status === 'pending'
                  ? 'border-[#ffe3d1] ring-1 ring-[#ffe3d1]/50'
                  : 'opacity-90'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                
                {/* Left: Incident info */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-[#f7f9fc] border border-[#e8ecf2] px-2.5 py-0.5 rounded-full text-[#5b6270]">
                      Report #{report.id}
                    </span>
                    <span className="text-xs font-mono text-[#5b6270]">
                      Conv ID #{report.conversation_id}
                    </span>
                    {report.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-[#fff1a8] text-[#92400e] border border-[#fde68a] font-bold">
                        <AlertTriangle className="w-3 h-3 text-[#d97706]" /> Action Required
                      </span>
                    ) : report.status === 'reviewed' ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-[#d9f5c9] text-[#1e6b20] border border-[#c2eeb0] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-[#22c55e]" /> Action Taken
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-[#f7f9fc] text-[#5b6270] border border-[#e8ecf2] font-bold">
                        Dismissed
                      </span>
                    )}
                    <span className="text-xs text-[#5b6270] ml-auto font-mono">
                      Filed: {report.created_at}
                    </span>
                  </div>

                  {/* Parties involved */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#f7f9fc] p-3.5 rounded-xl border border-[#e8ecf2]">
                    <div>
                      <span className="eyebrow-label block text-[10px]">
                        Reported User (Target)
                      </span>
                      <div className="font-bold text-[#111318] mt-0.5 flex items-center gap-1.5">
                        {report.reported_user_name}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[#e8ecf2] text-[#5b6270] font-mono capitalize">
                          {report.reported_user_role}
                        </span>
                        {report.reported_user_status === 'suspended' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold">
                            SUSPENDED
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="eyebrow-label block text-[10px]">
                        Reporter (Complainant)
                      </span>
                      <div className="font-bold text-[#111318] mt-0.5 flex items-center gap-1.5">
                        {report.reported_by_name}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[#e8ecf2] text-[#5b6270] font-mono capitalize">
                          {report.reported_by_role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Grievance reason and details */}
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-[#f26a0f] flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      Violation Type: {report.reason}
                    </div>
                    {report.details && (
                      <p className="text-xs text-[#5b6270] bg-[#fff1a8]/20 border border-[#ffe3d1] p-3 rounded-xl italic">
                        "{report.details}"
                      </p>
                    )}
                  </div>

                  {/* Outcome if resolved */}
                  {report.status !== 'pending' && (
                    <div className="text-xs bg-[#f7f9fc] p-2.5 rounded-xl border border-[#e8ecf2] text-[#5b6270] flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[#111318]">Resolution:</span>
                      <span className="px-2.5 py-0.5 rounded-full font-mono font-bold text-[#0a5cff] bg-[#dbe8ff] border border-[#b8d2ff]">
                        {report.action_taken || 'Dismissed'}
                      </span>
                      {report.admin_notes && (
                        <span className="italic text-[#5b6270]">"{report.admin_notes}"</span>
                      )}
                      {report.reviewed_at && (
                        <span className="text-[10px] text-[#5b6270] font-mono ml-auto">
                          Moderated at {report.reviewed_at}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: Moderation CTA */}
                <div className="md:w-48 shrink-0 flex flex-col justify-center">
                  {report.status === 'pending' ? (
                    <button
                      onClick={() => {
                        setActiveReport(report);
                        setChosenAction('warn');
                        setAdminNotes('');
                      }}
                      className="btn-pill-yellow w-full py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      Take Action
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveReport(report);
                        setChosenAction((report.action_taken as any) || 'warn');
                        setAdminNotes(report.admin_notes || '');
                      }}
                      className="w-full py-2 px-3 rounded-full border border-[#e8ecf2] bg-white hover:bg-[#f7f9fc] text-[#5b6270] text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      Update Decision
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* MODERATION ACTION MODAL */}
      {activeReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-theme max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#e8ecf2] pb-3">
              <h3 className="font-heading font-bold text-[#111318] text-base flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#f26a0f]" />
                Moderation Action: Report #{activeReport.id}
              </h3>
              <button onClick={() => setActiveReport(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs bg-[#f7f9fc] p-3 rounded-xl border border-[#e8ecf2] space-y-1">
              <div><strong>Target:</strong> {activeReport.reported_user_name} ({activeReport.reported_user_role})</div>
              <div><strong>Reason:</strong> {activeReport.reason}</div>
            </div>

            {/* Choose Action */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider">
                Select Moderation Verdict *
              </label>

              <div className="space-y-2">
                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  chosenAction === 'warn' ? 'border-[#ffd23f] bg-[#fff1a8]/30' : 'border-[#e8ecf2] hover:bg-[#f7f9fc]'
                }`}>
                  <input
                    type="radio"
                    name="action"
                    value="warn"
                    checked={chosenAction === 'warn'}
                    onChange={() => setChosenAction('warn')}
                    className="mt-0.5 text-[#0a5cff] focus:ring-[#0a5cff]"
                  />
                  <div>
                    <div className="font-bold text-[#111318] text-xs">Issue Formal Warning</div>
                    <p className="text-[11px] text-[#5b6270] mt-0.5">
                      Log a compliance warning against the user without locking their account.
                    </p>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  chosenAction === 'suspend_user' ? 'border-rose-400 bg-rose-50/50' : 'border-[#e8ecf2] hover:bg-[#f7f9fc]'
                }`}>
                  <input
                    type="radio"
                    name="action"
                    value="suspend_user"
                    checked={chosenAction === 'suspend_user'}
                    onChange={() => setChosenAction('suspend_user')}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <div className="font-bold text-rose-700 text-xs flex items-center gap-1.5">
                      <UserX className="w-3.5 h-3.5" /> Suspend User Account
                    </div>
                    <p className="text-[11px] text-[#5b6270] mt-0.5">
                      Immediately disable login, revoke tokens, and set user status to suspended.
                    </p>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  chosenAction === 'dismiss' ? 'border-[#0a5cff] bg-[#dbe8ff]/30' : 'border-[#e8ecf2] hover:bg-[#f7f9fc]'
                }`}>
                  <input
                    type="radio"
                    name="action"
                    value="dismiss"
                    checked={chosenAction === 'dismiss'}
                    onChange={() => setChosenAction('dismiss')}
                    className="mt-0.5 text-[#0a5cff] focus:ring-[#0a5cff]"
                  />
                  <div>
                    <div className="font-bold text-[#111318] text-xs">Dismiss Report</div>
                    <p className="text-[11px] text-[#5b6270] mt-0.5">
                      No violation detected. Mark incident as dismissed without penalty.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Notes textarea */}
            <div>
              <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1">
                Internal Investigation Notes
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Document findings or rationale for this verdict..."
                className="w-full p-3 bg-[#f7f9fc] border border-[#e8ecf2] rounded-xl text-xs text-[#111318] focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff]"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveReport(null)}
                className="px-4 py-2 border border-[#e8ecf2] text-[#5b6270] hover:bg-[#f7f9fc] text-xs font-semibold rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAction}
                disabled={submittingAction}
                className="btn-pill-blue px-5 py-2 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                {submittingAction ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Enforce Verdict
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
