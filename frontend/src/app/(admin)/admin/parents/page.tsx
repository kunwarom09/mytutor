'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { api } from '@/lib/api';
import {
  Users,
  Search,
  Mail,
  Phone,
  FileText,
  Calendar,
  CheckCircle2,
  Lock,
  Globe,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface ParentRecord {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  avatar: string | null;
  created_at: string;
  oauth_provider: string | null;
  total_requests: number;
  open_requests: number;
}

export default function AdminParentsPage() {
  const [parents, setParents] = useState<ParentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchParents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/admin/parents?q=${encodeURIComponent(searchQuery)}`);
      if (res.success && res.data) {
        setParents(res.data.parents || []);
        setTotalCount(res.data.pagination?.total || 0);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load parents directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchParents();
  };

  const oauthCount = parents.filter(p => p.oauth_provider).length;
  const standardCount = parents.length - oauthCount;
  const totalRequestsPosted = parents.reduce((acc, p) => acc + Number(p.total_requests || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#111318] tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#0a5cff]" />
            Registered Parents Directory
          </h1>
          <p className="text-sm text-[#5b6270] mt-0.5">
            Audit parent accounts, sign-in methods, and posted home tuition requirements.
          </p>
        </div>

        <button
          onClick={fetchParents}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#e8ecf2] hover:bg-[#f7f9fc] text-[#111318] rounded-full text-sm font-medium transition-colors shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-[#5b6270]" />
          Refresh Directory
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-theme p-4 flex items-center justify-between">
          <div>
            <span className="eyebrow-label">Total Parents</span>
            <div className="text-xl font-extrabold font-heading text-[#111318] mt-0.5">{totalCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#dbe8ff] text-[#0a5cff] border border-[#b8d2ff] flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="card-theme p-4 flex items-center justify-between">
          <div>
            <span className="eyebrow-label">Authentication Mix</span>
            <div className="text-xs font-semibold text-[#111318] mt-1">
              <span className="text-[#0a5cff] font-mono">{standardCount}</span> Email &bull;{' '}
              <span className="text-[#1e6b20] font-mono">{oauthCount}</span> Social OAuth
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#e8dcff] text-[#7c3aed] border border-[#d3beff] flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        <div className="card-theme p-4 flex items-center justify-between">
          <div>
            <span className="eyebrow-label">Requirements Posted</span>
            <div className="text-xl font-extrabold font-heading text-[#0a5cff] mt-0.5">{totalRequestsPosted} requests</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#fff1a8] text-[#d97706] border border-[#fde68a] flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card-theme p-4">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by parent name, email address, or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#f7f9fc] border border-[#e8ecf2] rounded-xl text-sm text-[#111318] focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff]"
            />
          </div>
          <button
            type="submit"
            className="btn-pill-blue px-5 py-2 text-sm font-semibold"
          >
            Filter
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                fetchParents();
              }}
              className="px-4 py-2 bg-white hover:bg-[#f7f9fc] border border-[#e8ecf2] text-[#5b6270] text-sm font-medium rounded-full transition-colors"
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Parents Table */}
      <div className="card-theme overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#0a5cff] animate-spin mb-3" />
            <p className="text-sm text-[#5b6270]">Querying parents directory...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f7f9fc] text-xs font-semibold text-[#5b6270] uppercase tracking-wider border-b border-[#e8ecf2]">
                <tr>
                  <th className="px-6 py-4">Parent Details</th>
                  <th className="px-6 py-4">Auth Method</th>
                  <th className="px-6 py-4">Tuition Requests</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8ecf2]">
                {parents.map((p) => (
                  <tr key={p.id} className="hover:bg-[#f7f9fc]/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#111318]">{p.name}</div>
                      <div className="flex items-center gap-1.5 text-xs text-[#5b6270] mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{p.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#5b6270] mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{p.phone || 'No phone set'}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {p.oauth_provider ? (
                        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[#dbe8ff] text-[#0a5cff] font-semibold border border-[#b8d2ff] capitalize">
                          <Globe className="w-3 h-3" />
                          {p.oauth_provider} OAuth
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[#f7f9fc] text-[#5b6270] font-semibold border border-[#e8ecf2]">
                          <Lock className="w-3 h-3 text-slate-400" />
                          Email / Password
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-[#111318]">
                        {p.total_requests} Total Posted
                      </div>
                      <div className="text-[11px] text-[#5b6270]">
                        {p.open_requests} currently open
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-[#5b6270] font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.created_at ? p.created_at.slice(0, 10) : 'N/A'}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {p.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#d9f5c9] text-[#1e6b20] border border-[#c2eeb0] font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-[#22c55e]" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold capitalize">
                          {p.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {parents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#5b6270] text-sm">
                      No parent accounts found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
