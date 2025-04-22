'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // NOTE: new in app directory
import Cookies from 'js-cookie';

const Navbar: React.FC = () => {
  const router = useRouter();

  // Move inside component function:
  const userId = Cookies.get('user');
  const [username, setUsername] = useState<string>('');

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  
  useEffect(() => {
    // Fetch username once on mount or userId change
    const fetchUsername = async () => {
      if (userId) {
        try {
          const res = await fetch(`/api/user?id=${userId}`);
          if (res.ok) {
            const data = await res.json();
            console.log(data);
            setUsername(data.user.username || '');
          }
        } catch (error) {
          console.error('Error fetching username:', error);
        }
      }
    };

    fetchUsername();
  }, [userId]);

  useEffect(() => {
    const sessionToken = Cookies.get('authToken');
    setIsLoggedIn(!!sessionToken);
  }, []);

  const handleLogout = () => {
    Cookies.remove('authToken');
    Cookies.remove('userToken');
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <nav className="bg-blue-900 p-4 flex justify-between items-center text-white font-sans">
      <div className="font-bold text-xl">
        StackScope {isLoggedIn && username ? `– Welcome, ${username}` : ''}
      </div>
      <div className="flex space-x-4">
        {isLoggedIn ? (
          <>
            <Link href="/homepage">
              Manager
            </Link>
            <span className="text-gray-400">|</span>
            <Link href="/">
              Home
            </Link>
            <span className="text-gray-400">|</span>
            <button
              onClick={handleLogout}
              className="hover:underline cursor-pointer bg-transparent border-none p-0"
              aria-label="Logout"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/">
              Home
            </Link>
            <span className="text-gray-400">|</span>
            <Link href="/preview">
              Preview
            </Link>
            <span className="text-gray-400">|</span>
            <Link href="/login">
              Login / Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;