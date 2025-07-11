import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from "@/lib/firebase";

export default function useFireBaseAuth() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const isLoggedIn = onAuthStateChanged(auth, (fireUser) => {
            setUser(fireUser);
        });

        return () => isLoggedIn();
    }, []);
    
    return user;
}