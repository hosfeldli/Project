"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const clientId = "989472724021-51r6abpc2bv48i5v0hi1d3bgnqnp9rpf.apps.googleusercontent.com"; // Replace with actual client ID

interface AuthorizationProps {
  children: (isAuthenticated: boolean) => ReactNode;
}

const Authorization = ({ children }: AuthorizationProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        jwtDecode(token);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem("authToken");
      }
    }
  }, []);

  const handleSuccess = async (response: { credential?: string }) => {
    if (!response.credential) {
      console.error("Google Sign-In response missing credential.");
      return;
    }

    const userData = jwtDecode(response.credential);
    console.log("User Data:", userData);
    localStorage.setItem("authToken", response.credential);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
      await fetch(`${backendUrl}/api/authorization`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential, user: userData }),
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
            <h2 className="text-4xl font-extrabold mb-6 text-blue-700">Welcome Back</h2>
            <p className="text-lg text-gray-600 mb-6 text-center">
              Sign in securely with your Google account to continue.
            </p>
            <GoogleLogin onSuccess={handleSuccess} onError={handleFailure} />
          </div>
        </div>
      ) : (
        children(isAuthenticated)
      )}
    </GoogleOAuthProvider>
  );
};

export default Authorization;
