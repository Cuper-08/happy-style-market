import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function SettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Configure sua loja</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Construction className="h-5 w-5" />
              Em construção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Esta página está sendo desenvolvida. Em breve você poderá:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
              <li>Configurar dados da empresa (CNPJ, endereço)</li>
              <li>Atualizar logo e banner</li>
              <li>Gerenciar informações de contato</li>
              <li>Configurar frete e cupons de desconto</li>
              <li>Editar políticas (troca, devolução, privacidade)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
