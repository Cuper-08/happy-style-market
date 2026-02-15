import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, MapPin, Plus, Trash2, Star, Search, X } from 'lucide-react';

interface Address {
  id: string;
  label: string | null;
  cep: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  is_default: boolean | null;
}

const formatCEP = (value: string) =>
  value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);

export default function AddressesPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    label: 'Casa',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });
    setAddresses(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  const handleCepSearch = async (cep: string) => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm(prev => ({
          ...prev,
          street: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || '',
        }));
      }
    } catch {}
  };

  const resetForm = () => {
    setForm({ label: 'Casa', cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.cep || !form.street || !form.number || !form.neighborhood || !form.city || !form.state) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' });
      return;
    }

    const payload = {
      user_id: user.id,
      label: form.label || 'Casa',
      cep: form.cep,
      street: form.street,
      number: form.number,
      complement: form.complement || null,
      neighborhood: form.neighborhood,
      city: form.city,
      state: form.state,
      is_default: addresses.length === 0,
    };

    if (editingId) {
      const { error } = await supabase.from('addresses').update(payload).eq('id', editingId);
      if (error) { toast({ title: 'Erro ao atualizar', variant: 'destructive' }); return; }
      toast({ title: 'Endereço atualizado!' });
    } else {
      const { error } = await supabase.from('addresses').insert(payload);
      if (error) { toast({ title: 'Erro ao salvar', variant: 'destructive' }); return; }
      toast({ title: 'Endereço adicionado!' });
    }
    resetForm();
    fetchAddresses();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('addresses').delete().eq('id', id);
    toast({ title: 'Endereço removido' });
    fetchAddresses();
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    // Unset all defaults
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    toast({ title: 'Endereço padrão atualizado' });
    fetchAddresses();
  };

  const startEdit = (addr: Address) => {
    setForm({
      label: addr.label || 'Casa',
      cep: addr.cep,
      street: addr.street,
      number: addr.number,
      complement: addr.complement || '',
      neighborhood: addr.neighborhood,
      city: addr.city,
      state: addr.state,
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container py-4 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/minha-conta"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <h1 className="text-2xl font-bold">Meus Endereços</h1>
          </div>
          {!showForm && (
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar
            </Button>
          )}
        </div>

        {showForm && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{editingId ? 'Editar Endereço' : 'Novo Endereço'}</h3>
                <Button variant="ghost" size="icon" onClick={resetForm}><X className="h-4 w-4" /></Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Apelido</Label>
                  <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Casa, Trabalho..." />
                </div>
                <div className="space-y-2">
                  <Label>CEP *</Label>
                  <div className="relative">
                    <Input
                      value={form.cep}
                      onChange={(e) => {
                        const v = formatCEP(e.target.value);
                        setForm({ ...form, cep: v });
                        if (v.replace(/\D/g, '').length === 8) handleCepSearch(v);
                      }}
                      placeholder="00000-000"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <Label>Rua *</Label>
                  <Input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Número *</Label>
                  <Input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Complemento</Label>
                  <Input value={form.complement} onChange={(e) => setForm({ ...form, complement: e.target.value })} placeholder="Apto, Bloco..." />
                </div>
                <div className="space-y-2">
                  <Label>Bairro *</Label>
                  <Input value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cidade *</Label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Estado *</Label>
                  <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} maxLength={2} placeholder="SP" />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full">{editingId ? 'Salvar Alterações' : 'Adicionar Endereço'}</Button>
            </CardContent>
          </Card>
        )}

        {addresses.length === 0 && !showForm ? (
          <div className="text-center py-16 space-y-4">
            <MapPin className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="text-lg font-semibold">Nenhum endereço cadastrado</h2>
            <p className="text-muted-foreground">Adicione um endereço para facilitar suas compras.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <Card key={addr.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{addr.label || 'Endereço'}</span>
                        {addr.is_default && <Badge variant="secondary" className="text-xs">Padrão</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {addr.street}, {addr.number}{addr.complement ? ` - ${addr.complement}` : ''}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {addr.neighborhood} — {addr.city}/{addr.state} — CEP {addr.cep}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {!addr.is_default && (
                        <Button variant="ghost" size="icon" onClick={() => handleSetDefault(addr.id)} title="Definir como padrão">
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => startEdit(addr)} title="Editar">
                        <MapPin className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(addr.id)} title="Excluir" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
