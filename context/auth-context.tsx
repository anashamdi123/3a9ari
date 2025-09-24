import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import * as SecureStore from 'expo-secure-store';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (email: string, password: string, fullName: string, phoneNumber: string) => Promise<{ error: any }>;
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

  // Function to restore session from storage
  const restoreSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      if (session) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error restoring session:', error);
      // Clear any invalid session data
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial session check
    restoreSession();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
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
      if (session?.expires_at) {
        const expiresAt = new Date(session.expires_at * 1000);
        const now = new Date();
        if (expiresAt < now) {
          await logout();
        }
      }
    };

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
        
        if (timeUntilExpiry < 5 * 60 * 1000) {
          const { error } = await supabase.auth.refreshSession();
          if (error) {
            console.error('Error refreshing session:', error);
            await logout();
          }
        }
      }
    };

    const refreshInterval = setInterval(refreshToken, 60000);
    return () => clearInterval(refreshInterval);
  }, []);

  async function fetchUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.message.includes('JWT expired')) {
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

  async function register(email: string, password: string, fullName: string, phoneNumber: string) {
    try {
      // Validate input
      if (!email || !password || !fullName || !phoneNumber) {
        return {
          error: {
            message: 'جميع الحقول مطلوبة'
          }
        };
      }

      // Check if email is valid
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          error: {
            message: 'البريد الإلكتروني غير صالح'
          }
        };
      }

      // Check if password is strong enough
      if (password.length < 6) {
        return {
          error: {
            message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
          }
        };
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phoneNumber
          }
        }
      });

      if (signUpError) {
        switch (signUpError.message) {
          case 'User already registered':
            return {
              error: {
                message: 'هذا البريد الإلكتروني مسجل مسبقاً'
              }
            };
          case 'Email not confirmed':
            return {
              error: {
                message: 'يرجى تأكيد البريد الإلكتروني'
              }
            };
          default:
            return {
              error: {
                message: 'حدث خطأ أثناء إنشاء الحساب'
              }
            };
        }
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
        .upsert({
          id: signUpData.user.id,
          email: email,
          full_name: fullName,
          phone_number: phoneNumber
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (profileError) {
        switch (profileError.code) {
          case '23505': // Duplicate key
            console.log('User profile already exists, continuing...');
            break;
          case '23514': // Check constraint violation
            return {
              error: {
                message: 'البيانات المدخلة غير صالحة'
              }
            };
          default:
            console.error('Error creating profile:', profileError);
            return {
              error: {
                message: 'حدث خطأ أثناء إنشاء الملف الشخصي'
              }
            };
        }
      }

      return { error: null };
    } catch (error: any) {
      console.error('Unexpected error during registration:', error);
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