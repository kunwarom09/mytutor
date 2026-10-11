'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, ApiError } from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: 'parent' | 'teacher' | 'admin';
  status: 'active' | 'pending' | 'suspended';
  avatar?: string | null;
  verification_status?: 'pending' | 'approved' | 'rejected' | null;
  qualification?: string | null;
  experience?: string | null;
  location_city?: string | null;
  subjects?: string | null;
  grade_levels?: string | null;
  hourly_rate?: number | string | null;
  bio?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  registerTeacher: (formData: FormData) => Promise<{ user: User; message: string }>;
  registerParent: (data: any) => Promise<{ user: User; token: string }>;
  socialLogin: (provider: 'google' | 'facebook', providerUserId: string, email: string, name: string, avatarUrl?: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth from localStorage on client mount
  useEffect(() => {
    const storedToken = localStorage.getItem('mytutor_token');
    const storedUser = localStorage.getItem('mytutor_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('mytutor_user');
      }
      // Revalidate with server
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = async () => {
    try {
      const res = await api.get<{ user: User }>('/auth/me');
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('mytutor_user', JSON.stringify(res.data.user));
      }
    } catch {
      // Token expired or invalid
      setUser(null);
      setToken(null);
      localStorage.removeItem('mytutor_token');
      localStorage.removeItem('mytutor_user');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.post<{ user: User; token: string }>('/auth/login', {
        email,
        password,
      });

      const loggedUser = res.data!.user;
      const authToken = res.data!.token;

      setUser(loggedUser);
      setToken(authToken);

      localStorage.setItem('mytutor_token', authToken);
      localStorage.setItem('mytutor_user', JSON.stringify(loggedUser));

      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const registerTeacher = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const res = await api.post<{ user: User }>('/auth/register/teacher', formData);
      return {
        user: res.data!.user,
        message: res.message,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const registerParent = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.post<{ user: User; token: string }>('/auth/register/parent', data);
      const registeredUser = res.data!.user;
      const authToken = res.data!.token;

      setUser(registeredUser);
      setToken(authToken);

      localStorage.setItem('mytutor_token', authToken);
      localStorage.setItem('mytutor_user', JSON.stringify(registeredUser));

      return {
        user: registeredUser,
        token: authToken,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (
    provider: 'google' | 'facebook',
    providerUserId: string,
    email: string,
    name: string,
    avatarUrl?: string
  ): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.post<{ user: User; token: string }>('/auth/social', {
        provider,
        provider_user_id: providerUserId,
        email,
        name,
        avatar_url: avatarUrl,
      });

      const socialUser = res.data!.user;
      const authToken = res.data!.token;

      setUser(socialUser);
      setToken(authToken);

      localStorage.setItem('mytutor_token', authToken);
      localStorage.setItem('mytutor_user', JSON.stringify(socialUser));

      return socialUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors during logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('mytutor_token');
      localStorage.removeItem('mytutor_user');
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        registerTeacher,
        registerParent,
        socialLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
