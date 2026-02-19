import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, resendConfirmation, user, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailNotConfirmed, setShowEmailNotConfirmed] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Get the return path from location state (e.g., from checkout)
  const from = (location.state as { from?: string })?.from;

  // Redirect if already logged in - check role first
  useEffect(() => {
    if (user && !authLoading) {
      // If there's a return path (like /checkout), use it
      if (from) {
        navigate(from);
        return;
      }

      // Otherwise, check role for appropriate redirect
      supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.role === 'admin' || data?.role === 'manager') {
            navigate('/admin');
          } else {
            navigate('/minha-conta');
          }
        });
    }
  }, [user, authLoading, navigate, from]);


  const handleResendEmail = async () => {
    if (!email) {
      toast({ title: 'Digite seu e-mail acima', variant: 'destructive' });
      return;
    }
    setIsResending(true);
    try {
      await resendConfirmation(email);
      toast({
        title: 'E-mail reenviado! ✉️',
        description: 'Verifique sua caixa de entrada e spam.'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao reenviar';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setShowEmailNotConfirmed(false);

    try {
      await signIn(email, password);

      // Check user role after login
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.session.user.id)
          .maybeSingle();

        toast({ title: 'Login realizado com sucesso! 🎉' });

        // If there's a return path (like /checkout), use it
        if (from) {
          navigate(from);
          return;
        }

        // Redirect based on role
        if (roleData?.role === 'admin' || roleData?.role === 'manager') {
          navigate('/admin');
        } else {
          navigate('/minha-conta');
        }
      } else {
        navigate(from || '/minha-conta');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';

      // Detectar erro de email não confirmado e mostrar opção de reenvio
      if (message.includes('não foi confirmado') || message.includes('not confirmed')) {
        setShowEmailNotConfirmed(true);
      }

      toast({ title: 'Erro no login', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Entrar</CardTitle>
            <CardDescription>
              {from === '/checkout'
                ? 'Faça login para finalizar sua compra'
                : 'Entre na sua conta para continuar'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Aviso de email não confirmado */}
              {showEmailNotConfirmed && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada e spam.</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-amber-700 border-amber-300 hover:bg-amber-100 dark:text-amber-300 dark:border-amber-700 dark:hover:bg-amber-900/50"
                    onClick={handleResendEmail}
                    disabled={isResending}
                  >
                    {isResending ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : null}
                    Reenviar E-mail de Confirmação
                  </Button>
                </div>
              )}

              <Button type="submit" className="w-full h-12" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Entrar
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Não tem uma conta? </span>
              <Link to="/cadastro" className="text-primary hover:underline font-medium">
                Cadastre-se
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
