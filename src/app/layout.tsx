import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { PatientProvider } from '@/context/PatientContext';
import { ToastProvider } from '@/components/ui';

const mont = localFont({
  src: [
    {
      path: '../../public/fonts/Mont_Trial-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Mont_Trial-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Mont_Trial-Book.woff2',
      weight: '450',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Mont_Trial-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Mont_Trial-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-mont',
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
    <html lang="en" className={mont.variable}>
      <body className={mont.className}>
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
