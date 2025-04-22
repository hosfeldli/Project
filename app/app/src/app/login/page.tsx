"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAuth } from "@/context/auth-context";
import Navbar from "@/components/navbar";

const LoginPage = () => {
    const router = useRouter();
    const { isAuthenticated, setIsAuthenticated } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

            const res = await fetch(`${backendUrl}/api/user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    password,
                    mode: isRegister ? "register" : "login",
                }),
            });

            const data = await res.json();

            console.log(data);
            if (!res.ok) {
                setError(data.message || "Something went wrong");
                return;
            }

            Cookies.set("authToken", data.sessionToken, {
                expires: 7,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Strict",
            });

            Cookies.set("user", data.userToken, {
                expires: 7,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Strict",
            });

            console.log(Cookies.get());

            setIsAuthenticated(true);
            router.push("/homepage")
        } catch (err) {
            console.error(isRegister ? "register error:" : "login error:", err);
            setError("Unexpected error occurred.");
        }
    };

    useEffect(() => {
        if (isAuthenticated) router.push("/homepage");
        console.log("user: ")
    }, [isAuthenticated, router]);

    return (
        <div>
            <Navbar />
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
                <div className="bg-white text-gray-900 shadow-2xl rounded-2xl p-10 flex flex-col items-center max-w-md w-full border border-blue-200">
                    <h2 className="text-4xl font-extrabold mb-4 text-blue-700">
                        {isRegister ? "Register" : "Log In"}
                    </h2>

                    <form onSubmit={handleSubmit} className="w-full space-y-4">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg"
                            required
                        />

                        {error && (
                            <p className="text-red-600 text-sm text-center">{error}</p>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            {isRegister ? "Create Account" : "Log In"}
                        </button>
                    </form>

                    <p className="mt-4 text-sm text-gray-700">
                        {isRegister ? "Already have an account?" : "New here?"}{" "}
                        <button
                            onClick={() => setIsRegister(!isRegister)}
                            className="text-blue-600 underline hover:text-blue-800"
                        >
                            {isRegister ? "Log in instead" : "Register"}
                        </button>
                    </p>
                </div>
            </div></div>
    );
};

export default LoginPage;