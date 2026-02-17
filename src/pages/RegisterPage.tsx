import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, Chrome, Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp, resendConfirmation, user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Estado para mostrar tela de confirmação de email
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Redirect if already logged in
  if (user) {
    navigate('/minha-conta');
    return null;
  }

  const handleGoogleSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/minha-conta`,
      },
    });
    if (error) {
      toast({ title: 'Erro ao conectar com Google', description: error.message, variant: 'destructive' });
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      await resendConfirmation(registeredEmail);
      toast({
        title: 'E-mail reenviado! ✉️',
        description: 'Verifique sua caixa de entrada e spam.'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao reenviar e-mail';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }

    if (fullName.trim().length < 3) {
      toast({ title: 'Digite seu nome completo', variant: 'destructive' });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: 'As senhas não coincidem', variant: 'destructive' });
      return;
    }

    if (password.length < 6) {
      toast({ title: 'A senha deve ter pelo menos 6 caracteres', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const { needsConfirmation } = await signUp(email, password, fullName.trim());

      if (needsConfirmation) {
        // Mostra tela de confirmação de email
        setRegisteredEmail(email);
        setShowConfirmation(true);
      } else {
        // Login automático (confirmação desabilitada no Supabase)
        toast({
          title: 'Conta criada com sucesso! 🎉',
          description: 'Bem-vindo(a) à Happy Style Market!'
        });
        navigate('/minha-conta');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao criar conta';
      toast({ title: 'Erro no cadastro', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Tela de confirmação de email
  if (showConfirmation) {
    return (
      <Layout>
        <div className="container py-8 flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Verifique seu E-mail! 📧</CardTitle>
              <CardDescription className="text-base mt-2">
                Enviamos um link de confirmação para:
              </CardDescription>
              <p className="font-semibold text-primary text-lg mt-1">{registeredEmail}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Abra seu e-mail e clique no link de confirmação</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Verifique a pasta de <strong>spam/lixo eletrônico</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Após confirmar, volte aqui e faça login</span>
                </div>
              </div>

              <Separator />

              <div className="text-center text-sm text-muted-foreground">
                Não recebeu o e-mail?
              </div>

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleResendEmail}
                disabled={isResending}
              >
                {isResending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Reenviar E-mail de Confirmação
              </Button>

              <Button asChild className="w-full">
                <Link to="/login">Ir para Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Criar Conta</CardTitle>
            <CardDescription>
              Cadastre-se para aproveitar nossos preços exclusivos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Google Sign Up Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 h-12 mb-4 border-border hover:bg-secondary"
              onClick={handleGoogleSignUp}
            >
              <Chrome className="h-5 w-5" />
              Continuar com Google
            </Button>

            <div className="relative my-4">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground uppercase">
                ou
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

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
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    minLength={6}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repita a senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full h-12" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Criar Conta
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Já tem uma conta? </span>
              <Link to="/login" className="text-primary hover:underline font-medium">
                Entrar
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
