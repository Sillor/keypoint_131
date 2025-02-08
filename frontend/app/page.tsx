'use client';
'useEffect';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const RedirectHandler = () => {
  const router = useRouter();

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (token) {
      router.replace('/pages/main/projects');
    } else {
      router.replace('/pages/auth/login');
    }
  }, [router]);

  return null; // This component does not render anything
};

export default RedirectHandler;
