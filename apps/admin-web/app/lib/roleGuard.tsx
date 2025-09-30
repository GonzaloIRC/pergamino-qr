'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../providers';

export function useRequireAdmin() {
  const router = useRouter();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (role !== 'admin') {
        router.push('/login');
      }
    }
  }, [user, role, loading, router]);

  return { isAdmin: role === 'admin', loading };
}