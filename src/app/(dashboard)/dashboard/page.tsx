'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui';
import { Header } from '@/components/layout/Header';

export default function DashboardPage() {

  return (
    <div className="h-full relative overflow-hidden">
      <Header />
      {/* Hero Section with Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/iStock-2097461666.jpg"
          alt=""
          fill
          className="object-cover object-[25%_15%] scale-110 origin-left"
          priority
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-10 lg:px-16 max-w-3xl mx-auto">
        <Image
          src="/images/logo_white.svg"
          alt="Alma Universe"
          width={180}
          height={50}
          className="mb-6"
        />
        <h1 className="text-3xl lg:text-4xl font-medium text-white !leading-[1.3] mb-5">
          Your Professional Platform for Clinical Documentation & Skin Wellness
        </h1>
        <p className="text-lg text-white/70 mb-8 leading-relaxed">
          Support physician-directed treatments and independent cosmetic skin care personalization.
        </p>
        <div>
          <Link href="/patients/new">
            <Button size="lg" className="rounded-full px-8">
              Start a New Clinical Documentation
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
