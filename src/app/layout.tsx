import type { Metadata } from 'next';
import { DM_Sans, Fraunces } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { PatientProvider } from '@/context/PatientContext';
import { ToastProvider } from '@/components/ui';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Alma Universe',
  description: 'Premium clinical workflow management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body className={dmSans.className}>
        <AuthProvider>
          <PatientProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </PatientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
