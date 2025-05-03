import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

// Define the shape of our auth context
interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Define the shape of the UserProfile
interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ error: null }),
  register: async () => ({ error: null }),
  logout: async () => {},
  refreshProfile: async () => {},
});

// Create a hook to use the auth context
export const useAuthContext = () => useContext(AuthContext);

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for user on mount
  useEffect(() => {
    checkUser();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Check if user is logged in
  async function checkUser() {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUser(data.session.user);
        await fetchUserProfile(data.session.user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch user profile
  async function fetchUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
        return;
      }
      
      if (data) {
        setProfile(data);
      } else {
        console.log('No profile found for user:', userId);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfile(null);
    }
  }

  // Login function with error handling
  async function login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
        return {
          error: {
            message: error.message === 'Invalid login credentials'
              ? 'بيانات تسجيل الدخول غير صحيحة'
              : 'حدث خطأ أثناء تسجيل الدخول'
          }
        };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        error: {
          message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى'
        }
      };
    }
  }

  // Register function with error handling
  async function register(email: string, password: string, fullName: string) {
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim()
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          return {
            error: {
              message: 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول أو استخدام بريد إلكتروني آخر'
            }
          };
        }

        return {
          error: {
            message: 'فشل في إنشاء الحساب. يرجى التحقق من بياناتك والمحاولة مرة أخرى'
          }
        };
      }

      if (!data?.user) {
        return {
          error: {
            message: 'فشل في إنشاء الحساب. يرجى المحاولة مرة أخرى'
          }
        };
      }

      // Profile will be created automatically by the database trigger
      return { error: null };
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        error: {
          message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى'
        }
      };
    }
  }

  // Logout function
  async function logout() {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  // Refresh user profile
  async function refreshProfile() {
    if (user) {
      await fetchUserProfile(user.id);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};