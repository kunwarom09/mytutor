import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { Navbar } from '@/components/Navbar';

import { Suspense } from 'react';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MyTutor - Tuition Marketplace in Nepal',
  description: 'Connect with verified tuition teachers and explore home and online tuition opportunities in Kathmandu, Lalitpur, Pokhara and across Nepal.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full antialiased ${plusJakarta.variable} ${inter.variable}`}>
      <body className={`${inter.className} min-h-screen flex flex-col bg-white text-[#5b6270]`}>
        <AuthProvider>
          <Suspense fallback={<div className="h-16 bg-white border-b border-slate-200" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1">
            <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
              {children}
            </Suspense>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
