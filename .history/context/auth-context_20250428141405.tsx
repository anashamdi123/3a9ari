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
      // Validate Supabase configuration
      if (!supabase.auth) {
        return { 
          error: { 
            message: 'خطأ في تكوين قاعدة البيانات. يرجى المحاولة مرة أخرى لاحقاً'
          }
        };
      }

      // First check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        return { 
          error: { 
            message: 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول أو استخدام بريد إلكتروني آخر'
          }
        };
      }

      // Attempt to sign up the user
      let signUpResult = null;
      let signUpError = null;

      // For database errors, implement retry logic
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          const result = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
              data: {
                full_name: fullName
              }
            }
          });

          if (!result.error) {
            signUpResult = result.data;
            break;
          }

          signUpError = result.error;
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        } catch (e) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      }

      if (signUpError) {
        // Handle specific error cases
        if (signUpError.message?.includes('already registered')) {
          return { 
            error: { 
              message: 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول أو استخدام بريد إلكتروني آخر'
            }
          };
        }

        if (signUpError.message?.includes('weak-password')) {
          return {
            error: {
              message: 'كلمة المرور ضعيفة جداً. يرجى استخدام كلمة مرور أقوى'
            }
          };
        }

        if (retryCount === maxRetries) {
          return { 
            error: { 
              message: 'عذراً، نواجه مشكلة مؤقتة في الخادم. يرجى المحاولة مرة أخرى بعد قليل'
            }
          };
        }

        return { 
          error: { 
            message: 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى'
          }
        };
      }

      if (!signUpResult?.user) {
        return { 
          error: { 
            message: 'فشل إنشاء حساب المستخدم'
          }
        };
      }

      // Create user profile with retry logic
      let profileCreated = false;
      retryCount = 0;

      while (!profileCreated && retryCount < maxRetries) {
        try {
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: signUpResult.user.id,
              email: email,
              full_name: fullName
            });

          if (!profileError) {
            profileCreated = true;
            break;
          }

          retryCount++;
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        } catch (e) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      }

      if (!profileCreated) {
        // If profile creation fails, attempt to clean up the auth user
        try {
          await supabase.auth.admin.deleteUser(signUpResult.user.id);
        } catch (deleteError) {
          console.error('Error cleaning up auth user after profile creation failure:', deleteError);
        }

        return { 
          error: { 
            message: 'حدث خطأ أثناء إنشاء الملف الشخصي. يرجى المحاولة مرة أخرى'
          }
        };
      }

      return { error: null };
    } catch (error) {
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