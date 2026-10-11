'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  GraduationCap, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Clock, 
  Eye, 
  EyeOff, 
  MapPin, 
  BookOpen, 
  Briefcase, 
  DollarSign 
} from 'lucide-react';

export default function RegisterTeacherPage() {
  const router = useRouter();
  const { registerTeacher } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    permanent_address: '',
    temporary_address: '',
    qualification: '',
    experience: '',
    experience_years: '2',
    subjects: 'Mathematics, Science',
    grade_levels: 'Secondary (SEE), Grade 9-10',
    location_city: 'Kathmandu',
    hourly_rate: '700',
    bio: '',
    document_type: 'Citizenship Card',
    password: '',
    confirm_password: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const documentTypes = [
    'Citizenship Card',
    'Driving License',
    'Voter ID Card',
    'NID Card',
    'Passport',
  ];

  const nepalCities = [
    'Kathmandu',
    'Lalitpur',
    'Bhaktapur',
    'Pokhara',
    'Chitwan',
    'Biratnagar',
    'Butwal',
    'Dharan',
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5242880) {
        setError('Document file size exceeds 5 MB. Please select a smaller file.');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (formData.password !== formData.confirm_password) {
      setError('Password and confirm password do not match.');
      return;
    }

    if (!selectedFile) {
      setError('Please upload your verification document (PDF, JPG, or PNG).');
      return;
    }

    setIsLoading(true);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });
      payload.append('document', selectedFile);

      await registerTeacher(payload);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Teacher registration failed. Please review the form fields.');
      if (err.errors) {
        setFieldErrors(err.errors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#f7f9fc]">
        <div className="card-theme max-w-lg w-full p-8 sm:p-10 shadow-xl text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#fff1a8] text-[#d97706] border border-[#fde68a] flex items-center justify-center shadow-xs">
            <Clock className="w-9 h-9" />
          </div>
          <h2 className="font-heading text-2xl font-extrabold text-[#111318]">
            Registration Submitted!
          </h2>
          <div className="p-4 rounded-2xl bg-[#fff1a8]/30 border border-[#ffe3d1] text-[#5b6270] text-sm leading-relaxed text-left space-y-2">
            <p className="font-semibold text-[#111318] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#f26a0f]" /> Account Status: Pending Verification
            </p>
            <p>
              Your profile and uploaded <strong>{formData.document_type}</strong> have been submitted to our administration team for review.
            </p>
            <p className="text-xs text-[#5b6270]">
              For student safety and trust, only verified teachers can appear in public searches, apply for parent tutor requests, and send messages.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/login"
              className="btn-pill-blue flex-1 py-3 px-4 text-center font-bold text-sm"
            >
              Go to Login
            </Link>
            <Link
              href="/"
              className="flex-1 py-3 px-4 rounded-full border border-[#e8ecf2] text-[#5b6270] font-semibold text-sm hover:bg-[#f7f9fc] text-center transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 bg-[#f7f9fc]">
      <div className="max-w-3xl mx-auto card-theme p-8 sm:p-12 shadow-lg space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 bg-[#d9f5c9] border border-[#c2eeb0] rounded-2xl flex items-center justify-center text-[#1e6b20] shadow-xs mb-3">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="font-heading text-3xl font-extrabold text-[#111318] tracking-tight">
            Register as a Tuition Teacher
          </h1>
          <p className="text-[#5b6270] text-sm max-w-lg mx-auto">
            Provide your academic credentials and verification document to join Nepal&apos;s trusted tutor network.
          </p>
        </div>

        {/* Verification Notice Banner */}
        <div className="p-4 rounded-2xl bg-[#fff1a8]/30 border border-[#ffe3d1] flex items-start gap-3 text-[#5b6270] text-xs sm:text-sm">
          <Clock className="w-5 h-5 shrink-0 mt-0.5 text-[#f26a0f]" />
          <div>
            <strong className="font-semibold block text-[#111318]">Mandatory Verification Notice</strong>
            New teachers start as <em>Pending</em>. An admin will review your uploaded ID document (Citizenship, License, etc.) before your profile goes live.
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h2 className="font-heading text-lg font-bold text-[#111318] border-b border-[#e8ecf2] pb-2">
              1. Personal Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#111318] uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm text-[#111318] font-medium focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff]"
                />
                {fieldErrors.name && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.name[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111318] uppercase tracking-wider mb-1">
                  Email Address * (Unique)
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="ramesh.sharma@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm text-[#111318] font-medium focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff]"
                />
                {fieldErrors.email && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.email[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111318] uppercase tracking-wider mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+977-98XXXXXXXX"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm text-[#111318] font-medium focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff]"
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.phone[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111318] uppercase tracking-wider mb-1">
                  Preferred City / Region *
                </label>
                <select
                  name="location_city"
                  value={formData.location_city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm text-[#111318] font-medium focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] bg-white"
                >
                  {nepalCities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111318] uppercase tracking-wider mb-1">
                  Permanent Address *
                </label>
                <input
                  type="text"
                  name="permanent_address"
                  required
                  value={formData.permanent_address}
                  onChange={handleInputChange}
                  placeholder="e.g. Lalitpur-3, Pulchowk"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm text-[#111318] font-medium focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff]"
                />
                {fieldErrors.permanent_address && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.permanent_address[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111318] uppercase tracking-wider mb-1">
                  Temporary / Current Address *
                </label>
                <input
                  type="text"
                  name="temporary_address"
                  required
                  value={formData.temporary_address}
                  onChange={handleInputChange}
                  placeholder="e.g. New Baneshwor, Kathmandu"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm text-[#111318] font-medium focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff]"
                />
                {fieldErrors.temporary_address && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.temporary_address[0]}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Qualifications & Experience */}
          <div className="space-y-4 pt-2">
            <h2 className="font-heading text-lg font-bold text-[#111318] border-b border-[#e8ecf2] pb-2">
              2. Qualifications &amp; Teaching Specialties
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#111318] uppercase tracking-wider mb-1">
                  Highest Qualification *
                </label>
                <input
                  type="text"
                  name="qualification"
                  required
                  value={formData.qualification}
                  onChange={handleInputChange}
                  placeholder="e.g. M.Sc. in Mathematics, TU"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm text-[#111318] font-medium focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111318] uppercase tracking-wider mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="experience_years"
                  min="0"
                  max="40"
                  value={formData.experience_years}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm text-[#111318] font-medium focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#111318] uppercase tracking-wider mb-1">
                  Experience Summary *
                </label>
                <input
                  type="text"
                  name="experience"
                  required
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="e.g. 5+ years teaching SEE Mathematics & +2 Physics in top colleges"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm text-[#111318] font-medium focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111318] uppercase tracking-wider mb-1">
                  Subjects Taught *
                </label>
                <input
                  type="text"
                  name="subjects"
                  required
                  value={formData.subjects}
                  onChange={handleInputChange}
                  placeholder="e.g. Mathematics, Science, English"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm text-[#111318] font-medium focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111318] uppercase tracking-wider mb-1">
                  Target Grade Levels *
                </label>
                <input
                  type="text"
                  name="grade_levels"
                  required
                  value={formData.grade_levels}
                  onChange={handleInputChange}
                  placeholder="e.g. Grade 8, Grade 10 (SEE), +2 Science"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm text-[#111318] font-medium focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111318] uppercase tracking-wider mb-1">
                  Expected Hourly Rate (NPR / Hour)
                </label>
                <input
                  type="number"
                  name="hourly_rate"
                  value={formData.hourly_rate}
                  onChange={handleInputChange}
                  placeholder="e.g. 700"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm text-[#111318] font-medium focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#111318] uppercase tracking-wider mb-1">
                  Short Bio / Teaching Philosophy
                </label>
                <textarea
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Briefly describe your teaching methodology, conceptual approach, and background..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm text-[#111318] font-medium focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Verification Document Upload */}
          <div className="space-y-4 pt-2">
            <h2 className="font-heading text-lg font-bold text-[#111318] border-b border-[#e8ecf2] pb-2">
              3. Verification Document Upload
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#111318] uppercase tracking-wider mb-1">
                  Select Document Type *
                </label>
                <select
                  name="document_type"
                  value={formData.document_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm text-[#111318] font-medium focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] bg-white"
                >
                  {documentTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111318] uppercase tracking-wider mb-1">
                  Attach Document (PDF, JPG, PNG - Max 5MB) *
                </label>
                <div className="relative border-2 border-dashed border-[#e8ecf2] hover:border-[#0a5cff] rounded-xl p-3 text-center transition-colors">
                  <input
                    type="file"
                    required
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#5b6270]">
                    <UploadCloud className="w-5 h-5 text-[#0a5cff]" />
                    <span>{selectedFile ? selectedFile.name : 'Choose file or drag & drop'}</span>
                  </div>
                </div>
                {selectedFile && (
                  <p className="text-xs text-[#22c55e] mt-1 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready for upload ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Security Credentials */}
          <div className="space-y-4 pt-2">
            <h2 className="font-heading text-lg font-bold text-[#111318] border-b border-[#e8ecf2] pb-2">
              4. Security &amp; Password
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#111318] uppercase tracking-wider mb-1">
                  Create Password * (Min 6 chars)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm text-[#111318] font-medium focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111318] uppercase tracking-wider mb-1">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirm_password"
                  required
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8ecf2] text-sm text-[#111318] font-medium focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff]"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-pill-yellow w-full py-4 px-6 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-[#111318]/30 border-t-[#111318] rounded-full animate-spin" />
            ) : (
              <>
                Submit Teacher Application
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-sm text-[#5b6270] pt-2 border-t border-[#e8ecf2]">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-[#0a5cff] hover:underline">
            Log In here
          </Link>
        </div>
      </div>
    </div>
  );
}
