'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear login state
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPassword');

    // Redirect to login page
    router.push('/login');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl text-gray-700">Logging out...</p>
    </div>
  );
}
