import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

interface Session {
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock authentication - no real session management
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log('Starting mock signup process...');
      
      // Mock user creation
      const mockUser: User = {
        id: `user-${Date.now()}`,
        email: email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        companyName: userData.companyName
      };

      // Mock session
      const mockSession: Session = {
        user: mockUser
      };

      // Set user and session
      setUser(mockUser);
      setSession(mockSession);

      console.log('Mock user created successfully:', mockUser.id);
      return { error: null };
    } catch (error) {
      console.error('Mock signup exception:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Starting mock signin process...');
      
      // Mock signin - create a mock user
      const mockUser: User = {
        id: `user-${Date.now()}`,
        email: email,
        firstName: 'Mock',
        lastName: 'User',
        companyName: 'Mock Company'
      };

      const mockSession: Session = {
        user: mockUser
      };

      setUser(mockUser);
      setSession(mockSession);

      console.log('Mock signin successful:', mockUser.id);
      return { error: null };
    } catch (error) {
      console.error('Mock signin exception:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting mock signout process...');
      
      // Clear user and session
      setUser(null);
      setSession(null);
      
      console.log('Mock signout successful');
    } catch (error) {
      console.error('Mock signout exception:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('Starting mock password reset...');
      
      // Mock password reset - just return success
      console.log('Mock password reset email sent to:', email);
      return { error: null };
    } catch (error) {
      console.error('Mock password reset exception:', error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
