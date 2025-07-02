'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthResponse } from '@/types';
import { authApi } from '@/lib/api';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: 'celebrity' | 'fan') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  // Check for existing auth on mount
  const token = Cookies.get('auth_token');
  const userData = Cookies.get('user_data');

  console.log('Auth check - token:', token ? 'exists' : 'missing');
  console.log('Auth check - userData:', userData ? 'exists' : 'missing');

  if (token && userData) {
    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      console.error('Failed to parse user data:', error);
      Cookies.remove('auth_token');
      Cookies.remove('user_data');
    }
  }
  setLoading(false);
}, []);
  const login = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await authApi.login(email, password);
      
      // Store auth data
      Cookies.set('auth_token', response.access_token, { expires: 7 });
      Cookies.set('user_data', JSON.stringify(response.user), { expires: 7 });
      
      setUser(response.user);
      toast.success('Login successful!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (email: string, password: string, role: 'celebrity' | 'fan') => {
    try {
      const response: AuthResponse = await authApi.register(email, password, role);
      
      // Store auth data
      Cookies.set('auth_token', response.access_token, { expires: 7 });
      Cookies.set('user_data', JSON.stringify(response.user), { expires: 7 });
      
      setUser(response.user);
      toast.success('Registration successful!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('auth_token');
    Cookies.remove('user_data');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
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