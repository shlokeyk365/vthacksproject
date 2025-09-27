import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, type User } from '../lib/api';
import { useProfile, useLogout } from '../hooks/useApi';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    monthlyBudgetGoal?: number;
  }) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: profileData, isLoading: profileLoading } = useProfile();
  const logoutMutation = useLogout();

  const isAuthenticated = apiClient.isAuthenticated();

  useEffect(() => {
    if (profileData) {
      setUser(profileData);
    } else if (!isAuthenticated) {
      setUser(null);
    }
    setIsLoading(profileLoading);
  }, [profileData, profileLoading, isAuthenticated]);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login({ email, password });
      if (response.data?.user) {
        setUser(response.data.user);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    monthlyBudgetGoal?: number;
  }) => {
    try {
      const response = await apiClient.register(userData);
      if (response.data?.user) {
        setUser(response.data.user);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    logoutMutation.mutate();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
