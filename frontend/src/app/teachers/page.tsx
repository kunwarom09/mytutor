'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  BookOpen, 
  Briefcase, 
  SlidersHorizontal, 
  ArrowRight, 
  X, 
  RotateCcw, 
  GraduationCap 
} from 'lucide-react';

interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar?: string | null;
  qualification: string;
  experience: string;
  experience_years: number;
  bio?: string | null;
  subjects: string;
  subjects_list: string[];
  grade_levels: string;
  grade_levels_list: string[];
  location_city: string;
  temporary_address: string;
  hourly_rate?: number | string | null;
  verification_status: string;
}

interface Pagination {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export default function TeachersDirectoryPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    per_page: 9,
    total: 0,
    total_pages: 1,
  });

  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [location, setLocation] = useState('all');
  const [minExp, setMinExp] = useState('');
  const [sort, setSort] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeachers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (subject) params.append('subject', subject);
      if (location && location !== 'all') params.append('location_city', location);
      if (minExp) params.append('min_experience', minExp);
      if (sort) params.append('sort', sort);
      params.append('page', pagination.current_page.toString());
      params.append('per_page', '9');

      const res = await api.get<{ teachers: Teacher[]; pagination: Pagination }>(
        `/teachers?${params.toString()}`
      );

      if (res.data) {
        setTeachers(res.data.teachers || []);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load teachers:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, subject, location, minExp, sort, pagination.current_page]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleResetFilters = () => {
    setSearch('');
    setSubject('');
    setLocation('all');
    setMinExp('');
    setSort('newest');
  };

  const subjectsList = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Science',
    'English',
    'Computer Science',
    'Social Studies',
  ];

  const nepalCities = ['All', 'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara'];

  return (
    <div className="min-h-screen bg-[#f7f9fc] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="mb-2">
              <span className="eyebrow-label">
                Verified Teachers in Nepal
              </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#111318] tracking-tight">
              Browse Tuition Teachers
            </h1>
            <p className="text-[#5b6270] text-sm sm:text-base mt-1">
              Find verified home &amp; online educators across Kathmandu, Lalitpur, and Pokhara.
            </p>
          </div>
          <div className="text-sm text-[#5b6270] font-medium">
            Showing <strong className="text-[#111318] font-bold">{pagination.total}</strong> verified tutors
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="card-theme p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            
            {/* Keyword Search */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, subject, or qualification..."
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

            {/* Location City */}
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

            {/* Experience */}
            <div>
              <select
                value={minExp}
                onChange={(e) => setMinExp(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#e8ecf2] text-sm bg-white text-[#111318] font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff]"
              >
                <option value="">Exp: Any Experience</option>
                <option value="2">2+ Years</option>
                <option value="4">4+ Years</option>
                <option value="6">6+ Years</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#e8ecf2] text-sm bg-white text-[#111318] font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff]"
              >
                <option value="newest">Sort: Newly Joined</option>
                <option value="exp_desc">Most Experienced</option>
                <option value="rate_asc">Rate: Low to High</option>
                <option value="rate_desc">Rate: High to Low</option>
              </select>
            </div>
          </div>

          {/* Quick Subject Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#e8ecf2] text-xs">
            <span className="text-[#5b6270] font-bold uppercase tracking-wider mr-1">
              Popular Subjects:
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

            {(search || subject || (location && location !== 'all') || minExp) && (
              <button
                onClick={handleResetFilters}
                className="ml-auto flex items-center gap-1 text-[#f26a0f] hover:text-[#ea580c] font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Teachers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-72 card-theme animate-pulse p-6 space-y-4"
              >
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-16 bg-[#f7f9fc] rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-full" />
              </div>
            ))}
          </div>
        ) : teachers.length === 0 ? (
          <div className="card-theme p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl tile-blue mx-auto flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-[#0a5cff]" />
            </div>
            <h3 className="font-heading text-xl font-bold text-[#111318]">No tutors found</h3>
            <p className="text-sm text-[#5b6270] leading-relaxed">
              We couldn&apos;t find any approved tutors matching your search filters. Try clearing some criteria.
            </p>
            <button
              onClick={handleResetFilters}
              className="btn-pill-blue text-sm"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="group card-theme p-6 hover:-translate-y-1 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  
                  {/* Top card info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl tile-blue text-[#0a5cff] font-extrabold font-heading flex items-center justify-center text-lg shadow-sm">
                        {teacher.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-heading font-bold text-[#111318] group-hover:text-[#0a5cff] transition-colors">
                            {teacher.name}
                          </h3>
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#5b6270] font-medium mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>{teacher.location_city}</span>
                        </div>
                      </div>
                    </div>

                    {teacher.hourly_rate && (
                      <div className="text-right">
                        <span className="font-heading text-base font-extrabold text-[#0a5cff]">
                          Rs. {Math.round(Number(teacher.hourly_rate))}
                        </span>
                        <span className="text-[10px] text-[#5b6270] block -mt-0.5">/ hour</span>
                      </div>
                    )}
                  </div>

                  {/* Qualification & Experience */}
                  <div className="bg-[#f7f9fc] rounded-xl p-3 border border-[#e8ecf2] space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-[#111318] font-semibold">
                      <BookOpen className="w-3.5 h-3.5 text-[#0a5cff] shrink-0" />
                      <span className="truncate">{teacher.qualification}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#5b6270]">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{teacher.experience_years} years teaching experience</span>
                    </div>
                  </div>

                  {/* Bio */}
                  {teacher.bio && (
                    <p className="text-xs text-[#5b6270] line-clamp-2 leading-relaxed">
                      {teacher.bio}
                    </p>
                  )}

                  {/* Subjects Badges */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-[#5b6270] uppercase tracking-wider block">
                      Subjects &amp; Grades:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {teacher.subjects_list.slice(0, 3).map((sub, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full tile-blue text-[#0a5cff] text-xs font-semibold"
                        >
                          {sub}
                        </span>
                      ))}
                      {teacher.subjects_list.length > 3 && (
                        <span className="px-2.5 py-1 rounded-full bg-[#f7f9fc] border border-[#e8ecf2] text-[#5b6270] text-xs font-medium">
                          +{teacher.subjects_list.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Card CTA */}
                <div className="pt-5 mt-5 border-t border-[#e8ecf2]">
                  <Link
                    href={`/teachers/${teacher.id}`}
                    className="btn-pill-yellow w-full justify-center text-sm font-bold shadow-xs hover:shadow-md"
                  >
                    View Full Profile
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="flex justify-center items-center gap-3 pt-6">
            <button
              disabled={pagination.current_page <= 1}
              onClick={() => setPagination((prev) => ({ ...prev, current_page: prev.current_page - 1 }))}
              className="btn-pill-white text-xs disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm font-semibold text-[#5b6270] px-3 font-heading">
              Page {pagination.current_page} of {pagination.total_pages}
            </span>
            <button
              disabled={pagination.current_page >= pagination.total_pages}
              onClick={() => setPagination((prev) => ({ ...prev, current_page: prev.current_page + 1 }))}
              className="btn-pill-white text-xs disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
