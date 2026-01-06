import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { PatientProvider } from '@/context/PatientContext';
import { ToastProvider } from '@/components/ui';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
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
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
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
