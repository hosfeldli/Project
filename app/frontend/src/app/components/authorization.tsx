import React, { useState, useEffect, ReactNode } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

const clientId = "989472724021-51r6abpc2bv48i5v0hi1d3bgnqnp9rpf.apps.googleusercontent.com"; // Replace with your actual Client ID

interface AuthorizationProps {
    children: ReactNode;
}

const Authorization = ({ children }: AuthorizationProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                jwtDecode(token);
                setIsAuthenticated(true);
            } catch (error) {
                localStorage.removeItem('authToken');
            }
        }
    }, []);

    interface GoogleLoginResponse {
        credential: string;
    }

    const handleSuccess = async (response: GoogleLoginResponse) => {
        const userData = jwtDecode(response.credential);
        console.log("User Data:", userData);
        localStorage.setItem('authToken', response.credential);

        try {
            const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
            await fetch(`${backendUrl}/api/authorization`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ token: response.credential, user: userData })
            });
        } catch (error) {
            console.error("Error sending user data to backend:", error);
        }
        setIsAuthenticated(true);
    };

    const handleFailure = () => {
        console.error("Google Sign-In Failed");
        setIsAuthenticated(false);
    };

    return (
        <GoogleOAuthProvider clientId={clientId}>
            {!isAuthenticated ? (
                <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 via-blue-400 to-blue-300 text-white p-6">
                    <div className="bg-white text-gray-900 shadow-2xl rounded-2xl p-10 flex flex-col items-center max-w-md w-full border border-blue-200">
                        <h2 className="text-3xl font-bold mb-6 text-blue-700">Sign in with Google</h2>
                        <p className="text-gray-600 mb-6 text-center">Access your account securely with Google authentication.</p>
                        <div className="w-full flex justify-center">
                            <GoogleLogin 
                                onSuccess={handleSuccess} 
                                onError={handleFailure} 
                                useOneTap 
                                auto_select
                            />
                        </div>
                    </div>
                </div>
            ) : (
                children
            )}
        </GoogleOAuthProvider>
    );
};

export default Authorization;