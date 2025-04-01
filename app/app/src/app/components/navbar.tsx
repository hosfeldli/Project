import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

'use client';

interface User {
    id: string;
    name: string;
    email: string;
    imageUrl: string;
}

const Navbar: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
                const response = await fetch(`${backendUrl}/api/getuser`, {
                    credentials: 'include', // Include cookies if using sessions
                });
                
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    console.error('Failed to fetch user data');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    // Close the profile popup when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Link href="/" className="text-xl font-bold">
                        My App
                    </Link>
                    <div className="hidden md:flex space-x-4">
                        <Link href="/" className="hover:text-gray-300">
                            Home
                        </Link>
                        <Link href="/about" className="hover:text-gray-300">
                            About
                        </Link>
                        <Link href="/services" className="hover:text-gray-300">
                            Services
                        </Link>
                    </div>
                </div>

                <div className="relative" ref={profileRef}>
                    {loading ? (
                        <div className="w-10 h-10 rounded-full bg-gray-600 animate-pulse"></div>
                    ) : user ? (
                        <>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="focus:outline-none"
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300">
                                    {user.imageUrl ? (
                                        <Image
                                            src={user.imageUrl}
                                            alt="User profile"
                                            width={40}
                                            height={40}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-500 flex items-center justify-center">
                                            <span>{user.name?.charAt(0) || 'U'}</span>
                                        </div>
                                    )}
                                </div>
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white text-gray-800 rounded-lg shadow-lg py-2 z-10">
                                    <div className="px-4 py-3 border-b border-gray-200">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 rounded-full overflow-hidden">
                                                {user.imageUrl ? (
                                                    <Image
                                                        src={user.imageUrl}
                                                        alt="User profile"
                                                        width={48}
                                                        height={48}
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-500 flex items-center justify-center text-white">
                                                        <span>{user.name?.charAt(0) || 'U'}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-4 py-2">
                                        <Link
                                            href="/profile"
                                            className="block px-2 py-1 text-sm hover:bg-gray-100 rounded"
                                        >
                                            View Profile
                                        </Link>
                                        <Link
                                            href="/settings"
                                            className="block px-2 py-1 text-sm hover:bg-gray-100 rounded"
                                        >
                                            Settings
                                        </Link>
                                        <button
                                            className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded text-red-500"
                                            onClick={() => {
                                                // Add logout logic here
                                                console.log('Logout clicked');
                                            }}
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex space-x-4">
                            <Link href="/login" className="hover:text-gray-300">
                                Login
                            </Link>
                            <Link href="/register" className="hover:text-gray-300">
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;