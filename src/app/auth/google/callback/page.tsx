"use client";
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('accessToken', token);
      router.replace('/home/myProjects');
    } else {
      router.replace('/auth/login?error=google_auth_failed');
    }
  }, [router, searchParams]);

  return null;
}
