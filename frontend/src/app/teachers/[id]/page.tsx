'use client';

import React, { useState, useEffect, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { 
  ShieldCheck, 
  MapPin, 
  BookOpen, 
  Briefcase, 
  MessageSquare, 
  ArrowLeft, 
  Award, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface TeacherProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar?: string | null;
  permanent_address: string;
  temporary_address: string;
  qualification: string;
  experience: string;
  experience_years: number;
  bio?: string | null;
  subjects: string;
  subjects_list: string[];
  grade_levels: string;
  grade_levels_list: string[];
  location_city: string;
  hourly_rate?: number | string | null;
  verification_status: string;
  created_at: string;
}

function TeacherProfileContent({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useAuth();

  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTeacher() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get<{ teacher: TeacherProfile }>(`/teachers/${id}`);
        if (res.data?.teacher) {
          setTeacher(res.data.teacher);
        }
      } catch (err: any) {
        if (err.status === 403) {
          setError('This teacher profile is currently pending verification by the administration team.');
        } else if (err.status === 404) {
          setError('Teacher profile not found.');
        } else {
          setError(err.message || 'Failed to load teacher profile.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadTeacher();
  }, [id]);

  const handleStartMessage = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    router.push(`/messages?teacher_id=${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] py-12 px-4 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-[#0a5cff]/30 border-t-[#0a5cff] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] py-16 px-4">
        <div className="card-theme max-w-md mx-auto p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#ffe3d1] text-[#f26a0f] mx-auto flex items-center justify-center">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold font-heading text-[#111318]">Notice</h2>
          <p className="text-sm text-[#5b6270] leading-relaxed">{error}</p>
          <Link
            href="/teachers"
            className="btn-pill-blue inline-flex items-center gap-1.5 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Teachers Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Back Link */}
        <Link
          href="/teachers"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#5b6270] hover:text-[#0a5cff] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all teachers
        </Link>

        {/* Hero Profile Card */}
        <div className="card-theme p-8 sm:p-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#e8ecf2]">
            
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#dbe8ff] border border-[#b8d2ff] text-[#0a5cff] font-extrabold text-3xl sm:text-4xl flex items-center justify-center font-heading shrink-0 shadow-sm">
                {teacher.name.charAt(0)}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#111318]">
                    {teacher.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#d9f5c9] text-[#1e6b20] text-xs font-bold border border-[#c2eeb0]">
                    <ShieldCheck className="w-4 h-4 text-[#22c55e]" />
                    Government ID Verified
                  </span>
                </div>
                <p className="text-sm font-medium text-[#5b6270]">
                  {teacher.qualification}
                </p>
                <div className="flex items-center gap-4 text-xs font-semibold text-[#5b6270] pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#0a5cff]" />
                    {teacher.location_city} ({teacher.temporary_address})
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-[#f26a0f]" />
                    {teacher.experience_years} Years Teaching
                  </span>
                </div>
              </div>
            </div>

            {/* Price & Action */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-4">
              {teacher.hourly_rate && (
                <div className="md:text-right">
                  <span className="text-3xl font-black text-[#0a5cff] font-heading">
                    Rs. {Math.round(Number(teacher.hourly_rate))}
                  </span>
                  <span className="text-xs text-[#5b6270] font-semibold block">per teaching hour</span>
                </div>
              )}
              
              <button
                onClick={handleStartMessage}
                className="btn-pill-yellow w-full sm:w-auto px-6 py-3 text-sm font-bold flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Message Teacher
              </button>
            </div>
          </div>

          {/* Detailed Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left 2 cols */}
            <div className="md:col-span-2 space-y-6">
              
              {/* About */}
              {teacher.bio && (
                <div className="space-y-2">
                  <span className="eyebrow-label block">
                    About the Tutor
                  </span>
                  <p className="text-sm text-[#5b6270] leading-relaxed bg-[#f7f9fc] p-4 rounded-2xl border border-[#e8ecf2]">
                    {teacher.bio}
                  </p>
                </div>
              )}

              {/* Experience Summary */}
              <div className="space-y-2">
                <span className="eyebrow-label block">
                  Teaching Experience
                </span>
                <div className="p-4 rounded-2xl bg-[#f7f9fc] border border-[#e8ecf2] space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#111318]">
                    <Award className="w-4 h-4 text-[#0a5cff]" />
                    <span>{teacher.experience}</span>
                  </div>
                  <p className="text-xs text-[#5b6270]">
                    Provides regular diagnostic tests, concept revisions, and past SEE/+2 paper solutions.
                  </p>
                </div>
              </div>

              {/* Subjects Taught */}
              <div className="space-y-2">
                <span className="eyebrow-label block">
                  Subjects Taught
                </span>
                <div className="flex flex-wrap gap-2">
                  {teacher.subjects_list.map((sub, i) => (
                    <span
                      key={i}
                      className="px-3.5 py-1.5 rounded-full bg-[#dbe8ff] text-[#0a5cff] text-xs font-bold border border-[#b8d2ff]"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Grade Levels */}
              <div className="space-y-2">
                <span className="eyebrow-label block">
                  Target Grade Levels
                </span>
                <div className="flex flex-wrap gap-2">
                  {teacher.grade_levels_list.map((grade, i) => (
                    <span
                      key={i}
                      className="px-3.5 py-1.5 rounded-full bg-[#f7f9fc] border border-[#e8ecf2] text-[#5b6270] text-xs font-semibold"
                    >
                      {grade}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              
              <div className="bg-[#f7f9fc] p-6 rounded-2xl border border-[#e8ecf2] space-y-4">
                <h3 className="font-bold font-heading text-sm text-[#111318]">
                  Verification &amp; Safety
                </h3>
                <ul className="space-y-2.5 text-xs text-[#5b6270]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                    <span>Government ID Document Verified</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                    <span>Educational Degree Checked</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                    <span>Phone Number Verified</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                    <span>In-App Messages Moderated for Safety</span>
                  </li>
                </ul>
              </div>

              {/* Inquiry prompt */}
              <div className="bg-[#fff1a8]/30 p-6 rounded-2xl border border-[#ffe3d1] space-y-3">
                <h3 className="font-bold font-heading text-sm text-[#111318]">
                  Want to arrange a demo session?
                </h3>
                <p className="text-xs text-[#5b6270] leading-relaxed">
                  Send a message to discuss your child&apos;s current syllabus, timing, and schedule a 45-minute demo class.
                </p>
                <button
                  onClick={handleStartMessage}
                  className="btn-pill-yellow w-full py-2.5 text-xs font-bold"
                >
                  Message {teacher.name.split(' ')[0]}
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

function TeacherProfileAsync({ params }: { params: Promise<{ id: string }> }) {
  const resolved = use(params);
  return <TeacherProfileContent id={resolved.id} />;
}

export default function TeacherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      }
    >
      <TeacherProfileAsync params={params} />
    </Suspense>
  );
}
