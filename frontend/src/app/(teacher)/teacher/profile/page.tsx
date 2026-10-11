'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { 
  GraduationCap, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  Save, 
  FileText, 
  CheckCircle2, 
  User, 
  Phone, 
  MapPin, 
  BookOpen, 
  Briefcase, 
  DollarSign 
} from 'lucide-react';

interface TeacherDoc {
  id: number;
  document_type: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export default function TeacherProfileEditPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    permanent_address: '',
    temporary_address: '',
    qualification: '',
    experience: '',
    experience_years: 1,
    subjects: '',
    grade_levels: '',
    location_city: 'Kathmandu',
    hourly_rate: '',
    bio: '',
  });

  const [verificationStatus, setVerificationStatus] = useState<string>('pending');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [documents, setDocuments] = useState<TeacherDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      try {
        const res = await api.get('/teacher/profile');
        if (res.data?.profile) {
          const p = res.data.profile;
          setFormData({
            name: p.name || '',
            phone: p.phone || '',
            permanent_address: p.permanent_address || '',
            temporary_address: p.temporary_address || '',
            qualification: p.qualification || '',
            experience: p.experience || '',
            experience_years: p.experience_years || 1,
            subjects: p.subjects || '',
            grade_levels: p.grade_levels || '',
            location_city: p.location_city || 'Kathmandu',
            hourly_rate: p.hourly_rate ? String(Math.round(Number(p.hourly_rate))) : '',
            bio: p.bio || '',
          });
          setVerificationStatus(p.verification_status || 'pending');
          setRejectionReason(p.rejection_reason || null);
        }
        if (res.data?.documents) {
          setDocuments(res.data.documents);
        }
      } catch (err: any) {
        if (err.status === 401 || err.status === 403) {
          router.push('/login');
        } else {
          setErrorMessage('Failed to load profile data.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await api.put('/teacher/profile', formData);
      setSuccessMessage('Your teacher profile has been updated successfully.');
      await refreshUser();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const nepalCities = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan', 'Biratnagar', 'Butwal'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] py-12 px-4 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-[#0a5cff]/30 border-t-[#0a5cff] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-12 left-10 w-72 h-72 rounded-full bg-[#dbe8ff]/30 blur-3xl pointer-events-none" />
      <div className="absolute top-96 right-10 w-64 h-64 rounded-full bg-[#fff1a8]/30 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="eyebrow-label block mb-1">
              TEACHER ACCOUNT
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111318] tracking-tight font-heading">
              Teacher Profile
            </h1>
            <p className="text-sm text-[#5b6270] mt-1.5 font-sans">
              Manage your credentials, teaching subjects, and hourly rates seen by parents.
            </p>
          </div>
          {verificationStatus === 'approved' && (
            <a
              href={`/teachers/${user?.id}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold px-5 py-2.5 rounded-full bg-white border border-[#e8ecf2] text-[#0a5cff] hover:bg-[#f7f9fc] transition-all shadow-sm self-start sm:self-auto"
            >
              Preview Public Profile ↗
            </a>
          )}
        </div>

        {/* Verification Status Banner */}
        {verificationStatus === 'approved' && (
          <div className="p-5 rounded-2xl bg-[#d9f5c9]/60 border border-[#b2e896] flex items-start gap-3.5 text-[#1e6b22]">
            <ShieldCheck className="w-6 h-6 text-[#1e6b22] shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-sm">Account Status: Approved &amp; Verified</strong>
              <p className="text-xs text-[#1e6b22] mt-0.5 leading-relaxed">
                Your credentials and verification document have been approved by the admin. Your profile appears in parent searches and you can apply to tutor requests.
              </p>
            </div>
          </div>
        )}

        {verificationStatus === 'pending' && (
          <div className="p-5 rounded-2xl bg-[#fff1a8]/60 border border-[#ffd23f] flex items-start gap-3.5 text-[#8a6500]">
            <Clock className="w-6 h-6 text-[#f26a0f] shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-sm text-[#111318]">Account Status: Pending Admin Verification</strong>
              <p className="text-xs text-[#8a6500] mt-0.5 leading-relaxed">
                Your account is currently under review by our moderation team. You can edit your profile information below. Once your document is approved, your profile will become active.
              </p>
            </div>
          </div>
        )}

        {verificationStatus === 'rejected' && (
          <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3.5 text-rose-900">
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-sm">Account Status: Verification Rejected</strong>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                Rejection Reason: {rejectionReason || 'Uploaded document could not be validated. Please contact support.'}
              </p>
            </div>
          </div>
        )}

        {/* Feedback Alerts */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-[#d9f5c9] border border-[#b2e896] flex items-center gap-2 text-[#1e6b22] text-sm">
            <CheckCircle2 className="w-5 h-5 text-[#1e6b22] shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-800 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSave} className="card-theme p-8 sm:p-10 bg-white space-y-8">
          
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-[#111318] border-b border-[#e8ecf2] pb-2 font-heading">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1.5">
                  Preferred Location / City
                </label>
                <select
                  name="location_city"
                  value={formData.location_city}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] bg-white transition-all"
                >
                  {nepalCities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1.5">
                  Hourly Rate (NPR / Hour)
                </label>
                <input
                  type="number"
                  name="hourly_rate"
                  value={formData.hourly_rate}
                  onChange={handleChange}
                  placeholder="e.g. 750"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1.5">
                  Permanent Address
                </label>
                <input
                  type="text"
                  name="permanent_address"
                  required
                  value={formData.permanent_address}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1.5">
                  Temporary / Current Address
                </label>
                <input
                  type="text"
                  name="temporary_address"
                  required
                  value={formData.temporary_address}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Qualifications & Experience */}
          <div className="space-y-4 pt-2">
            <h2 className="text-base font-bold text-[#111318] border-b border-[#e8ecf2] pb-2 font-heading">
              Teaching Credentials
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1.5">
                  Qualification
                </label>
                <input
                  type="text"
                  name="qualification"
                  required
                  value={formData.qualification}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1.5">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="experience_years"
                  min="0"
                  max="40"
                  value={formData.experience_years}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] bg-white transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1.5">
                  Experience Summary
                </label>
                <input
                  type="text"
                  name="experience"
                  required
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1.5">
                  Subjects Taught (Comma separated)
                </label>
                <input
                  type="text"
                  name="subjects"
                  required
                  value={formData.subjects}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1.5">
                  Target Grade Levels
                </label>
                <input
                  type="text"
                  name="grade_levels"
                  required
                  value={formData.grade_levels}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] bg-white transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1.5">
                  Bio / Teaching Philosophy
                </label>
                <textarea
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Uploaded Documents Info */}
          <div className="space-y-4 pt-2">
            <h2 className="text-base font-bold text-[#111318] border-b border-[#e8ecf2] pb-2 font-heading">
              Submitted Verification Documents
            </h2>
            {documents.length === 0 ? (
              <p className="text-xs text-[#5b6270]">No document records found.</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl bg-[#f7f9fc] border border-[#e8ecf2] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#dbe8ff] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-[#0a5cff]" />
                      </div>
                      <div>
                        <strong className="block font-bold text-[#111318]">
                          {doc.document_type}
                        </strong>
                        <span className="text-[#5b6270] font-normal">
                          {doc.original_name} ({(doc.file_size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    </div>
                    <span className="text-[#5b6270]">
                      Uploaded on {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-[#e8ecf2] flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="btn-pill-yellow py-3 px-7 text-sm font-bold shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-60 transition-all"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-[#111318]/30 border-t-[#111318] rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
