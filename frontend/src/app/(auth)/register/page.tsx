import React from 'react';
import Link from 'next/link';
import { GraduationCap, BookOpen, ArrowRight, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';

export default function RegisterChoicePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-[#f7f9fc]">
      <div className="max-w-4xl w-full space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2">
            <span className="eyebrow-label flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#f26a0f]" />
              Nepal&apos;s Trusted Tuition Marketplace
            </span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-[#111318] tracking-tight">
            Join <span className="text-[#0a5cff]">MyTutor</span> Today
          </h1>
          <p className="text-[#5b6270] text-lg max-w-xl mx-auto">
            Choose your account type to get started. Whether you&apos;re looking to teach or learn, we&apos;ve got you covered.
          </p>
        </div>

        {/* Two Main Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Teacher */}
          <div className="card-theme p-8 sm:p-10 hover:shadow-[0_8px_30px_rgba(20,40,90,0.09)] transition-all flex flex-col justify-between">
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-[#d9f5c9] text-[#1e6b20] border border-[#c2eeb0] flex items-center justify-center shadow-xs">
                <GraduationCap className="w-8 h-8" />
              </div>
              
              <div>
                <span className="eyebrow-label block">
                  For Educators &amp; Tutors
                </span>
                <h2 className="font-heading text-2xl font-bold text-[#111318] mt-1">
                  I Want to Teach
                </h2>
                <p className="text-[#5b6270] text-sm mt-2 leading-relaxed">
                  Join Nepal&apos;s premier tuition network. Get verified with your ID document, browse parent tutor requests, and earn on your schedule.
                </p>
              </div>

              <ul className="space-y-2.5 text-sm text-[#5b6270]">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                  <span>Browse open tutor requests in Kathmandu, Lalitpur, Pokhara</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                  <span>Set your own hourly rate &amp; subjects</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                  <span>Verified teacher badge builds parent trust</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-[#e8ecf2]">
              <Link
                href="/register/teacher"
                className="btn-pill-yellow w-full py-3.5 px-6 font-bold text-center flex items-center justify-center gap-2 text-sm"
              >
                Register as a Teacher
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Parent */}
          <div className="card-theme p-8 sm:p-10 hover:shadow-[0_8px_30px_rgba(20,40,90,0.09)] transition-all flex flex-col justify-between">
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-[#dbe8ff] text-[#0a5cff] border border-[#b8d2ff] flex items-center justify-center shadow-xs">
                <BookOpen className="w-8 h-8" />
              </div>
              
              <div>
                <span className="eyebrow-label block">
                  For Parents &amp; Students
                </span>
                <h2 className="font-heading text-2xl font-bold text-[#111318] mt-1">
                  I Need a Tutor
                </h2>
                <p className="text-[#5b6270] text-sm mt-2 leading-relaxed">
                  Find verified home or online tutors for your children across all school grades (Primary to +2 / SEE) and subjects.
                </p>
              </div>

              <ul className="space-y-2.5 text-sm text-[#5b6270]">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0a5cff] shrink-0" />
                  <span>Post customized tutor requests with your budget</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0a5cff] shrink-0" />
                  <span>Browse and compare verified teacher profiles</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0a5cff] shrink-0" />
                  <span>Direct in-app messaging to discuss schedule &amp; demos</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-[#e8ecf2]">
              <Link
                href="/register/parent"
                className="btn-pill-blue w-full py-3.5 px-6 font-bold text-center flex items-center justify-center gap-2 text-sm"
              >
                Register as a Parent
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Existing User Login Prompt */}
        <div className="text-center pt-4">
          <p className="text-[#5b6270] text-sm">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-[#0a5cff] hover:underline">
              Log in to your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
