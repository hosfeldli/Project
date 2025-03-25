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
        // Check if user is already authenticated (e.g., from localStorage)
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                jwtDecode(token); // Validate token
                setIsAuthenticated(true);
            } catch (error) {
                // Token invalid, require login again
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
        
        // Store the token in localStorage
        localStorage.setItem('authToken', response.credential);
        
        // Send user data to backend for storage and authorization
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
        
        // Update authentication state
        setIsAuthenticated(true);
    };

    const handleFailure = () => {
        console.error("Google Sign-In Failed");
        setIsAuthenticated(false);
    };

    return (
        <GoogleOAuthProvider clientId={clientId}>
            {!isAuthenticated ? (
                <div className="auth-container">
                    <h2>Sign in with Google</h2>
                    <GoogleLogin 
                        onSuccess={handleSuccess} 
                        onError={handleFailure}
                        useOneTap
                        auto_select
                    />
                </div>
            ) : (
                children // Only render children if authenticated
            )}
        </GoogleOAuthProvider>
    );
};

export default Authorization;
