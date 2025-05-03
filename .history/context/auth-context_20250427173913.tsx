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
  created_at: string;
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
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      
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

  // Enhanced login function with improved retry logic and error handling
  async function login(email: string, password: string) {
    let retryCount = 0;
    const maxRetries = 5;
    const baseDelay = 1000;
    const maxDelay = 10000;

    while (retryCount < maxRetries) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (!error) {
          return { error: null };
        }

        // Check for various database-related errors that should trigger a retry
        const shouldRetry = error.message?.includes('Database error') ||
                          error.message?.includes('unexpected_failure') ||
                          error.message?.includes('Connection error') ||
                          error.status === 500;

        if (!shouldRetry) {
          return { 
            error: {
              message: error.message === 'Invalid login credentials'
                ? 'بيانات تسجيل الدخول غير صحيحة'
                : 'حدث خطأ أثناء تسجيل الدخول'
            }
          };
        }

        const exponentialDelay = Math.min(
          maxDelay,
          baseDelay * Math.pow(2, retryCount) * (0.5 + Math.random())
        );
        
        console.log(`Retrying login attempt ${retryCount + 1} of ${maxRetries} after ${exponentialDelay}ms delay`);
        await new Promise(resolve => setTimeout(resolve, exponentialDelay));
        retryCount++;
        
      } catch (error: any) {
        if (retryCount === maxRetries - 1) {
          return { 
            error: { 
              message: 'عذراً، نواجه مشكلة مؤقتة في الخادم. يرجى المحاولة مرة أخرى بعد قليل'
            }
          };
        }

        const exponentialDelay = Math.min(
          maxDelay,
          baseDelay * Math.pow(2, retryCount) * (0.5 + Math.random())
        );
        await new Promise(resolve => setTimeout(resolve, exponentialDelay));
        retryCount++;
      }
    }

    return { 
      error: { 
        message: 'عذراً، لم نتمكن من تسجيل دخولك. يرجى المحاولة مرة أخرى لاحقاً'
      }
    };
  }

  // Register function with improved error handling
  async function register(email: string, password: string, fullName: string) {
    try {
      // Check if the user table exists, create if it doesn't
      const { error: tableCheckError } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (tableCheckError?.message?.includes('relation "users" does not exist')) {
        // Create users table if it doesn't exist
        const { error: createTableError } = await supabase
          .rpc('create_users_table');
          
        if (createTableError) {
          console.error('Error creating users table:', createTableError);
          return { 
            error: { 
              message: 'خطأ في إعداد قاعدة البيانات. يرجى المحاولة مرة أخرى'
            }
          };
        }
      }

      // Attempt to sign up the user
      const { data: signUpResult, error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        
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

      if (!signUpResult?.user) {
        return { 
          error: { 
            message: 'لم يتم إنشاء الحساب. يرجى المحاولة مرة أخرى'
          }
        };
      }

      // Create user profile in the users table
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: signUpResult.user.id,
            email: email.toLowerCase(),
            full_name: fullName,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        
        // If profile creation fails, clean up the auth user
        try {
          await supabase.auth.admin.deleteUser(signUpResult.user.id);
        } catch (deleteError) {
          console.error('Error cleaning up auth user:', deleteError);
        }

        if (profileError.code === '23505') { // Unique constraint violation
          return { 
            error: { 
              message: 'هذا البريد الإلكتروني مسجل بالفعل'
            }
          };
        }

        return { 
          error: { 
            message: 'فشل في إنشاء الملف الشخصي. يرجى المحاولة مرة أخرى'
          }
        };
      }

      // Set the user and profile in the context
      setUser(signUpResult.user);
      await fetchUserProfile(signUpResult.user.id);

      return { error: null };
    } catch (error: any) {
      console.error('Unexpected registration error:', error);
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

  // Return the context provider
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