import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AdminLayout } from './AdminLayout';
import { AnimatedPage } from '@/components/admin/AnimatedPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building2, 
  Truck, 
  MessageSquare, 
  FileText, 
  Save, 
  Loader2,
  Phone,
  Mail,
  MapPin,
  Settings as SettingsIcon,
} from 'lucide-react';

interface StoreSettings {
  id: string;
  company_name: string | null;
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    cep?: string;
  } | null;
  shipping_config: {
    default_shipping?: number;
    free_shipping_min?: number;
  } | null;
  privacy_policy: string | null;
  exchange_policy: string | null;
  terms_of_service: string | null;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<StoreSettings>>({});
  const [activeTab, setActiveTab] = useState('company');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as StoreSettings | null;
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<StoreSettings>) => {
      if (settings?.id) {
        const { error } = await supabase
          .from('store_settings')
          .update(data)
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('store_settings')
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
      toast({
        title: 'Configurações salvas!',
        description: 'Suas alterações foram aplicadas com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const updateField = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent: 'address' | 'shipping_config', field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as object || {}),
        [field]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AnimatedPage>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <SettingsIcon className="h-6 w-6 text-primary" />
                Configurações
              </h1>
              <p className="text-muted-foreground">
                Gerencie as configurações da sua loja
              </p>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={saveMutation.isPending}
              className="gap-2"
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar Alterações
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="company" className="gap-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Empresa</span>
              </TabsTrigger>
              <TabsTrigger value="shipping" className="gap-2">
                <Truck className="h-4 w-4" />
                <span className="hidden sm:inline">Frete</span>
              </TabsTrigger>
              <TabsTrigger value="contact" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Contato</span>
              </TabsTrigger>
              <TabsTrigger value="policies" className="gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Políticas</span>
              </TabsTrigger>
            </TabsList>

            {/* Company Tab */}
            <TabsContent value="company" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Dados da Empresa</CardTitle>
                    <CardDescription>
                      Informações básicas do seu negócio
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="company_name">Nome da Empresa</Label>
                        <Input
                          id="company_name"
                          value={formData.company_name || ''}
                          onChange={(e) => updateField('company_name', e.target.value)}
                          placeholder="Brás Conceito"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cnpj">CNPJ</Label>
                        <Input
                          id="cnpj"
                          value={formData.cnpj || ''}
                          onChange={(e) => updateField('cnpj', e.target.value)}
                          placeholder="00.000.000/0000-00"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Endereço
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="street">Rua</Label>
                        <Input
                          id="street"
                          value={(formData.address as StoreSettings['address'])?.street || ''}
                          onChange={(e) => updateNestedField('address', 'street', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="number">Número</Label>
                        <Input
                          id="number"
                          value={(formData.address as StoreSettings['address'])?.number || ''}
                          onChange={(e) => updateNestedField('address', 'number', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="neighborhood">Bairro</Label>
                        <Input
                          id="neighborhood"
                          value={(formData.address as StoreSettings['address'])?.neighborhood || ''}
                          onChange={(e) => updateNestedField('address', 'neighborhood', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          value={(formData.address as StoreSettings['address'])?.city || ''}
                          onChange={(e) => updateNestedField('address', 'city', e.target.value)}
                        />
                      </div>
                      <div className="grid gap-4 grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="state">UF</Label>
                          <Input
                            id="state"
                            value={(formData.address as StoreSettings['address'])?.state || ''}
                            onChange={(e) => updateNestedField('address', 'state', e.target.value)}
                            maxLength={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cep">CEP</Label>
                          <Input
                            id="cep"
                            value={(formData.address as StoreSettings['address'])?.cep || ''}
                            onChange={(e) => updateNestedField('address', 'cep', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Shipping Tab */}
            <TabsContent value="shipping" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações de Frete</CardTitle>
                    <CardDescription>
                      Defina as regras de frete da sua loja
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="default_shipping">Frete Padrão (R$)</Label>
                        <Input
                          id="default_shipping"
                          type="number"
                          value={(formData.shipping_config as StoreSettings['shipping_config'])?.default_shipping || 15}
                          onChange={(e) => updateNestedField('shipping_config', 'default_shipping', parseFloat(e.target.value))}
                        />
                        <p className="text-xs text-muted-foreground">
                          Valor cobrado quando o frete não é grátis
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="free_shipping_min">Frete Grátis a partir de (R$)</Label>
                        <Input
                          id="free_shipping_min"
                          type="number"
                          value={(formData.shipping_config as StoreSettings['shipping_config'])?.free_shipping_min || 299}
                          onChange={(e) => updateNestedField('shipping_config', 'free_shipping_min', parseFloat(e.target.value))}
                        />
                        <p className="text-xs text-muted-foreground">
                          Pedidos acima deste valor têm frete grátis
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Integração com SuperFrete</p>
                        <p className="text-sm text-muted-foreground">
                          Calcule fretes automaticamente via PAC e SEDEX
                        </p>
                      </div>
                      <Switch disabled />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Em breve: integração automática com Correios
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Informações de Contato</CardTitle>
                    <CardDescription>
                      Como os clientes podem entrar em contato
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        E-mail
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="contato@brasconceito.com.br"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Telefone
                        </Label>
                        <Input
                          id="phone"
                          value={formData.phone || ''}
                          onChange={(e) => updateField('phone', e.target.value)}
                          placeholder="(11) 3000-0000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp" className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          WhatsApp
                        </Label>
                        <Input
                          id="whatsapp"
                          value={formData.whatsapp || ''}
                          onChange={(e) => updateField('whatsapp', e.target.value)}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Policies Tab */}
            <TabsContent value="policies" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Política de Trocas e Devoluções</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={formData.exchange_policy || ''}
                      onChange={(e) => updateField('exchange_policy', e.target.value)}
                      placeholder="Descreva sua política de trocas e devoluções..."
                      rows={6}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Política de Privacidade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={formData.privacy_policy || ''}
                      onChange={(e) => updateField('privacy_policy', e.target.value)}
                      placeholder="Descreva sua política de privacidade..."
                      rows={6}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Termos de Serviço</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={formData.terms_of_service || ''}
                      onChange={(e) => updateField('terms_of_service', e.target.value)}
                      placeholder="Descreva seus termos de serviço..."
                      rows={6}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </AnimatedPage>
    </AdminLayout>
  );
}
