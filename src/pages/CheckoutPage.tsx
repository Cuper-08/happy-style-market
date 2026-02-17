import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, CreditCard, QrCode, FileText, Truck, Zap, ArrowLeft, CheckCircle, Search, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchCEP } from '@/lib/cepUtils';
import { createPayment, calculateShipping, type ShippingOption, type PaymentResponse } from '@/services/paymentService';
import { PixQRCodeModal } from '@/components/checkout/PixQRCodeModal';

// Máscaras de formatação
const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .slice(0, 14);
};

const formatPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
};

const formatCEP_mask = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 9);
};

type Step = 'shipping' | 'payment' | 'confirmation';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart, getItemPrice, isWholesale, wholesaleSavings } = useCart();
  const { user, profile, isLoading: authLoading } = useAuth();

  const [step, setStep] = useState<Step>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [shippingData, setShippingData] = useState({
    fullName: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    cpf: profile?.cpf || '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  // Dynamic shipping options
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [selectedShippingId, setSelectedShippingId] = useState<number | null>(null);
  const [shippingFallback, setShippingFallback] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'boleto'>('pix');

  // Credit card state
  const [cardData, setCardData] = useState({
    number: '',
    holderName: '',
    expiryMonth: '',
    expiryYear: '',
    ccv: '',
  });

  // PIX Modal state
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixData, setPixData] = useState<{ qrCode: string; payload: string; orderId: string; value: number }>({
    qrCode: '',
    payload: '',
    orderId: '',
    value: 0,
  });

  // Completed order ID for confirmation
  const [completedOrderId, setCompletedOrderId] = useState<string>('');

  const paymentOptions = {
    pix: { name: 'PIX', description: '10% de desconto', icon: QrCode, discount: 0.1 },
    card: { name: 'Cartão de Crédito', description: 'Em até 12x', icon: CreditCard, discount: 0 },
    boleto: { name: 'Boleto Bancário', description: '5% de desconto', icon: FileText, discount: 0.05 },
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  // Calculate costs
  const selectedShipping = shippingOptions.find(o => o.id === selectedShippingId);
  const shippingCost = selectedShipping?.price || 0;
  const discount = subtotal * paymentOptions[paymentMethod].discount;
  const total = subtotal + shippingCost - discount;

  // Require login BEFORE filling checkout form
  useEffect(() => {
    if (!authLoading && !user && step !== 'confirmation') {
      toast({
        title: 'Faça login para continuar',
        description: 'Você precisa estar logado para finalizar a compra.'
      });
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [user, authLoading, navigate, step]);

  // Load shipping options from Melhor Envio API
  const loadShippingOptions = useCallback(async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setIsLoadingShipping(true);
    try {
      const cartItems = items.map(item => ({
        quantity: item.quantity,
        weight: 0.5, // Default weight for sneakers ~500g
        insurance_value: getItemPrice(item),
      }));

      const result = await calculateShipping(cleanCep, cartItems);
      setShippingOptions(result.options);
      setShippingFallback(result.fallback);

      // Auto-select cheapest option
      if (result.options.length > 0) {
        setSelectedShippingId(result.options[0].id);
      }
    } catch (error) {
      console.error('Shipping calculation error:', error);
      // Fallback options
      setShippingOptions([
        { id: 1, name: 'PAC', company: 'Correios', price: 29.90, delivery_time: 10 },
        { id: 2, name: 'SEDEX', company: 'Correios', price: 49.90, delivery_time: 5 },
      ]);
      setSelectedShippingId(1);
      setShippingFallback(true);
    } finally {
      setIsLoadingShipping(false);
    }
  }, [items, getItemPrice]);

  // Pre-load profile and default address
  useEffect(() => {
    if (!user) return;

    const loadUserData = async () => {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, phone, cpf')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: addressData } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .maybeSingle();

      setShippingData(prev => ({
        ...prev,
        fullName: profileData?.full_name || prev.fullName || '',
        phone: profileData?.phone || prev.phone || '',
        cpf: profileData?.cpf || prev.cpf || '',
        email: user.email || prev.email || '',
        ...(addressData ? {
          cep: addressData.cep,
          street: addressData.street,
          number: addressData.number,
          complement: addressData.complement || '',
          neighborhood: addressData.neighborhood,
          city: addressData.city,
          state: addressData.state,
        } : {}),
      }));

      // If address has CEP, load shipping options
      if (addressData?.cep) {
        loadShippingOptions(addressData.cep);
      }
    };

    loadUserData();
  }, [user, loadShippingOptions]);



  // Busca automática de CEP via ViaCEP + calcula frete
  const handleCepSearch = useCallback(async (cep: string) => {
    try {
      const result = await fetchCEP(cep);
      if (result) {
        setShippingData(prev => ({ ...prev, ...result }));
        toast({ title: 'Endereço encontrado!' });
        // Also calculate shipping
        loadShippingOptions(cep);
      } else {
        toast({ title: 'CEP não encontrado', variant: 'destructive' });
      }
    } catch (error) {
      console.error('CEP lookup error:', error);
      toast({ title: 'Erro ao buscar CEP', variant: 'destructive' });
    }
  }, [loadShippingOptions]);

  // Redirect if cart is empty
  if (items.length === 0 && step !== 'confirmation') {
    navigate('/carrinho');
    return null;
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-80 rounded-xl" />
            </div>
            <Skeleton className="h-72 rounded-xl" />
          </div>
        </div>
      </Layout>
    );
  }

  // Show redirect message if not logged in
  if (!user && step !== 'confirmation') {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Redirecionando para login...</p>
        </div>
      </Layout>
    );
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const required = ['fullName', 'email', 'phone', 'cpf', 'cep', 'street', 'number', 'neighborhood', 'city', 'state'];
    const missing = required.filter(field => !shippingData[field as keyof typeof shippingData]);

    if (missing.length > 0) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }

    if (!selectedShippingId) {
      toast({ title: 'Selecione um método de envio', variant: 'destructive' });
      return;
    }

    setStep('payment');
  };

  const handlePaymentSubmit = async () => {
    if (!user) {
      toast({
        title: 'Faça login para finalizar',
        description: 'Você precisa estar logado para concluir o pedido.',
        variant: 'destructive'
      });
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    // Validate card data if paying by card
    if (paymentMethod === 'card') {
      if (!cardData.number || !cardData.holderName || !cardData.expiryMonth || !cardData.expiryYear || !cardData.ccv) {
        toast({ title: 'Preencha todos os dados do cartão', variant: 'destructive' });
        return;
      }
    }

    setIsProcessing(true);

    try {
      // 1. Create order in database
      const shippingMethodName = selectedShipping?.name || 'PAC';
      const orderData = {
        user_id: user.id,
        status: 'pending' as const,
        subtotal: subtotal,
        shipping_cost: shippingCost,
        discount: discount,
        total: total,
        payment_method: paymentMethod,
        shipping_method: (shippingMethodName.toLowerCase().includes('sedex') ? 'sedex' : 'pac') as 'sedex' | 'pac' | 'express',
        shipping_address: {
          full_name: shippingData.fullName,
          email: shippingData.email,
          phone: shippingData.phone,
          cpf: shippingData.cpf,
          cep: shippingData.cep,
          street: shippingData.street,
          number: shippingData.number,
          complement: shippingData.complement,
          neighborhood: shippingData.neighborhood,
          city: shippingData.city,
          state: shippingData.state,
        },
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error('Erro ao criar pedido');
      }

      // 2. Insert order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        variant_id: item.variant?.id || null,
        product_name: item.product.title,
        variant_info: item.variant
          ? `Tam ${item.variant.size}`
          : null,
        quantity: item.quantity,
        unit_price: getItemPrice(item),
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items error:', itemsError);
        throw new Error('Erro ao salvar itens do pedido');
      }

      // 3. Decrement stock atomically
      const stockItems = items
        .filter(item => item.variant?.id)
        .map(item => ({
          variant_id: item.variant!.id,
          quantity: item.quantity,
        }));

      if (stockItems.length > 0) {
        const { data: stockOk, error: stockError } = await supabase
          .rpc('decrement_stock', { p_items: stockItems });

        if (stockError) {
          console.error('Stock decrement error:', stockError);
        }
        if (stockOk === false) {
          throw new Error('Estoque insuficiente para um ou mais itens. Por favor, revise seu carrinho.');
        }
      }

      // 4. Save profile data
      await supabase
        .from('profiles')
        .update({
          full_name: shippingData.fullName,
          phone: shippingData.phone,
          cpf: shippingData.cpf,
        })
        .eq('user_id', user.id);

      // 5. Save address if not already exists
      const { data: existingAddr } = await supabase
        .from('addresses')
        .select('id')
        .eq('user_id', user.id)
        .eq('cep', shippingData.cep.replace(/\D/g, ''))
        .eq('number', shippingData.number)
        .maybeSingle();

      if (!existingAddr) {
        await supabase.from('addresses').insert({
          user_id: user.id,
          label: 'Casa',
          cep: shippingData.cep,
          street: shippingData.street,
          number: shippingData.number,
          complement: shippingData.complement || null,
          neighborhood: shippingData.neighborhood,
          city: shippingData.city,
          state: shippingData.state,
          is_default: true,
        });
      }

      // 6. Create payment via ASAAS
      const cleanCpf = shippingData.cpf.replace(/\D/g, '');
      const cleanPhone = shippingData.phone.replace(/\D/g, '');

      try {
        const paymentResponse: PaymentResponse = await createPayment({
          orderId: order.id,
          paymentMethod,
          customer: {
            name: shippingData.fullName,
            email: shippingData.email,
            cpfCnpj: cleanCpf,
            phone: cleanPhone,
          },
          value: total,
          description: `Pedido Happy Style #${order.id.slice(0, 8).toUpperCase()}`,
          ...(paymentMethod === 'card' ? {
            creditCard: {
              holderName: cardData.holderName,
              number: cardData.number.replace(/\s/g, ''),
              expiryMonth: cardData.expiryMonth,
              expiryYear: cardData.expiryYear,
              ccv: cardData.ccv,
            },
            creditCardHolderInfo: {
              name: shippingData.fullName,
              email: shippingData.email,
              cpfCnpj: cleanCpf,
              postalCode: shippingData.cep.replace(/\D/g, ''),
              addressNumber: shippingData.number,
              phone: cleanPhone,
            },
          } : {}),
        });

        // Handle response based on payment method
        if (paymentMethod === 'pix' && paymentResponse.pixQrCode) {
          // Show PIX QR Code modal
          setPixData({
            qrCode: paymentResponse.pixQrCode,
            payload: paymentResponse.pixPayload || '',
            orderId: order.id,
            value: total,
          });
          setShowPixModal(true);
          setCompletedOrderId(order.id);
        } else if (paymentMethod === 'card') {
          // Card payment processed instantly
          clearCart();
          setCompletedOrderId(order.id);
          setStep('confirmation');
          toast({
            title: 'Pagamento aprovado! 🎉',
            description: 'Seu cartão foi cobrado com sucesso.'
          });
        } else if (paymentMethod === 'boleto' && paymentResponse.bankSlipUrl) {
          // Open boleto URL and show confirmation
          window.open(paymentResponse.bankSlipUrl, '_blank');
          clearCart();
          setCompletedOrderId(order.id);
          setStep('confirmation');
          toast({
            title: 'Boleto gerado! 📄',
            description: 'O boleto foi aberto em uma nova aba.'
          });
        } else {
          // Fallback: if ASAAS doesn't return expected data, still confirm
          clearCart();
          setCompletedOrderId(order.id);
          setStep('confirmation');
          toast({
            title: 'Pedido realizado! ✅',
            description: paymentResponse.invoiceUrl
              ? 'Use o link de pagamento enviado por email.'
              : 'Aguarde a confirmação do pagamento.'
          });
        }

      } catch (paymentError) {
        console.warn('ASAAS payment error (order created):', paymentError);
        // Order was created successfully, even if ASAAS fails
        // Show confirmation with pending payment status
        clearCart();
        setCompletedOrderId(order.id);
        setStep('confirmation');
        toast({
          title: 'Pedido criado com sucesso! ✅',
          description: 'Houve um erro ao processar o pagamento automaticamente. Nossa equipe entrará em contato.',
        });
      }

    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Erro ao finalizar pedido',
        description: error instanceof Error ? error.message : 'Tente novamente ou entre em contato.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // PIX payment confirmed callback
  const handlePixConfirmed = () => {
    setShowPixModal(false);
    clearCart();
    setStep('confirmation');
  };

  if (step === 'confirmation') {
    return (
      <Layout>
        <div className="container py-12 text-center max-w-md mx-auto">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Pedido Confirmado!</h1>
          <p className="text-muted-foreground mb-2">
            Seu pedido foi recebido e está sendo processado.
          </p>
          {completedOrderId && (
            <p className="text-sm font-mono bg-muted px-3 py-1 rounded inline-block mb-6">
              Pedido #{completedOrderId.slice(0, 8).toUpperCase()}
            </p>
          )}
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/minha-conta/pedidos">Ver Meus Pedidos</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/">Voltar para a Loja</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-4">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => step === 'payment' ? setStep('shipping') : navigate('/carrinho')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={cn('flex items-center gap-2', step === 'shipping' && 'text-primary')}>
            <div className={cn(
              'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold',
              step === 'shipping' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}>
              1
            </div>
            <span className="hidden sm:inline text-sm font-medium">Entrega</span>
          </div>
          <div className="h-px w-8 bg-border" />
          <div className={cn('flex items-center gap-2', step === 'payment' && 'text-primary')}>
            <div className={cn(
              'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold',
              step === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}>
              2
            </div>
            <span className="hidden sm:inline text-sm font-medium">Pagamento</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {step === 'shipping' && (
              <form onSubmit={handleShippingSubmit} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Dados Pessoais</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome Completo *</Label>
                        <Input
                          value={shippingData.fullName}
                          onChange={(e) => setShippingData({ ...shippingData, fullName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>E-mail *</Label>
                        <Input
                          type="email"
                          value={shippingData.email}
                          onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Telefone *</Label>
                        <Input
                          value={shippingData.phone}
                          onChange={(e) => setShippingData({ ...shippingData, phone: formatPhone(e.target.value) })}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CPF *</Label>
                        <Input
                          value={shippingData.cpf}
                          onChange={(e) => setShippingData({ ...shippingData, cpf: formatCPF(e.target.value) })}
                          placeholder="000.000.000-00"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Endereço de Entrega</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>CEP *</Label>
                        <div className="relative">
                          <Input
                            value={shippingData.cep}
                            onChange={(e) => {
                              const formatted = formatCEP_mask(e.target.value);
                              setShippingData({ ...shippingData, cep: formatted });
                              if (formatted.replace(/\D/g, '').length === 8) {
                                handleCepSearch(formatted);
                              }
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
                        <Input
                          value={shippingData.street}
                          onChange={(e) => setShippingData({ ...shippingData, street: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Número *</Label>
                        <Input
                          value={shippingData.number}
                          onChange={(e) => setShippingData({ ...shippingData, number: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Complemento</Label>
                        <Input
                          value={shippingData.complement}
                          onChange={(e) => setShippingData({ ...shippingData, complement: e.target.value })}
                          placeholder="Apto, Bloco, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Bairro *</Label>
                        <Input
                          value={shippingData.neighborhood}
                          onChange={(e) => setShippingData({ ...shippingData, neighborhood: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Cidade *</Label>
                        <Input
                          value={shippingData.city}
                          onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Estado *</Label>
                        <Input
                          value={shippingData.state}
                          onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
                          placeholder="SP"
                          maxLength={2}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Dynamic Shipping Options */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Método de Envio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingShipping ? (
                      <div className="space-y-3">
                        <Skeleton className="h-16 rounded-lg" />
                        <Skeleton className="h-16 rounded-lg" />
                      </div>
                    ) : shippingOptions.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Digite seu CEP para calcular o frete</p>
                      </div>
                    ) : (
                      <>
                        {shippingFallback && (
                          <p className="text-xs text-amber-600 mb-3">
                            ⚠️ Valores estimados. O valor final pode variar.
                          </p>
                        )}
                        <RadioGroup
                          value={selectedShippingId?.toString() || ''}
                          onValueChange={(v) => setSelectedShippingId(Number(v))}
                        >
                          {shippingOptions.map((option) => (
                            <label
                              key={option.id}
                              className={cn(
                                'flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors',
                                selectedShippingId === option.id ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/30'
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <RadioGroupItem value={option.id.toString()} />
                                {option.name.toLowerCase().includes('sedex') ? (
                                  <Zap className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                  <Truck className="h-5 w-5 text-muted-foreground" />
                                )}
                                <div>
                                  <span className="font-medium">{option.name}</span>
                                  {option.company && (
                                    <span className="text-xs text-muted-foreground ml-1">({option.company})</span>
                                  )}
                                  <p className="text-sm text-muted-foreground">
                                    {option.delivery_time} dias úteis
                                  </p>
                                </div>
                              </div>
                              <span className="font-bold">{formatPrice(option.price)}</span>
                            </label>
                          ))}
                        </RadioGroup>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Button type="submit" size="lg" className="w-full" disabled={!selectedShippingId}>
                  Continuar para Pagamento
                </Button>
              </form>
            )}

            {step === 'payment' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Forma de Pagamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'pix' | 'card' | 'boleto')}>
                      {Object.entries(paymentOptions).map(([key, option]) => (
                        <label
                          key={key}
                          className={cn(
                            'flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors',
                            paymentMethod === key ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/30'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value={key} />
                            <option.icon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <span className="font-medium">{option.name}</span>
                              <p className="text-sm text-muted-foreground">{option.description}</p>
                            </div>
                          </div>
                          {option.discount > 0 && (
                            <span className="text-sm font-medium text-green-500">
                              -{(option.discount * 100)}%
                            </span>
                          )}
                        </label>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>

                {paymentMethod === 'pix' && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <QrCode className="h-12 w-12 mx-auto mb-3 text-primary/60" />
                      <p className="text-muted-foreground">
                        O QR Code do PIX será gerado após a confirmação do pedido.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Você terá 30 minutos para realizar o pagamento.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {paymentMethod === 'card' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Dados do Cartão</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div className="space-y-2">
                        <Label>Número do Cartão</Label>
                        <Input
                          placeholder="0000 0000 0000 0000"
                          value={cardData.number}
                          onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Mês</Label>
                          <Input
                            placeholder="MM"
                            maxLength={2}
                            value={cardData.expiryMonth}
                            onChange={(e) => setCardData({ ...cardData, expiryMonth: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Ano</Label>
                          <Input
                            placeholder="AAAA"
                            maxLength={4}
                            value={cardData.expiryYear}
                            onChange={(e) => setCardData({ ...cardData, expiryYear: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>CVV</Label>
                          <Input
                            placeholder="000"
                            maxLength={4}
                            value={cardData.ccv}
                            onChange={(e) => setCardData({ ...cardData, ccv: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Nome no Cartão</Label>
                        <Input
                          placeholder="Como está impresso no cartão"
                          value={cardData.holderName}
                          onChange={(e) => setCardData({ ...cardData, holderName: e.target.value.toUpperCase() })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {paymentMethod === 'boleto' && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-primary/60" />
                      <p className="text-muted-foreground">
                        O boleto será gerado após a confirmação do pedido.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Vencimento em 3 dias úteis. O pedido será processado após a compensação.
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handlePaymentSubmit}
                  disabled={isProcessing}
                >
                  {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isProcessing ? 'Processando...' : `Finalizar Pedido — ${formatPrice(total)}`}
                </Button>
              </div>
            )}
          </div>

          {/* Summary */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.variant?.id}`} className="flex gap-3">
                      <img
                        src={item.product.images[0] || '/placeholder.svg'}
                        alt={item.product.title}
                        className="h-12 w-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Qtd: {item.quantity} × {formatPrice(getItemPrice(item))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2 text-sm">
                  {isWholesale && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 mb-2 text-center">
                      <span className="text-green-600 font-bold text-xs">🏷️ ATACADO ATIVO — 6+ peças</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {isWholesale && wholesaleSavings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Economia atacado</span>
                      <span>-{formatPrice(wholesaleSavings)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Frete {selectedShipping ? `(${selectedShipping.name})` : ''}
                    </span>
                    <span>{shippingCost > 0 ? formatPrice(shippingCost) : 'A calcular'}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-500">
                      <span>Desconto ({paymentOptions[paymentMethod].name})</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total</span>
                    <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* PIX QR Code Modal */}
      <PixQRCodeModal
        isOpen={showPixModal}
        orderId={pixData.orderId}
        pixQrCode={pixData.qrCode}
        pixPayload={pixData.payload}
        value={pixData.value}
        onPaymentConfirmed={handlePixConfirmed}
        onClose={() => {
          setShowPixModal(false);
          clearCart();
          setStep('confirmation');
        }}
      />
    </Layout>
  );
}
