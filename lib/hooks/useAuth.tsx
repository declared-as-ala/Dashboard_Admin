// lib/hooks/useAuth.ts
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: FirebaseUser | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ✅ THE HOOK (for use in any component)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};

// ✅ THE PROVIDER (to wrap app inside layout.tsx)
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const adminDoc = await getDoc(doc(db, "admin", user.uid));
          if (adminDoc.exists()) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
            router.push("/auth/unauthorized");
          }
        } catch (err) {
          console.error(err);
          setIsAdmin(false);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const signIn = async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push("/auth/login");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signIn, signOut, error }}>
      {children}
    </AuthContext.Provider>
  );
};
