import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

const formatCPF = (value: string) =>
  value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').slice(0, 14);

const formatPhone = (value: string) =>
  value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 15);

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, updateProfile, isLoading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    cpf: '',
  });

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        cpf: profile.cpf || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        full_name: form.full_name,
        phone: form.phone,
        cpf: form.cpf,
      });
      toast({ title: 'Dados atualizados com sucesso!' });
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-4 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-4 space-y-6 max-w-lg">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/minha-conta"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-2xl font-bold">Dados Pessoais</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Suas Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input value={user?.email || ''} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado.</p>
            </div>

            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Seu nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label>CPF</Label>
              <Input
                value={form.cpf}
                onChange={(e) => setForm({ ...form, cpf: formatCPF(e.target.value) })}
                placeholder="000.000.000-00"
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
