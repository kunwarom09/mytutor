'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Menu, X, LogOut, MessageSquare, GraduationCap, ArrowRight } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Top Navigation Bar */}
      <div className="border-b border-[#e8ecf2] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#0a5cff] text-white flex items-center justify-center shadow-md shadow-[#0a5cff]/20 transition-transform group-hover:scale-105">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="font-heading font-black text-2xl text-[#111318] tracking-tight">
                MyTutor
              </span>
            </Link>

            {/* Centered Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 lg:gap-10 font-heading text-[15px] font-semibold">
              <Link
                href="/"
                className={`transition-colors py-1 ${
                  isActive('/') 
                    ? 'text-[#0a5cff] font-bold' 
                    : 'text-[#5b6270] hover:text-[#111318]'
                }`}
              >
                Home
              </Link>

              <Link
                href="/teachers"
                className={`transition-colors py-1 ${
                  isActive('/teachers') 
                    ? 'text-[#0a5cff] font-bold' 
                    : 'text-[#5b6270] hover:text-[#111318]'
                }`}
              >
                Find Tutors
              </Link>

              <Link
                href="/requests"
                className={`transition-colors py-1 ${
                  isActive('/requests') 
                    ? 'text-[#0a5cff] font-bold' 
                    : 'text-[#5b6270] hover:text-[#111318]'
                }`}
              >
                Tutor Request
              </Link>

              {user?.role === 'parent' && (
                <Link
                  href="/parent/requests/create"
                  className={`transition-colors py-1 ${
                    isActive('/parent/requests/create') 
                      ? 'text-[#0a5cff] font-bold' 
                      : 'text-[#5b6270] hover:text-[#111318]'
                  }`}
                >
                  Post Request
                </Link>
              )}

              {user?.role === 'teacher' && (
                <Link
                  href="/teacher/opportunities"
                  className={`transition-colors py-1 ${
                    isActive('/teacher/opportunities') 
                      ? 'text-[#0a5cff] font-bold' 
                      : 'text-[#5b6270] hover:text-[#111318]'
                  }`}
                >
                  Opportunities
                </Link>
              )}

              {user?.role === 'admin' && (
                <Link
                  href="/admin/dashboard"
                  className={`transition-colors py-1 ${
                    isActive('/admin/dashboard') 
                      ? 'text-[#0a5cff] font-bold' 
                      : 'text-[#5b6270] hover:text-[#111318]'
                  }`}
                >
                  Admin Panel
                </Link>
              )}
            </nav>

            {/* Right Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/messages"
                    title="Messages"
                    className={`p-2.5 rounded-full border transition-colors ${
                      isActive('/messages')
                        ? 'border-[#0a5cff] bg-[#dbe8ff] text-[#0a5cff]'
                        : 'border-[#e8ecf2] text-[#5b6270] hover:bg-[#f7f9fc] hover:text-[#111318]'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5" />
                  </Link>

                  <Link
                    href={
                      user.role === 'admin'
                        ? '/admin/dashboard'
                        : user.role === 'teacher'
                        ? '/teacher/profile'
                        : '/parent/requests'
                    }
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#f7f9fc] hover:bg-[#e8ecf2] border border-[#e8ecf2] text-[#111318] text-sm font-semibold transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
                  </Link>

                  <button
                    onClick={() => logout()}
                    className="btn-pill-white text-xs py-2 px-4 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-5">
                  <Link
                    href="/login"
                    className="font-heading text-sm font-bold text-[#111318] hover:text-[#0a5cff] transition-colors"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    className="btn-pill-blue text-sm shadow-md shadow-[#0a5cff]/20"
                  >
                    Sign up Free
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#111318] hover:text-[#0a5cff] focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Yellow Top Announcement Strip */}
      <div className="w-full bg-[#ffd23f] text-[#111318] py-2 px-4 text-center text-xs sm:text-sm font-semibold tracking-wide border-b border-[#f0c530]">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span>Are you a university or school student for an online tutoring partnership?</span>
          <Link href="/requests" className="text-[#0a5cff] underline font-bold hover:text-[#004bd9] inline-flex items-center gap-0.5">
            Talk to us <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#e8ecf2] bg-white px-6 pt-4 pb-6 space-y-3 font-heading text-base font-semibold">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 ${isActive('/') ? 'text-[#0a5cff]' : 'text-[#111318]'}`}
          >
            Home
          </Link>
          <Link
            href="/teachers"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 ${isActive('/teachers') ? 'text-[#0a5cff]' : 'text-[#111318]'}`}
          >
            Find Tutors
          </Link>
          <Link
            href="/requests"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 ${isActive('/requests') ? 'text-[#0a5cff]' : 'text-[#111318]'}`}
          >
            Tutor Request
          </Link>

          {user ? (
            <div className="pt-3 border-t border-[#e8ecf2] space-y-3">
              <div className="text-sm text-[#5b6270]">
                Signed in as <span className="font-bold text-[#111318]">{user.name}</span>
              </div>
              {user.role === 'parent' && (
                <Link
                  href="/parent/requests/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-[#111318] hover:text-[#0a5cff]"
                >
                  Post Request
                </Link>
              )}
              {user.role === 'teacher' && (
                <Link
                  href="/teacher/opportunities"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-[#111318] hover:text-[#0a5cff]"
                >
                  Opportunities
                </Link>
              )}
              {user.role === 'admin' && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-[#111318] hover:text-[#0a5cff]"
                >
                  Admin Panel
                </Link>
              )}
              <Link
                href="/messages"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-[#111318] hover:text-[#0a5cff]"
              >
                Messages
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="block w-full text-left py-2 text-rose-600 font-bold"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-[#e8ecf2] flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-pill-white text-center text-sm py-2.5"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-pill-blue text-center text-sm py-2.5"
              >
                Sign up Free
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
