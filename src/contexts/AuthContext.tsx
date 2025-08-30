import React, { createContext, useContext, useEffect, useState } from "react";
import { SupabaseService } from "../services/supabaseService";
import { supabase } from "../lib/supabase";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

interface AppSession {
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: AppSession | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    userData: any
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AppSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const checkUser = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (currentSession?.user) {
          // Get user profile from profiles table
          const { profile, error } = await SupabaseService.getProfile(
            currentSession.user.id
          );

          if (profile && !error) {
            const userData: User = {
              id: profile.id,
              email: profile.email || currentSession.user.email || "",
              firstName: profile.first_name || "",
              lastName: profile.last_name || "",
              companyName: profile.company_name || "",
            };

            setUser(userData);
            setSession({ user: userData });
          }
        }
      } catch (error) {
        console.error("Error checking user session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === "SIGNED_IN" && session?.user) {
          // Get user profile
          const { profile, error } = await SupabaseService.getProfile(
            session.user.id
          );

          if (profile && !error) {
            const userData: User = {
              id: profile.id,
              email: profile.email || session.user.email || "",
              firstName: profile.first_name || "",
              lastName: profile.last_name || "",
              companyName: profile.company_name || "",
            };

            setUser(userData);
            setSession({ user: userData });
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setSession(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log("Starting real Supabase signup process...");

      // Create user with Supabase Auth and send email confirmation link
      const { user, error: signUpError } = await SupabaseService.signUp(
        email,
        password,
        {
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone || null,
          company_name: userData.companyName,
        }
      );

      if (signUpError) {
        console.error("Supabase signup error:", signUpError);
        return { error: signUpError };
      }

      // Do NOT create profile or sign the user in yet. They must confirm email first.
      console.log(
        "Signup initiated. Confirmation email sent if email is valid."
      );
      return { error: null };
    } catch (error: any) {
      console.error("Supabase signup exception:", error);
      return { error: error.message || "An error occurred during signup" };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Starting real Supabase signin process...");

      // Sign in with Supabase
      const { user, error: signInError } = await SupabaseService.signIn(
        email,
        password
      );

      if (signInError) {
        console.error("Supabase signin error:", signInError);

        // Handle specific error cases
        if (signInError.includes("Email not confirmed")) {
          return {
            error:
              "Please confirm your email first. A confirmation email has been sent.",
            requiresEmailConfirmation: true,
          };
        }

        if (signInError.includes("Invalid login credentials")) {
          return { error: "Invalid email or password." };
        }

        return { error: signInError };
      }

      if (!user) {
        return { error: "Sign in failed" };
      }

      // Get user profile
      const { profile, error: profileError } = await SupabaseService.getProfile(
        user.id
      );

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        return { error: profileError };
      }

      const userData: User = {
        id: user.id,
        email: user.email || "",
        firstName: profile?.first_name || "",
        lastName: profile?.last_name || "",
        companyName: profile?.company_name || "",
      };

      setUser(userData);
      setSession({ user: userData });

      console.log("Real Supabase signin successful:", user.id);
      return { error: null };
    } catch (error: any) {
      console.error("Supabase signin exception:", error);
      return { error: error.message || "An error occurred during signin" };
    }
  };

  const signOut = async () => {
    try {
      console.log("Starting real Supabase signout process...");

      // Sign out from Supabase
      const { error } = await SupabaseService.signOut();

      if (error) {
        console.error("Supabase signout error:", error);
      }

      // Clear user and session
      setUser(null);
      setSession(null);

      console.log("Real Supabase signout successful");
    } catch (error) {
      console.error("Supabase signout exception:", error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log("Starting real Supabase password reset...");

      // Use Supabase password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        console.error("Supabase password reset error:", error);
        return { error: error.message };
      }

      console.log("Real Supabase password reset email sent to:", email);
      return { error: null };
    } catch (error: any) {
      console.error("Supabase password reset exception:", error);
      return {
        error: error.message || "An error occurred during password reset",
      };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
