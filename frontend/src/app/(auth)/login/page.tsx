"use client";

import React from 'react'
import { auth, provider } from "@/lib/firebase";
import { signInWithPopup } from 'firebase/auth';
import { useRouter } from "next/navigation";

const LoginPage = () => {
    const router = useRouter();

    const handleLogin = async () => {
        try {
            const res = await signInWithPopup(auth, provider);
            const user = res.user;
            console.log("User: ", user);
            router.push("/dashboard");
        } catch (error) {
            console.error("Login Failed. ", error);
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-green-100' >
            <button
                onClick={handleLogin}
            >
                Sign in with Google
            </button>
        </div>
    );
}

export default LoginPage