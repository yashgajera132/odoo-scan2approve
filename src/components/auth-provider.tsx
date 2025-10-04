'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

const mockUsers: { [key in UserRole]: User } = {
  Employee: {
    id: 'usr_employee',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    role: 'Employee',
    avatarUrl: PlaceHolderImages.find(img => img.id === 'user-avatar-1')?.imageUrl || '',
  },
  Manager: {
    id: 'usr_manager',
    name: 'Michael Smith',
    email: 'michael.s@example.com',
    role: 'Manager',
    avatarUrl: PlaceHolderImages.find(img => img.id === 'user-avatar-2')?.imageUrl || '',
  },
  Admin: {
    id: 'usr_admin',
    name: 'David Chen',
    email: 'david.c@example.com',
    role: 'Admin',
    avatarUrl: PlaceHolderImages.find(img => img.id === 'user-avatar-3')?.imageUrl || '',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('expenseflow-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem('expenseflow-user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (role: UserRole) => {
    const userToLogin = mockUsers[role];
    localStorage.setItem('expenseflow-user', JSON.stringify(userToLogin));
    setUser(userToLogin);
  };

  const logout = () => {
    localStorage.removeItem('expenseflow-user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
