import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { PatientProvider } from '@/context/PatientContext';
import { ToastProvider } from '@/components/ui';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
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
    <html lang="en" className={montserrat.variable}>
      <body className={montserrat.className}>
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
