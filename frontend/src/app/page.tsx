import React from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  ShieldCheck, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  BookOpen, 
  Calculator,
  Atom,
  Languages,
  Code,
  DollarSign,
  Globe2,
  Calendar,
  Star
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-white">
        
        {/* Floating Decorative Graphics */}
        <div className="absolute top-12 left-10 w-44 h-44 rounded-full bg-[#c9f3f0]/50 blur-2xl pointer-events-none -z-10" />
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-[#fff1a8]/60 blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-1/3 w-16 h-16 rounded-full bg-[#e8ecf2] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            
            {/* Left Column: Heading, Copy, Pill CTAs */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Orange Eyebrow */}
              <div className="inline-block">
                <span className="eyebrow-label">
                  Nepal&apos;s #1 Verified Tuition Marketplace
                </span>
              </div>

              {/* Large Geometric Heading with Yellow Underline & Blue Doodle */}
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-[62px] font-extrabold text-[#111318] leading-[1.08] tracking-tight">
                Find the Perfect Tutor for Your Child in{' '}
                <span className="relative inline-block text-[#111318]">
                  Nepal
                  {/* Hand-drawn yellow underline SVG */}
                  <svg 
                    className="absolute -bottom-2.5 left-0 w-full h-4 overflow-visible" 
                    viewBox="0 0 160 14" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M3 10C45 3 115 3 157 8" 
                      stroke="#ffd23f" 
                      strokeWidth="6" 
                      strokeLinecap="round" 
                    />
                  </svg>
                </span>
                {/* Blue 3-loop doodle */}
                <svg 
                  className="inline-block ml-3 -mt-6 w-9 h-9 text-[#0a5cff]" 
                  viewBox="0 0 32 32" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                >
                  <path d="M4 22c2-8 7-12 11-8s-1 12-5 12c-4 0-1-9 5-13s12-1 13 5" />
                </svg>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#5b6270] max-w-xl font-normal leading-relaxed">
                Connect with government ID-verified tuition teachers for SEE, +2, and school grades. 
                Home visits or interactive online tuition in Kathmandu, Lalitpur, Pokhara, and Bhaktapur.
              </p>

              {/* CTAs: Yellow pill + Secondary round blue play-style button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-3">
                <Link
                  href="/register/parent"
                  className="btn-pill-yellow text-base px-8 py-3.5 shadow-md shadow-[#ffd23f]/30"
                >
                  Post a Tutor Request
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  href="/register/teacher"
                  className="flex items-center gap-3.5 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-[#dbe8ff] text-[#0a5cff] flex items-center justify-center transition-all group-hover:scale-105 group-hover:bg-[#c9e0ff] shadow-sm">
                    <GraduationCap className="w-5 h-5 text-[#0a5cff]" />
                  </div>
                  <span className="font-heading font-bold text-[#111318] text-sm group-hover:text-[#0a5cff] transition-colors">
                    Become a Tutor
                  </span>
                </Link>
              </div>

              {/* Key Trust Signals with Pastel Tiles */}
              <div className="pt-6 flex flex-wrap items-center gap-5 sm:gap-8 text-xs sm:text-sm text-[#5b6270] font-semibold">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#d9f5c9] text-[#16a34a] flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>Admin Verified Documents</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#dbe8ff] text-[#0a5cff] flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>Zero Commission on First Match</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#e8dcff] text-[#7c3aed] flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span>Direct In-App Chat</span>
                </div>
              </div>
            </div>

            {/* Right Column: 2x2 Geometric Cutout Collage with Decorative Graphics */}
            <div className="lg:col-span-5 relative">
              
              {/* Floating Decorative Shapes */}
              {/* Soft Yellow Circle */}
              <div className="absolute -top-10 -right-8 w-44 h-44 rounded-full bg-[#fff1a8]/70 pointer-events-none -z-10" />
              {/* Soft Teal Circle */}
              <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-[#c9f3f0]/80 pointer-events-none -z-10" />
              
              {/* Hand-drawn Blue Squiggle Top Right */}
              <svg 
                className="absolute -top-6 right-8 w-14 h-10 text-[#0a5cff] pointer-events-none z-20" 
                viewBox="0 0 48 32" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              >
                <path d="M4 16c6-10 12-10 18 0s12 10 18 0" />
              </svg>

              {/* Outlined Yellow Triangle / Square Bottom Right */}
              <svg 
                className="absolute top-1/2 -right-6 w-9 h-9 text-[#ffd23f] pointer-events-none z-20 rotate-12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="4" />
              </svg>

              {/* Hand-drawn Blue Squiggle Bottom Left */}
              <svg 
                className="absolute -bottom-6 left-12 w-14 h-8 text-[#0a5cff] pointer-events-none z-20" 
                viewBox="0 0 48 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              >
                <path d="M4 14c5-8 10-8 15 0s10 8 15 0" />
              </svg>

              {/* 2x2 Collage Grid */}
              <div className="grid grid-cols-2 gap-4 sm:gap-5 relative z-10">
                
                {/* Photo 1: Dome Cutout with Blue Pastel Background */}
                <div className="h-52 sm:h-56 bg-[#dbe8ff] img-cutout-dome overflow-hidden shadow-sm hover:scale-[1.02] transition-transform flex items-center justify-center p-2">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80"
                    alt="Student with books"
                    className="w-full h-full object-cover img-cutout-dome"
                  />
                </div>

                {/* Photo 2: Rounded 3xl with Peach Pastel Background */}
                <div className="h-52 sm:h-56 bg-[#ffe3d1] rounded-3xl overflow-hidden shadow-sm hover:scale-[1.02] transition-transform flex items-center justify-center p-2">
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80"
                    alt="Student smiling"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>

                {/* Photo 3: Rounded 3xl with Yellow Pastel Background */}
                <div className="h-52 sm:h-56 bg-[#fff1a8] rounded-3xl overflow-hidden shadow-sm hover:scale-[1.02] transition-transform flex items-center justify-center p-2">
                  <img
                    src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=500&q=80"
                    alt="Young student with glasses"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>

                {/* Photo 4: Rounded Bottom Pill with Teal Pastel Background */}
                <div className="h-52 sm:h-56 bg-[#c9f3f0] img-cutout-pill overflow-hidden shadow-sm hover:scale-[1.02] transition-transform flex items-center justify-center p-2">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80"
                    alt="Friendly student"
                    className="w-full h-full object-cover img-cutout-pill"
                  />
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FULL-WIDTH BLUE STATS BAND */}
      <section className="bg-[#0a5cff] text-white py-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/20 text-center">
            
            <div className="p-4 sm:p-6">
              <div className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight">870</div>
              <div className="text-white/85 text-sm sm:text-base font-medium mt-1">Expert tutors</div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight">20,000+</div>
              <div className="text-white/85 text-sm sm:text-base font-medium mt-1">Hours tutored</div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight">298</div>
              <div className="text-white/85 text-sm sm:text-base font-medium mt-1">Subjects and courses</div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight">72,920</div>
              <div className="text-white/85 text-sm sm:text-base font-medium mt-1">Active students</div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. ACTIVE LOCATIONS STRIP */}
      <section className="py-10 bg-white border-b border-[#e8ecf2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <span className="font-heading text-sm font-bold text-[#111318] uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0a5cff]" /> Serving Active Locations:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan', 'Biratnagar', 'Butwal'].map((city) => (
                <span
                  key={city}
                  className="px-4 py-1.5 rounded-full bg-[#f7f9fc] hover:bg-[#dbe8ff] hover:text-[#0a5cff] border border-[#e8ecf2] text-[#111318] text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. BENEFITS SECTION ("Why Parents & Teachers Choose MyTutor") */}
      <section className="py-24 bg-[#f7f9fc] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="eyebrow-label">WHY CHOOSE US</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#111318] tracking-tight">
              Why Parents &amp; Teachers Choose MyTutor
            </h2>
            <p className="text-[#5b6270] text-base leading-relaxed">
              A transparent, safe, and modern platform designed specifically for education in Nepal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Benefit Card 1 */}
            <div className="card-theme p-8 space-y-4 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl tile-blue flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-[#0a5cff]" />
              </div>
              <h3 className="font-heading text-xl font-bold text-[#111318]">
                100% ID Verified Teachers
              </h3>
              <p className="text-[#5b6270] text-sm leading-relaxed">
                Every teacher must submit a government document (Citizenship Card, Driving License, Passport, or NID) verified by our team before they can teach.
              </p>
            </div>

            {/* Benefit Card 2 */}
            <div className="card-theme p-8 space-y-4 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl tile-green flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-[#16a34a]" />
              </div>
              <h3 className="font-heading text-xl font-bold text-[#111318]">
                Custom Tutor Requests
              </h3>
              <p className="text-[#5b6270] text-sm leading-relaxed">
                Parents specify subject, grade, preferred schedule, and monthly budget. Interested, qualified tutors apply directly with their teaching proposal.
              </p>
            </div>

            {/* Benefit Card 3 */}
            <div className="card-theme p-8 space-y-4 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl tile-purple flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-[#7c3aed]" />
              </div>
              <h3 className="font-heading text-xl font-bold text-[#111318]">
                Secure In-App Chat
              </h3>
              <p className="text-[#5b6270] text-sm leading-relaxed">
                Communicate safely inside the app without sharing personal numbers upfront. Discuss learning goals, syllabi, and book a free demo session.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. FEATURE / SCHEDULE SECTION */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left: Image Card with Teal Background + Yellow Circular Badge */}
            <div className="lg:col-span-6 relative">
              <div className="bg-[#c9f3f0] rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=700&q=80"
                  alt="Student with laptop"
                  className="rounded-2xl w-full h-[360px] object-cover"
                />

                {/* Hand-drawn blue squiggle decor */}
                <svg 
                  className="absolute top-4 left-4 w-14 h-8 text-[#0a5cff] pointer-events-none" 
                  viewBox="0 0 48 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                >
                  <path d="M4 14c5-8 10-8 15 0s10 8 15 0" />
                </svg>

                {/* Circular Yellow Badge */}
                <div className="absolute -bottom-2 right-6 w-24 h-24 rounded-full bg-[#ffd23f] border-4 border-white shadow-lg flex flex-col items-center justify-center text-center p-2">
                  <Calendar className="w-6 h-6 text-[#111318]" />
                  <span className="text-[10px] font-bold text-[#111318] mt-0.5">Flexible</span>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div className="lg:col-span-6 space-y-6">
              <span className="eyebrow-label">CUSTOMIZE WITH YOUR SCHEDULE</span>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#111318] tracking-tight leading-tight">
                Personalized Professional Online Tutor on Your Schedule
              </h2>
              <p className="text-[#5b6270] text-base leading-relaxed">
                Our scheduling system allows you to select based on your free time. Keep track of your student&apos;s class and tutoring schedules, and never miss your lectures. The best online class scheduling system with easy accessibility.
              </p>
              <div>
                <Link href="/requests" className="btn-pill-yellow text-sm font-bold">
                  Get started
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. SUBJECTS GRID (4 cols x 2 rows with pastel tiles) */}
      <section className="py-24 bg-[#f7f9fc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="eyebrow-label">OUR TUTOR SUBJECTS</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#111318] tracking-tight">
              Find Online Tutor in Any Subject
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            
            <div className="card-theme p-4 flex items-center gap-3.5 hover:-translate-y-1 transition-transform cursor-pointer">
              <div className="w-11 h-11 rounded-xl tile-blue flex items-center justify-center shrink-0">
                <Calculator className="w-5 h-5 text-[#0a5cff]" />
              </div>
              <span className="font-heading font-bold text-[#111318] text-sm sm:text-base">Mathematics</span>
            </div>

            <div className="card-theme p-4 flex items-center gap-3.5 hover:-translate-y-1 transition-transform cursor-pointer">
              <div className="w-11 h-11 rounded-xl tile-green flex items-center justify-center shrink-0">
                <Atom className="w-5 h-5 text-[#16a34a]" />
              </div>
              <span className="font-heading font-bold text-[#111318] text-sm sm:text-base">Physics &amp; Science</span>
            </div>

            <div className="card-theme p-4 flex items-center gap-3.5 hover:-translate-y-1 transition-transform cursor-pointer">
              <div className="w-11 h-11 rounded-xl tile-purple flex items-center justify-center shrink-0">
                <Languages className="w-5 h-5 text-[#7c3aed]" />
              </div>
              <span className="font-heading font-bold text-[#111318] text-sm sm:text-base">English &amp; Grammar</span>
            </div>

            <div className="card-theme p-4 flex items-center gap-3.5 hover:-translate-y-1 transition-transform cursor-pointer">
              <div className="w-11 h-11 rounded-xl tile-teal flex items-center justify-center shrink-0">
                <Code className="w-5 h-5 text-[#0d9488]" />
              </div>
              <span className="font-heading font-bold text-[#111318] text-sm sm:text-base">Computer Science</span>
            </div>

            <div className="card-theme p-4 flex items-center gap-3.5 hover:-translate-y-1 transition-transform cursor-pointer">
              <div className="w-11 h-11 rounded-xl tile-peach flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5 text-[#ea580c]" />
              </div>
              <span className="font-heading font-bold text-[#111318] text-sm sm:text-base">Accountancy</span>
            </div>

            <div className="card-theme p-4 flex items-center gap-3.5 hover:-translate-y-1 transition-transform cursor-pointer">
              <div className="w-11 h-11 rounded-xl tile-yellow flex items-center justify-center shrink-0">
                <Globe2 className="w-5 h-5 text-[#ca8a04]" />
              </div>
              <span className="font-heading font-bold text-[#111318] text-sm sm:text-base">Social Studies</span>
            </div>

            <div className="card-theme p-4 flex items-center gap-3.5 hover:-translate-y-1 transition-transform cursor-pointer">
              <div className="w-11 h-11 rounded-xl tile-blue flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-[#0a5cff]" />
              </div>
              <span className="font-heading font-bold text-[#111318] text-sm sm:text-base">SEE &amp; +2 Preparation</span>
            </div>

            <Link href="/teachers" className="card-theme p-4 flex items-center gap-3.5 hover:-translate-y-1 transition-transform cursor-pointer">
              <div className="w-11 h-11 rounded-xl bg-[#e8ecf2] text-[#111318] flex items-center justify-center shrink-0">
                <ArrowRight className="w-5 h-5" />
              </div>
              <span className="font-heading font-bold text-[#0a5cff] text-sm sm:text-base">See all</span>
            </Link>

          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS SECTION */}
      <section className="py-24 bg-white relative overflow-hidden">
        
        {/* Floating Shapes */}
        <div className="absolute -top-10 left-12 w-12 h-12 text-[#ffd23f] pointer-events-none -rotate-12">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="12,2 22,20 2,20" />
          </svg>
        </div>
        <div className="absolute top-1/2 right-10 w-28 h-28 rounded-full bg-[#c9f3f0]/60 blur-xl pointer-events-none" />
        <div className="absolute bottom-10 left-8 w-32 h-32 rounded-full bg-[#fff1a8]/60 blur-xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          
          <div className="space-y-3">
            <span className="eyebrow-label">OUR TESTIMONIALS</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#111318] tracking-tight">
              What Our Students Say About Us
            </h2>
          </div>

          {/* Row of circular avatars with active middle one ringed in blue */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
              alt="Student avatar 1"
              className="w-12 h-12 rounded-full object-cover opacity-60 hover:opacity-100 transition-opacity"
            />
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80"
                alt="Active student avatar"
                className="w-16 h-16 rounded-full object-cover ring-4 ring-[#0a5cff] shadow-lg"
              />
            </div>
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
              alt="Student avatar 3"
              className="w-12 h-12 rounded-full object-cover opacity-60 hover:opacity-100 transition-opacity"
            />
          </div>

          <div>
            <div className="font-heading font-bold text-lg text-[#111318]">Albert Monica</div>
            <div className="text-xs text-[#5b6270]">Student at College</div>
            <div className="flex items-center justify-center gap-1 mt-1 text-[#ffd23f]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#ffd23f] text-[#ffd23f]" />
              ))}
            </div>
          </div>

          {/* Centered quote with large faded quote marks */}
          <div className="relative max-w-2xl mx-auto px-10">
            <span className="absolute -top-8 left-0 text-7xl font-serif text-[#e8ecf2] select-none pointer-events-none">
              &ldquo;
            </span>
            <p className="text-base sm:text-lg text-[#5b6270] leading-relaxed italic">
              As a student of this online education website, I can confidently say that it has been an incredible experience. The platform is user-friendly and the courses are well-structured, making it easy for me to learn at my own pace.
            </p>
            <span className="absolute -bottom-10 right-0 text-7xl font-serif text-[#e8ecf2] select-none pointer-events-none">
              &rdquo;
            </span>
          </div>

        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="mt-auto bg-white border-t border-[#e8ecf2] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0a5cff] text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-heading font-black text-xl text-[#111318]">MyTutor.np</span>
          </div>
          <p className="text-sm text-[#5b6270]">
            &copy; 2026 MyTutor Nepal. All rights reserved. Built with pure OOP PHP &amp; Next.js.
          </p>
          <div className="flex items-center gap-6 text-sm font-semibold text-[#5b6270]">
            <Link href="/teachers" className="hover:text-[#0a5cff] transition-colors">Teachers</Link>
            <Link href="/requests" className="hover:text-[#0a5cff] transition-colors">Tutor Requests</Link>
            <Link href="/login" className="hover:text-[#0a5cff] transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
