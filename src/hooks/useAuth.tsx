import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  nama_lengkap: string;
  role: string; // Keep as string to match database schema
  tenant_id: string | null;
  company_id: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle instead of single

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw new Error(`Failed to fetch profile: ${profileError.message}`);
      }

      if (!profileData) {
        console.warn('No profile found for user:', userId);
        // Try to create a profile if it doesn't exist
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: userId,
              name: userData.user.email || 'Unknown User',
              nama_lengkap: userData.user.email || 'Unknown User',
              role: 'operator_klien' as any, // Default role compatible with DB enum
              is_active: true
            })
            .select()
            .single();

          if (createError) {
            console.error('Failed to create profile:', createError);
            throw new Error(`Failed to create profile: ${createError.message}`);
          }

          console.log('Created new profile:', newProfile);
          return newProfile;
        }
        return null;
      }

      console.log('Profile fetched successfully:', profileData);
      return profileData;
    } catch (err: any) {
      console.error('Error in fetchProfile:', err);
      setError(err.message);
      return null;
    }
  };

  const refetchProfile = async () => {
    if (user?.id) {
      setLoading(true);
      setError(null);
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        setError(null);
        
        if (session?.user) {
          setLoading(true);
          const profileData = await fetchProfile(session.user.id);
          if (isMounted) {
            setProfile(profileData);
            setLoading(false);
          }
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setError(error.message);
          setLoading(false);
          return;
        }

        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('Existing session found for:', session.user.email);
          const profileData = await fetchProfile(session.user.id);
          if (isMounted) {
            setProfile(profileData);
          }
        }
      } catch (err: any) {
        console.error('Auth initialization error:', err);
        setError(err.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile, 
      loading, 
      error, 
      signOut, 
      refetchProfile 
    }}>
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