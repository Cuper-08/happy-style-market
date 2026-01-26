import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Heart, MapPin, User, LogOut, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, profile, signOut, isLoading } = useAuth();

  // Redirect if not logged in
  if (!isLoading && !user) {
    navigate('/login');
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: 'Você saiu da sua conta' });
      navigate('/');
    } catch {
      toast({ title: 'Erro ao sair', variant: 'destructive' });
    }
  };

  const menuItems = [
    { icon: Package, label: 'Meus Pedidos', href: '/minha-conta/pedidos' },
    { icon: Heart, label: 'Favoritos', href: '/minha-conta/favoritos' },
    { icon: MapPin, label: 'Endereços', href: '/minha-conta/enderecos' },
    { icon: User, label: 'Dados Pessoais', href: '/minha-conta/perfil' },
  ];

  return (
    <Layout>
      <div className="container py-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Minha Conta</h1>
          <p className="text-muted-foreground">
            Olá, {profile?.full_name || user?.email}!
          </p>
        </div>

        <div className="grid gap-4">
          {menuItems.map((item) => (
            <Link key={item.href} to={item.href}>
              <Card className="hover:border-primary/50 transition-colors">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">E-mail</span>
              <span>{user?.email}</span>
            </div>
            {profile?.phone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Telefone</span>
                <span>{profile.phone}</span>
              </div>
            )}
            {profile?.cpf && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">CPF</span>
                <span>{profile.cpf}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full text-destructive hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair da Conta
        </Button>
      </div>
    </Layout>
  );
}
