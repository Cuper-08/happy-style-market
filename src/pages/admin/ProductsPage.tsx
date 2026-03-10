import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { useAdminProducts } from '@/hooks/admin/useAdminProducts';
import { useCategories } from '@/hooks/useProducts';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Search, Loader2, Pencil, Trash2, Package, ChevronLeft, ChevronRight, Star, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

type SortColumn = 'title' | 'category' | 'price_retail' | 'price' | 'stock';
type SortDirection = 'asc' | 'desc';

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(() => {
    const page = parseInt(searchParams.get('page') || '1', 10);
    return page > 0 ? page : 1;
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const pageSize = 20;
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { products, isLoading, deleteProduct, isDeleting } = useAdminProducts();
  const { data: categories } = useCategories();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const getStockCount = (variants: { stock?: boolean }[]) => {
    if (!variants || variants.length === 0) return 0;
    return variants.filter((v) => v.stock !== false).length;
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch = !searchTerm ||
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.slug.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;

      const hasStock = product.variants?.some(v => v.stock !== false);
      const matchesStock = stockFilter === 'all' ||
        (stockFilter === 'in_stock' && hasStock) ||
        (stockFilter === 'out_of_stock' && !hasStock);

      return matchesSearch && matchesCategory && matchesStock;
    });

    if (sortColumn) {
      result = [...result].sort((a, b) => {
        let cmp = 0;
        switch (sortColumn) {
          case 'title':
            cmp = a.title.localeCompare(b.title, 'pt-BR');
            break;
          case 'category':
            cmp = (a.category || '').localeCompare(b.category || '', 'pt-BR');
            break;
          case 'price_retail':
            cmp = (Number(a.price_retail) || 0) - (Number(b.price_retail) || 0);
            break;
          case 'price':
            cmp = (Number(a.price) || 0) - (Number(b.price) || 0);
            break;
          case 'stock':
            cmp = getStockCount(a.variants) - getStockCount(b.variants);
            break;
        }
        return sortDirection === 'desc' ? -cmp : cmp;
      });
    }

    return result;
  }, [products, searchTerm, categoryFilter, stockFilter, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / pageSize);
  const paginatedProducts = filteredAndSortedProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (currentPage > 1) params.page = String(currentPage);
    setSearchParams(params, { replace: true });
  }, [currentPage, setSearchParams]);

  const handleFilterChange = () => { setCurrentPage(1); setSelectedIds(new Set()); };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDirection === 'asc'
      ? <ArrowUp className="h-3 w-3 ml-1 text-primary" />
      : <ArrowDown className="h-3 w-3 ml-1 text-primary" />;
  };

  const getStockLabel = (variants: { stock?: boolean }[]) => {
    if (!variants || variants.length === 0) return '-';
    const inStock = variants.filter((v) => v.stock !== false).length;
    return `${inStock}/${variants.length}`;
  };

  const productCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(cats).sort() as string[];
  }, [products]);

  // Bulk selection
  const allPageSelected = paginatedProducts.length > 0 && paginatedProducts.every(p => selectedIds.has(p.id));
  const somePageSelected = paginatedProducts.some(p => selectedIds.has(p.id));

  const toggleSelectAll = () => {
    if (allPageSelected) {
      const next = new Set(selectedIds);
      paginatedProducts.forEach(p => next.delete(p.id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      paginatedProducts.forEach(p => next.add(p.id));
      setSelectedIds(next);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkDelete = async () => {
    setIsBulkProcessing(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', Array.from(selectedIds));
      if (error) throw error;
      toast({ title: 'Produtos excluídos', description: `${selectedIds.size} produto(s) excluído(s) com sucesso.` });
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível excluir os produtos.', variant: 'destructive' });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkFeatured = async (featured: boolean) => {
    setIsBulkProcessing(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ featured })
        .in('id', Array.from(selectedIds));
      if (error) throw error;
      toast({ title: featured ? 'Marcados como destaque' : 'Removidos do destaque', description: `${selectedIds.size} produto(s) atualizado(s).` });
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível atualizar os produtos.', variant: 'destructive' });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <AdminPageHeader title="Produtos" description="Gerencie o catálogo de produtos da loja." />
          <Button asChild className="w-full sm:w-auto">
            <Link to={`/admin/produtos/novo${currentPage > 1 ? `?page=${currentPage}` : ''}`}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou slug..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); handleFilterChange(); }}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); handleFilterChange(); }}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas categorias</SelectItem>
                  {productCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={(v) => { setStockFilter(v); handleFilterChange(); }}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Estoque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo estoque</SelectItem>
                  <SelectItem value="in_stock">Com estoque</SelectItem>
                  <SelectItem value="out_of_stock">Sem estoque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions Toolbar */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-primary/30 bg-primary/5 backdrop-blur-sm"
            >
              <span className="text-sm font-medium text-primary">
                {selectedIds.size} selecionado(s)
              </span>
              <div className="flex-1" />
              <Button
                size="sm"
                variant="outline"
                disabled={isBulkProcessing}
                onClick={() => handleBulkFeatured(true)}
              >
                <Star className="h-3.5 w-3.5 mr-1.5 text-yellow-500 fill-yellow-500" />
                Destacar
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isBulkProcessing}
                onClick={() => handleBulkFeatured(false)}
              >
                <Star className="h-3.5 w-3.5 mr-1.5" />
                Remover destaque
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive" disabled={isBulkProcessing}>
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir {selectedIds.size} produto(s)?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Os produtos selecionados serão permanentemente excluídos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Excluir {selectedIds.size} produto(s)
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedIds(new Set())}
              >
                Limpar
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Package className="h-5 w-5" />
              Lista de Produtos ({filteredAndSortedProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredAndSortedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Nenhum produto encontrado</p>
                <Button asChild>
                  <Link to="/admin/produtos/novo">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar primeiro produto
                  </Link>
                </Button>
              </div>
            ) : isMobile ? (
              <div className="space-y-3">
                {paginatedProducts.map((product) => (
                  <div key={product.id} className="p-4 rounded-lg border">
                    <div className="flex gap-3">
                      <Checkbox
                        checked={selectedIds.has(product.id)}
                        onCheckedChange={() => toggleSelect(product.id)}
                        className="mt-1"
                      />
                      {product.images && product.images[0] ? (
                        <img src={product.images[0]} alt={product.title} className="h-16 w-16 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">
                          {product.featured && <Star className="inline h-3.5 w-3.5 text-yellow-500 fill-yellow-500 mr-1" />}
                          {product.title}
                        </p>
                        <p className="text-sm font-semibold mt-1">
                          {product.price_retail ? formatCurrency(Number(product.price_retail)) : '-'}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          Estoque: {getStockLabel(product.variants)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end mt-3 pt-3 border-t gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/admin/produtos/${product.id}${currentPage > 1 ? `?page=${currentPage}` : ''}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. O produto "{product.title}" será permanentemente excluído.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteProduct(product.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={allPageSelected}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Selecionar todos"
                        />
                      </TableHead>
                      <TableHead>
                        <button onClick={() => handleSort('title')} className="flex items-center hover:text-foreground transition-colors">
                          Produto <SortIcon column="title" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button onClick={() => handleSort('category')} className="flex items-center hover:text-foreground transition-colors">
                          Categoria <SortIcon column="category" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button onClick={() => handleSort('price_retail')} className="flex items-center hover:text-foreground transition-colors">
                          Preço Varejo <SortIcon column="price_retail" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button onClick={() => handleSort('price')} className="flex items-center hover:text-foreground transition-colors">
                          Preço Atacado <SortIcon column="price" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button onClick={() => handleSort('stock')} className="flex items-center hover:text-foreground transition-colors">
                          Estoque <SortIcon column="stock" />
                        </button>
                      </TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.map((product) => (
                      <TableRow key={product.id} className={selectedIds.has(product.id) ? 'bg-primary/5' : ''}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(product.id)}
                            onCheckedChange={() => toggleSelect(product.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {product.images && product.images[0] ? (
                              <img src={product.images[0]} alt={product.title} className="h-10 w-10 rounded-lg object-cover" />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">
                                {product.featured && <Star className="inline h-3.5 w-3.5 text-yellow-500 fill-yellow-500 mr-1" />}
                                {product.title}
                              </p>
                              <p className="text-xs text-muted-foreground">/{product.slug}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{product.category || '-'}</TableCell>
                        <TableCell>{product.price_retail ? formatCurrency(Number(product.price_retail)) : '-'}</TableCell>
                        <TableCell>{product.price ? formatCurrency(Number(product.price)) : '-'}</TableCell>
                        <TableCell>{getStockLabel(product.variants)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/admin/produtos/${product.id}${currentPage > 1 ? `?page=${currentPage}` : ''}`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. O produto "{product.title}" será permanentemente excluído.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteProduct(product.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t mt-4">
                <p className="text-sm text-muted-foreground">
                  {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredAndSortedProducts.length)} de {filteredAndSortedProducts.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">{currentPage} / {totalPages}</span>
                  <Button variant="outline" size="icon" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
