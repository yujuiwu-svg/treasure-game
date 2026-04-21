import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  getMe,
  signin as apiSignin,
  signup as apiSignup,
  signout as apiSignout,
} from '@/lib/auth';

interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signin: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  signout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const signin = async (username: string, password: string) => {
    const u = await apiSignin(username, password);
    setUser(u);
  };

  const signup = async (username: string, password: string) => {
    const u = await apiSignup(username, password);
    setUser(u);
  };

  const signout = async () => {
    await apiSignout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signin, signup, signout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
