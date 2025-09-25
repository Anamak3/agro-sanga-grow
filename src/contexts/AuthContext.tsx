import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (mobile: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Fetch or create user profile after successful signin
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();
              
              if (!profile) {
                // Profile doesn't exist, might be from signup
                console.log('No profile found for user');
              }
            } catch (error) {
              console.error('Error fetching profile:', error);
            }
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setLoading(true);
      
      // First create the auth user
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: userData.name,
            mobile_number: userData.mobileNumber,
          }
        }
      });

      if (authError) {
        toast({
          title: "Registration Error",
          description: authError.message,
          variant: "destructive"
        });
        return { error: authError };
      }

      // Create profile if user was created
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            name: userData.name,
            mobile_number: userData.mobileNumber,
            survey_number: userData.surveyNumber || null,
            farm_area: parseFloat(userData.farmArea)
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          toast({
            title: "Profile Creation Error",
            description: "Account created but profile setup failed. Please contact support.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Registration Successful!",
            description: "Your account has been created successfully. You can now login.",
            variant: "default"
          });
        }
      }

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Registration Error",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (mobile: string, password: string) => {
    try {
      setLoading(true);
      
      // Get user by mobile number first
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('mobile_number', mobile)
        .single();

      if (!profile) {
        const error = new Error('No account found with this mobile number');
        toast({
          title: "Login Error",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      // Get email from auth.users table using edge function or RPC
      // For now, we'll use mobile as email (since we need email for Supabase auth)
      // In production, you'd want to store email separately or use a different auth method
      const email = `${mobile}@agrosanga.local`; // Temporary solution

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login Error", 
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      toast({
        title: "Login Successful!",
        description: "Welcome back to AgroSanga",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "Come back soon!",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};