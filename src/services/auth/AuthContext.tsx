// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as fbSignOut,
  User
} from "firebase/auth";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string, remember: boolean) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  forgot: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = getAuth(); // getAuth(app)
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, [auth]);

  const signIn = async (email: string, password: string, remember: boolean) => {
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    await signInWithEmailAndPassword(auth, email, password);
    // user sẽ được set qua onAuthStateChanged
  };

  const signUp = async (email: string, password: string) => {
    await setPersistence(auth, browserLocalPersistence);
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const forgot = (email: string) => sendPasswordResetEmail(auth, email);

  const signOut = () => fbSignOut(auth);
  

  return (
    <Ctx.Provider value={{ user, loading, signIn, signUp, forgot, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};


