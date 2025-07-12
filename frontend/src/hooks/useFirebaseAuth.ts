import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from "@/lib/firebase";

export default function useFireBaseAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const isLoggedIn = onAuthStateChanged(auth, (fireUser) => {
            setUser(fireUser);
            setIsLoading(false);
        });

        return () => isLoggedIn();
    }, []);
    
    return { user, isLoading };
}