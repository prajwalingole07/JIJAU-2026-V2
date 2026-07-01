"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSchoolStore } from '@/lib/store';

export default function Home() {
  const { currentUser, isLoaded } = useSchoolStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (currentUser) {
      if (currentUser.role === 'ADMIN' || currentUser.role === 'FOUNDER') {
        router.push('/admin');
      } else {
        router.push('/teacher');
      }
    } else {
      router.push('/login');
    }
  }, [currentUser, isLoaded, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <p className="text-primary font-medium">Connecting to Jijau School...</p>
      </div>
    </div>
  );
}