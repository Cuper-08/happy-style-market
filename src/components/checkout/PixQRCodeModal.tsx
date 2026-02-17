import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { checkPaymentStatus } from '@/services/paymentService';
import { CheckCircle, Copy, Clock, Loader2, QrCode } from 'lucide-react';

interface PixQRCodeModalProps {
    isOpen: boolean;
    orderId: string;
    pixQrCode: string;      // Base64 encoded image
    pixPayload: string;     // Pix Copia e Cola text 
    value: number;
    onPaymentConfirmed: () => void;
    onClose: () => void;
}

export function PixQRCodeModal({
    isOpen,
    orderId,
    pixQrCode,
    pixPayload,
    value,
    onPaymentConfirmed,
    onClose,
}: PixQRCodeModalProps) {
    const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
    const [isPaid, setIsPaid] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [copied, setCopied] = useState(false);

    // Timer countdown
    useEffect(() => {
        if (!isOpen || isPaid) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    toast({
                        title: 'PIX expirado',
                        description: 'O QR Code PIX expirou. Crie um novo pedido.',
                        variant: 'destructive',
                    });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, isPaid]);

    // Poll for payment status every 5 seconds
    useEffect(() => {
        if (!isOpen || isPaid || !orderId) return;

        const pollInterval = setInterval(async () => {
            try {
                setIsChecking(true);
                const status = await checkPaymentStatus(orderId);
                if (status === 'paid') {
                    setIsPaid(true);
                    clearInterval(pollInterval);
                    toast({
                        title: 'Pagamento confirmado! 🎉',
                        description: 'Seu pagamento PIX foi recebido com sucesso!',
                    });
                    setTimeout(() => onPaymentConfirmed(), 2000);
                }
            } catch {
                // silently ignore polling errors
            } finally {
                setIsChecking(false);
            }
        }, 5000);

        return () => clearInterval(pollInterval);
    }, [isOpen, isPaid, orderId, onPaymentConfirmed]);

    const copyPixCode = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(pixPayload);
            setCopied(true);
            toast({ title: 'Código PIX copiado! ✅' });
            setTimeout(() => setCopied(false), 3000);
        } catch {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = pixPayload;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopied(true);
            toast({ title: 'Código PIX copiado! ✅' });
            setTimeout(() => setCopied(false), 3000);
        }
    }, [pixPayload]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-md animate-in fade-in-0 zoom-in-95">
                <CardHeader className="text-center pb-2">
                    {isPaid ? (
                        <>
                            <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <CardTitle className="text-xl text-green-600">Pagamento Confirmado! 🎉</CardTitle>
                        </>
                    ) : (
                        <>
                            <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <QrCode className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-xl">Pague com PIX</CardTitle>
                        </>
                    )}
                </CardHeader>

                <CardContent className="space-y-4">
                    {!isPaid && (
                        <>
                            {/* Value */}
                            <div className="text-center">
                                <span className="text-3xl font-bold text-primary">{formatCurrency(value)}</span>
                            </div>

                            {/* QR Code */}
                            <div className="flex justify-center">
                                <div className="bg-white p-3 rounded-lg shadow-inner">
                                    <img
                                        src={`data:image/png;base64,${pixQrCode}`}
                                        alt="QR Code PIX"
                                        className="w-56 h-56 object-contain"
                                    />
                                </div>
                            </div>

                            {/* Copy Pix Code Button */}
                            <Button
                                variant="outline"
                                className="w-full gap-2 h-12"
                                onClick={copyPixCode}
                            >
                                {copied ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                                {copied ? 'Copiado!' : 'Copiar código Pix Copia e Cola'}
                            </Button>

                            {/* Timer */}
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>Expira em: <strong className={timeLeft < 300 ? 'text-red-500' : ''}>{formatTime(timeLeft)}</strong></span>
                            </div>

                            {/* Checking status */}
                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                {isChecking ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                )}
                                Aguardando pagamento...
                            </div>

                            {/* Instructions */}
                            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                                <p><strong>Como pagar:</strong></p>
                                <p>1. Abra o app do seu banco ou carteira digital</p>
                                <p>2. Escaneie o QR Code ou cole o código PIX</p>
                                <p>3. Confirme o pagamento</p>
                                <p>4. A confirmação é automática em até 30 segundos</p>
                            </div>
                        </>
                    )}

                    {isPaid && (
                        <div className="text-center space-y-3">
                            <p className="text-muted-foreground">Seu pedido será processado em breve.</p>
                            <p className="font-semibold">{formatCurrency(value)}</p>
                        </div>
                    )}

                    {/* Close button */}
                    {!isPaid && (
                        <Button variant="ghost" className="w-full" onClick={onClose}>
                            Cancelar
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
