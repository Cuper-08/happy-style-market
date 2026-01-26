import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function ReportsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Análises e exportações</p>
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
              <li>Ver gráficos de vendas por período</li>
              <li>Análise por categoria e produto</li>
              <li>Comparativo atacado vs varejo</li>
              <li>Exportar relatórios para Excel/PDF</li>
              <li>Alertas de estoque baixo</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
