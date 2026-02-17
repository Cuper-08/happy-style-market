import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Traduz mensagens de erro do Supabase Auth para PT-BR
 */
function translateAuthError(error: AuthError): string {
  const message = error.message?.toLowerCase() || '';

  if (message.includes('invalid login credentials') || message.includes('invalid_credentials')) {
    return 'E-mail ou senha incorretos. Verifique seus dados e tente novamente.';
  }
  if (message.includes('email not confirmed')) {
    return 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada (e spam) e clique no link de confirmação.';
  }
  if (message.includes('email rate limit exceeded') || message.includes('rate limit')) {
    return 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
  }
  if (message.includes('user already registered') || message.includes('already been registered')) {
    return 'Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.';
  }
  if (message.includes('signup is disabled')) {
    return 'O cadastro de novos usuários está temporariamente desabilitado.';
  }
  if (message.includes('password') && message.includes('short')) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }
  if (message.includes('email') && message.includes('invalid')) {
    return 'O formato do e-mail não é válido.';
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }

  // Fallback: retorna a mensagem original
  return error.message || 'Ocorreu um erro inesperado. Tente novamente.';
}

/**
 * Detecta a URL base correta para redirecionamento
 */
function getRedirectUrl(path: string = '/'): string {
  // Em produção (Lovable/Vercel/Netlify), usa a URL de produção
  // Em desenvolvimento, usa localhost
  const baseUrl = window.location.origin;
  return `${baseUrl}${path}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] State changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile using setTimeout to avoid deadlock
          setTimeout(async () => {
            try {
              const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .maybeSingle();
              setProfile(data);
            } catch (err) {
              console.error('[Auth] Error fetching profile:', err);
            }
          }, 0);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ 
      email: email.trim().toLowerCase(), 
      password 
    });
    if (error) {
      throw new Error(translateAuthError(error));
    }
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<{ needsConfirmation: boolean }> => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: getRedirectUrl('/login'),
        data: { full_name: fullName },
      },
    });

    if (error) {
      throw new Error(translateAuthError(error));
    }

    // O Supabase retorna um user mesmo quando precisa de confirmação.
    // Se o user tem identities vazio, significa que o email já está cadastrado
    // mas o Supabase não revela isso por segurança (fake signup).
    if (data?.user?.identities?.length === 0) {
      throw new Error('Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.');
    }

    // Verifica se precisa de confirmação por email
    // Se session é null mas user existe, significa que precisa confirmar email
    const needsConfirmation = !data.session && !!data.user;
    
    return { needsConfirmation };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(translateAuthError(error));
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) throw new Error('Você precisa estar logado para atualizar o perfil.');
    
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('user_id', user.id);
    
    if (error) throw new Error('Erro ao atualizar perfil. Tente novamente.');
    
    setProfile(prev => prev ? { ...prev, ...data } : null);
  };

  const resendConfirmation = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: getRedirectUrl('/login'),
      },
    });
    if (error) {
      throw new Error(translateAuthError(error));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      isLoading,
      signIn,
      signUp,
      signOut,
      updateProfile,
      resendConfirmation,
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
