import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

type UserProfile = Database['public']['Tables']['users']['Row'];

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

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
    
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

  // Check session expiration periodically
  useEffect(() => {
    const checkSessionExpiration = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log(session?.expires_at)
      if (session?.expires_at) {
        const expiresAt = new Date(session.expires_at * 1000);
        const now = new Date();
        if (expiresAt < now) {
          // Session expired, handle accordingly
          await logout();
        }
      }
    };

    // Check session expiration every minute
    const expirationInterval = setInterval(checkSessionExpiration, 60000);

    return () => clearInterval(expirationInterval);
  }, []);

  // Refresh token before expiration
  useEffect(() => {
    const refreshToken = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.expires_at) {
        const expiresAt = new Date(session.expires_at * 1000);
        const now = new Date();
        const timeUntilExpiry = expiresAt.getTime() - now.getTime();
        
        // Refresh token if it's about to expire (within 5 minutes)
        if (timeUntilExpiry < 5 * 60 * 1000) {
          const { error } = await supabase.auth.refreshSession();
          if (error) {
            console.error('Error refreshing session:', error);
            await logout();
          }
        }
      }
    };

    // Check token expiration every minute
    const refreshInterval = setInterval(refreshToken, 60000);

    return () => clearInterval(refreshInterval);
  }, []);

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

  async function fetchUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.message.includes('JWT expired')) {
          // Handle expired token
          await logout();
          return;
        }
        throw error;
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

  async function login(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        return { 
          error: { 
            message: error.message === 'Invalid login credentials'
              ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
              : 'حدث خطأ أثناء تسجيل الدخول'
          }
        };
      }

      return { error: null };
    } catch (error: any) {
      return { 
        error: { 
          message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى'
        }
      };
    }
  }

  async function register(email: string, password: string, fullName: string) {
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (signUpError) {
        return { 
          error: { 
            message: signUpError.message || 'حدث خطأ أثناء إنشاء الحساب'
          }
        };
      }

      if (!signUpData.user) {
        return { 
          error: { 
            message: 'فشل إنشاء الحساب'
          }
        };
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: signUpData.user.id,
          email: email,
          full_name: fullName
        });

      if (profileError) {
        // Only log the error, don't return it since the user is already created
        console.error('Error creating profile:', profileError);
      }

      return { error: null };
    } catch (error: any) {
      return { 
        error: { 
          message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى'
        }
      };
    }
  }

  async function logout() {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

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