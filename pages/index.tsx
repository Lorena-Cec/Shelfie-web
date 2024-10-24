import { auth } from '@/lib/firebaseConfig';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import React from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser;

      if (user) {
        router.push('/home');
      } else {
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-orange-700">
      <h1 className="text-4xl font-bold open-sans text-brown-100 mb-4 tracking-tighter">
        Welcome to Shelfie!
      </h1>
      <p className="text-lg text-brown-400">
        Find and organize your favorite books in one place.
      </p>
    </div>
  );
}
