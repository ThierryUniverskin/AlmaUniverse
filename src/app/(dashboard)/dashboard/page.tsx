'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui';

export default function DashboardPage() {

  return (
    <div className="h-full relative overflow-hidden">
      {/* Hero Section with Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/dashboard-hero.png"
          alt=""
          fill
          className="object-cover object-[25%_15%] scale-110 origin-left"
          priority
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/5 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center px-10 lg:px-16 max-w-2xl">
        <h1 className="text-4xl lg:text-5xl font-medium text-stone-900 !leading-[1.3] mb-6">
          Your Professional Platform for Clinical Documentation & Skin Wellness
        </h1>
        <p className="text-lg text-stone-600 mb-8 leading-relaxed">
          Support physician-directed treatments and independent cosmetic skin care personalization.
        </p>
        <div>
          <Link href="/patients/new">
            <Button size="lg">
              Start Clinical Documentation
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
