import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { useAdminCustomers } from '@/hooks/admin/useAdminCustomers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Loader2, Users, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';

export default function CustomersPage() {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  const { data: customers, isLoading } = useAdminCustomers();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const filteredCustomers = (customers || []).filter((customer) => {
    const matchesType =
      typeFilter === 'all' || customer.customer_type === typeFilter;
    const matchesSearch =
      !searchTerm ||
      customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm) ||
      customer.cpf?.includes(searchTerm);
    return matchesType && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-muted-foreground">Gerencie os clientes cadastrados</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, telefone ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={typeFilter}
                onValueChange={(v) => setTypeFilter(v)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Tipo de cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="retail">Varejo</SelectItem>
                  <SelectItem value="wholesale">Atacado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Customers List */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users className="h-5 w-5" />
              Lista de Clientes ({filteredCustomers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum cliente encontrado</p>
              </div>
            ) : isMobile ? (
              /* Mobile Card View */
              <div className="space-y-3">
                {filteredCustomers.map((customer) => (
                  <Link
                    key={customer.id}
                    to={`/admin/clientes/${customer.user_id}`}
                    className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">
                          {customer.full_name || 'Nome não informado'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {customer.phone || 'Sem telefone'}
                        </p>
                        {customer.cpf && (
                          <p className="text-xs text-muted-foreground">
                            CPF: {customer.cpf}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={
                          customer.customer_type === 'wholesale'
                            ? 'default'
                            : 'secondary'
                        }
                        className="shrink-0"
                      >
                        {customer.customer_type === 'wholesale'
                          ? 'Atacado'
                          : 'Varejo'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t text-sm">
                      <span className="text-muted-foreground">
                        {customer.totalOrders} pedido(s)
                      </span>
                      <span className="font-medium">
                        {formatCurrency(customer.totalSpent)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* Desktop Table View */
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Pedidos</TableHead>
                      <TableHead>Total Gasto</TableHead>
                      <TableHead>Desde</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {customer.full_name || 'Nome não informado'}
                            </p>
                            {customer.cpf && (
                              <p className="text-xs text-muted-foreground">
                                CPF: {customer.cpf}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{customer.phone || '-'}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              customer.customer_type === 'wholesale'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {customer.customer_type === 'wholesale'
                              ? 'Atacado'
                              : 'Varejo'}
                          </Badge>
                        </TableCell>
                        <TableCell>{customer.totalOrders}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(customer.totalSpent)}
                        </TableCell>
                        <TableCell>
                          {format(new Date(customer.created_at), 'dd/MM/yyyy', {
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/admin/clientes/${customer.user_id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
