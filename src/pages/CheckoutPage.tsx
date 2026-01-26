import { useState } from 'react';
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
import { Loader2, CreditCard, QrCode, FileText, Truck, Zap, ArrowLeft, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = 'shipping' | 'payment' | 'confirmation';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart, getItemPrice } = useCart();
  const { user, profile } = useAuth();

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

  const [shippingMethod, setShippingMethod] = useState<'pac' | 'sedex'>('pac');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'boleto'>('pix');

  const shippingOptions = {
    pac: { name: 'PAC', price: 29.90, days: '8-12 dias úteis', icon: Truck },
    sedex: { name: 'SEDEX', price: 49.90, days: '3-5 dias úteis', icon: Zap },
  };

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

  const shippingCost = shippingOptions[shippingMethod].price;
  const discount = subtotal * paymentOptions[paymentMethod].discount;
  const total = subtotal + shippingCost - discount;

  // Redirect if cart is empty
  if (items.length === 0 && step !== 'confirmation') {
    navigate('/carrinho');
    return null;
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const required = ['fullName', 'email', 'phone', 'cpf', 'cep', 'street', 'number', 'neighborhood', 'city', 'state'];
    const missing = required.filter(field => !shippingData[field as keyof typeof shippingData]);
    
    if (missing.length > 0) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }

    setStep('payment');
  };

  const handlePaymentSubmit = async () => {
    setIsProcessing(true);
    
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Clear cart and show confirmation
    clearCart();
    setStep('confirmation');
    setIsProcessing(false);
    
    toast({ title: 'Pedido realizado com sucesso!' });
  };

  if (step === 'confirmation') {
    return (
      <Layout>
        <div className="container py-12 text-center max-w-md mx-auto">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Pedido Confirmado!</h1>
          <p className="text-muted-foreground mb-6">
            Seu pedido foi recebido e está sendo processado. Você receberá um e-mail com os detalhes.
          </p>
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
                          onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CPF *</Label>
                        <Input
                          value={shippingData.cpf}
                          onChange={(e) => setShippingData({ ...shippingData, cpf: e.target.value })}
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
                        <Input
                          value={shippingData.cep}
                          onChange={(e) => setShippingData({ ...shippingData, cep: e.target.value })}
                          placeholder="00000-000"
                        />
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

                <Card>
                  <CardHeader>
                    <CardTitle>Método de Envio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={shippingMethod} onValueChange={(v) => setShippingMethod(v as 'pac' | 'sedex')}>
                      {Object.entries(shippingOptions).map(([key, option]) => (
                        <label
                          key={key}
                          className={cn(
                            'flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors',
                            shippingMethod === key ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/30'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value={key} />
                            <option.icon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <span className="font-medium">{option.name}</span>
                              <p className="text-sm text-muted-foreground">{option.days}</p>
                            </div>
                          </div>
                          <span className="font-bold">{formatPrice(option.price)}</span>
                        </label>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>

                <Button type="submit" size="lg" className="w-full">
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
                      <p className="text-muted-foreground">
                        O QR Code do PIX será gerado após a confirmação do pedido.
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
                        <Input placeholder="0000 0000 0000 0000" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Validade</Label>
                          <Input placeholder="MM/AA" />
                        </div>
                        <div className="space-y-2">
                          <Label>CVV</Label>
                          <Input placeholder="000" maxLength={4} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Nome no Cartão</Label>
                        <Input placeholder="Como está no cartão" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {paymentMethod === 'boleto' && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">
                        O boleto será gerado após a confirmação do pedido.
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
                  Finalizar Pedido
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
                        alt={item.product.name}
                        className="h-12 w-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qtd: {item.quantity} × {formatPrice(getItemPrice(item))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frete ({shippingOptions[shippingMethod].name})</span>
                    <span>{formatPrice(shippingCost)}</span>
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
    </Layout>
  );
}
