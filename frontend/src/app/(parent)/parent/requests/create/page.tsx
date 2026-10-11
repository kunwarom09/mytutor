'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { 
  PlusCircle, 
  BookOpen, 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Calendar, 
  DollarSign, 
  Home, 
  Globe, 
  AlertCircle 
} from 'lucide-react';

export default function CreateTutorRequestPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    child_name: '',
    grade_level: 'Grade 10 (SEE)',
    subjects: 'Mathematics, Science',
    location_city: 'Kathmandu',
    location_area: '',
    mode: 'home',
    schedule_days: 'Sunday to Friday (6 days/week)',
    schedule_time: '5:30 PM - 7:00 PM',
    budget_min: '8000',
    budget_max: '12000',
    additional_notes: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nepalCities = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan', 'Biratnagar', 'Butwal'];

  const gradeOptions = [
    'Primary (Grade 1-5)',
    'Lower Secondary (Grade 6-8)',
    'Grade 9',
    'Grade 10 (SEE)',
    'Grade 11 (+2)',
    'Grade 12 (+2)',
    'A-Levels / Cambridge',
    'Bachelor Level',
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (Number(formData.budget_min) > Number(formData.budget_max)) {
      setError('Minimum budget cannot exceed maximum budget.');
      setIsLoading(false);
      return;
    }

    try {
      await api.post('/requests', {
        ...formData,
        budget_min: Number(formData.budget_min),
        budget_max: Number(formData.budget_max),
      });

      router.push('/parent/requests');
    } catch (err: any) {
      setError(err.message || 'Failed to create tutor request. Please review the form.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-[#dbe8ff]/30 blur-3xl pointer-events-none" />
      <div className="absolute top-96 left-8 w-64 h-64 rounded-full bg-[#fff1a8]/30 blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto space-y-6 relative z-10">
        
        {/* Back link */}
        <Link
          href="/parent/requests"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#5b6270] hover:text-[#0a5cff] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to my requests
        </Link>

        {/* Card Form */}
        <div className="card-theme p-8 sm:p-10 space-y-8 bg-white">
          
          <div>
            <span className="eyebrow-label block mb-1">
              POSTING A LESSON
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dbe8ff] text-[#0a5cff] text-xs font-bold mb-3">
              <PlusCircle className="w-3.5 h-3.5" />
              Tuition Job Posting
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111318] tracking-tight font-heading">
              Post a Tutor Request
            </h1>
            <p className="text-sm text-[#5b6270] mt-1 font-sans">
              Describe your child&apos;s educational needs. Verified tutors across Nepal will review and submit proposals.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Student & Grade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1.5">
                  Child&apos;s Name *
                </label>
                <input
                  type="text"
                  name="child_name"
                  required
                  value={formData.child_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Aarav Maharjan"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1.5">
                  Class / Grade Level *
                </label>
                <select
                  name="grade_level"
                  value={formData.grade_level}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] bg-white transition-all"
                >
                  {gradeOptions.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1.5">
                  Subject(s) Needed *
                </label>
                <input
                  type="text"
                  name="subjects"
                  required
                  value={formData.subjects}
                  onChange={handleInputChange}
                  placeholder="e.g. Mathematics, Science, English, Optional Math"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] bg-white transition-all"
                />
              </div>
            </div>

            {/* Location & Mode */}
            <div className="space-y-4 pt-4 border-t border-[#e8ecf2]">
              <h2 className="text-sm font-bold text-[#111318] uppercase tracking-wider font-heading">
                Location &amp; Tuition Mode
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1.5">
                    City *
                  </label>
                  <select
                    name="location_city"
                    value={formData.location_city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] bg-white transition-all"
                  >
                    {nepalCities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1.5">
                    Area / Neighborhood *
                  </label>
                  <input
                    type="text"
                    name="location_area"
                    required
                    value={formData.location_area}
                    onChange={handleInputChange}
                    placeholder="e.g. Jhamsikhel (near St. Marys), New Baneshwor, etc."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] bg-white transition-all"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-2">
                    Tuition Mode *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'home', label: 'Home Tuition', desc: 'Teacher visits home', icon: Home, tileBg: 'bg-[#d9f5c9]', iconColor: 'text-[#1e6b22]' },
                      { value: 'online', label: 'Online Tuition', desc: 'Zoom or Google Meet', icon: Globe, tileBg: 'bg-[#dbe8ff]', iconColor: 'text-[#0a5cff]' },
                      { value: 'both', label: 'Either / Both', desc: 'Flexible with both modes', icon: BookOpen, tileBg: 'bg-[#fff1a8]', iconColor: 'text-[#b28200]' },
                    ].map((m) => {
                      const Icon = m.icon;
                      const isSelected = formData.mode === m.value;
                      return (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, mode: m.value as any }))}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-[#0a5cff] bg-[#dbe8ff]/30 shadow-sm'
                              : 'border-[#e8ecf2] bg-white hover:bg-[#f7f9fc]'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg ${m.tileBg} flex items-center justify-center mb-2`}>
                            <Icon className={`w-4 h-4 ${m.iconColor}`} />
                          </div>
                          <strong className={`block text-xs font-bold ${isSelected ? 'text-[#0a5cff]' : 'text-[#111318]'}`}>
                            {m.label}
                          </strong>
                          <span className="text-[10px] text-[#5b6270] block mt-0.5">{m.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule & Budget */}
            <div className="space-y-4 pt-4 border-t border-[#e8ecf2]">
              <h2 className="text-sm font-bold text-[#111318] uppercase tracking-wider font-heading">
                Schedule &amp; Monthly Budget
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1.5">
                    Days per Week *
                  </label>
                  <input
                    type="text"
                    name="schedule_days"
                    required
                    value={formData.schedule_days}
                    onChange={handleInputChange}
                    placeholder="e.g. Sunday to Friday (6 days/week)"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1.5">
                    Preferred Time Slot *
                  </label>
                  <input
                    type="text"
                    name="schedule_time"
                    required
                    value={formData.schedule_time}
                    onChange={handleInputChange}
                    placeholder="e.g. 5:30 PM - 7:00 PM or Morning 6:30 AM"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1.5">
                    Min Budget (NPR / Month) *
                  </label>
                  <input
                    type="number"
                    name="budget_min"
                    required
                    value={formData.budget_min}
                    onChange={handleInputChange}
                    placeholder="8000"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1.5">
                    Max Budget (NPR / Month) *
                  </label>
                  <input
                    type="number"
                    name="budget_max"
                    required
                    value={formData.budget_max}
                    onChange={handleInputChange}
                    placeholder="12000"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] bg-white transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1.5">
                    Additional Notes &amp; Exam Focus
                  </label>
                  <textarea
                    name="additional_notes"
                    rows={3}
                    value={formData.additional_notes}
                    onChange={handleInputChange}
                    placeholder="Describe specific student weak areas, upcoming term/board exams, or expectations..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-pill-yellow w-full py-4 px-6 flex items-center justify-center gap-2 text-base font-bold shadow-md hover:shadow-lg disabled:opacity-60 transition-all"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[#111318]/30 border-t-[#111318] rounded-full animate-spin" />
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" />
                  Publish Tutor Request
                </>
              )}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
