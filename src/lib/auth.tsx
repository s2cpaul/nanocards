import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, displayName?: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const savedUser = localStorage.getItem('nanocards_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('nanocards_user');
      }
    }
    setIsLoading(false);
  }, []);

  const signup = async (email: string, password: string, displayName?: string): Promise<boolean> => {
    try {
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('nanocards_users') || '[]');
      const userExists = existingUsers.find((u: any) => u.email === email.toLowerCase());

      if (userExists) {
        toast.error('Account already exists with this email');
        return false;
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email: email.toLowerCase(),
        displayName: displayName || email.split('@')[0],
        createdAt: new Date().toISOString(),
      };

      // Save user data
      existingUsers.push({ ...newUser, password }); // Store password for login
      localStorage.setItem('nanocards_users', JSON.stringify(existingUsers));

      // Auto-login after signup
      setUser(newUser);
      localStorage.setItem('nanocards_user', JSON.stringify(newUser));

      toast.success(`Welcome, ${newUser.displayName}!`);
      return true;
    } catch (error) {
      toast.error('Failed to create account');
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const existingUsers = JSON.parse(localStorage.getItem('nanocards_users') || '[]');
      const user = existingUsers.find((u: any) =>
        u.email === email.toLowerCase() && u.password === password
      );

      if (!user) {
        toast.error('Invalid email or password');
        return false;
      }

      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = user;
      setUser(userWithoutPassword);
      localStorage.setItem('nanocards_user', JSON.stringify(userWithoutPassword));

      toast.success(`Welcome back, ${user.displayName}!`);
      return true;
    } catch (error) {
      toast.error('Login failed');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nanocards_user');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}