import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2, Download, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAdminCategories } from '@/hooks/admin/useAdminCategories';
import { useAdminBrands } from '@/hooks/admin/useAdminBrands';
import { parseCSV, downloadCSVTemplate, type ParsedProduct, type ParseResult } from './csvTemplate';
import { useBulkCreateProducts } from '@/hooks/admin/useBulkImport';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface BulkImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAX_PREVIEW = 50;

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalize(str: string): string {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

export function BulkImportModal({ open, onOpenChange }: BulkImportModalProps) {
  const [products, setProducts] = useState<ParsedProduct[]>([]);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  const { categories } = useAdminCategories();
  const { brands } = useAdminBrands();
  const bulkCreate = useBulkCreateProducts();
  const queryClient = useQueryClient();

  const onDrop = useCallback(
    (files: File[]) => {
      const file = files[0];
      if (!file) return;
      setFileName(file.name);
      setResult(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const parsed = parseCSV(text, categories, brands);
        setParseResult(parsed);
        setProducts(parsed.products);
      };
      reader.readAsText(file, 'UTF-8');
    },
    [categories, brands]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'text/plain': ['.txt'] },
    maxFiles: 1,
    disabled: importing,
  });

  const validProducts = products.filter(p => p.errors.length === 0);
  const invalidProducts = products.filter(p => p.errors.length > 0);
  const newCategories = parseResult?.newCategories || [];
  const newBrands = parseResult?.newBrands || [];

  const handleImport = async () => {
    if (validProducts.length === 0) return;
    setImporting(true);
    setProgress(0);

    try {
      // Step 1: Create missing categories
      const catIdMap = new Map<string, string>();
      if (newCategories.length > 0) {
        const catInserts = newCategories.map(name => ({
          name,
          slug: generateSlug(name),
        }));
        const { data: createdCats, error: catError } = await supabase
          .from('categories')
          .insert(catInserts)
          .select('id, name');
        if (catError) throw catError;
        createdCats?.forEach(c => catIdMap.set(normalize(c.name), c.id));
        queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      }

      // Step 2: Create missing brands
      const brandIdMap = new Map<string, string>();
      if (newBrands.length > 0) {
        const brandInserts = newBrands.map(name => ({
          name,
          slug: generateSlug(name),
        }));
        const { data: createdBrands, error: brandError } = await supabase
          .from('brands')
          .insert(brandInserts)
          .select('id, name');
        if (brandError) throw brandError;
        createdBrands?.forEach(b => brandIdMap.set(normalize(b.name), b.id));
        queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
        queryClient.invalidateQueries({ queryKey: ['brands'] });
      }

      // Step 3: Update product IDs with newly created categories/brands
      const updatedProducts = validProducts.map(p => {
        const updated = { ...p };
        if (p.categoryName && !p.category_id) {
          updated.category_id = catIdMap.get(normalize(p.categoryName));
        }
        if (p.brandName && !p.brand_id) {
          updated.brand_id = brandIdMap.get(normalize(p.brandName));
        }
        return updated;
      });

      // Step 4: Import products in batches
      const batchSize = 10;
      let success = 0;
      let failed = 0;

      for (let i = 0; i < updatedProducts.length; i += batchSize) {
        const batch = updatedProducts.slice(i, i + batchSize);
        try {
          await bulkCreate.mutateAsync(batch);
          success += batch.length;
        } catch {
          failed += batch.length;
        }
        setProgress(Math.round(((i + batch.length) / updatedProducts.length) * 100));
      }

      setResult({ success, failed });
    } catch (error) {
      console.error('Import error:', error);
      setResult({ success: 0, failed: validProducts.length });
    }

    setImporting(false);
  };

  const handleClose = (value: boolean) => {
    if (importing) return;
    if (!value) {
      setProducts([]);
      setParseResult(null);
      setFileName('');
      setResult(null);
      setProgress(0);
    }
    onOpenChange(value);
  };

  const totalVariants = products.reduce((sum, p) => sum + p.variants.length, 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Importar Produtos via CSV</DialogTitle>
          <DialogDescription>
            Faça upload do arquivo CSV preenchido com seus produtos.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <div className="text-center">
              <p className="text-lg font-semibold">{result.success} produtos importados</p>
              {result.failed > 0 && (
                <p className="text-sm text-destructive">{result.failed} falharam</p>
              )}
            </div>
            <Button onClick={() => handleClose(false)}>Fechar</Button>
          </div>
        ) : products.length === 0 ? (
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
                isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              )}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Arraste o arquivo CSV ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground mt-1">.csv separado por ; ou ,</p>
            </div>
            <Button variant="outline" className="w-full" onClick={downloadCSVTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Baixar Modelo CSV
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 min-h-0 flex-1">
            {/* Summary */}
            <div className="flex flex-wrap gap-3 items-center">
              <Badge variant="secondary">
                <FileText className="h-3 w-3 mr-1" />
                {fileName}
              </Badge>
              <Badge variant="secondary">{products.length} produtos</Badge>
              <Badge variant="secondary">{totalVariants} variantes</Badge>
              {invalidProducts.length > 0 && (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {invalidProducts.length} com erro
                </Badge>
              )}
              {newCategories.length > 0 && (
                <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">
                  <PlusCircle className="h-3 w-3 mr-1" />
                  {newCategories.length} nova(s) categoria(s)
                </Badge>
              )}
              {newBrands.length > 0 && (
                <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">
                  <PlusCircle className="h-3 w-3 mr-1" />
                  {newBrands.length} nova(s) marca(s)
                </Badge>
              )}
            </div>

            {/* New categories/brands detail */}
            {(newCategories.length > 0 || newBrands.length > 0) && (
              <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 rounded-md p-2 space-y-1">
                {newCategories.length > 0 && (
                  <p>📁 Categorias a criar: <strong>{newCategories.join(', ')}</strong></p>
                )}
                {newBrands.length > 0 && (
                  <p>🏷️ Marcas a criar: <strong>{newBrands.join(', ')}</strong></p>
                )}
              </div>
            )}

            {/* Preview table */}
            <ScrollArea className="flex-1 min-h-0 border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Variantes</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.slice(0, MAX_PREVIEW).map((p, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>
                        {p.categoryName || '-'}
                        {p.categoryName && !p.category_id && (
                          <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0 text-blue-600 border-blue-300">nova</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {p.brandName || '-'}
                        {p.brandName && !p.brand_id && (
                          <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0 text-blue-600 border-blue-300">nova</Badge>
                        )}
                      </TableCell>
                      <TableCell>R$ {p.retail_price.toFixed(2)}</TableCell>
                      <TableCell>{p.variants.length}</TableCell>
                      <TableCell>
                        {p.errors.length > 0 ? (
                          <span className="text-xs text-destructive" title={p.errors.join(', ')}>
                            <AlertCircle className="h-3.5 w-3.5 inline mr-1" />
                            {p.errors[0]}
                          </span>
                        ) : (
                          <span className="text-xs text-green-600">
                            <CheckCircle2 className="h-3.5 w-3.5 inline mr-1" />OK
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {products.length > MAX_PREVIEW && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Mostrando {MAX_PREVIEW} de {products.length} produtos
                </p>
              )}
            </ScrollArea>

            {/* Import progress / action */}
            {importing ? (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 inline animate-spin mr-1" />
                  Importando... {progress}%
                </p>
              </div>
            ) : (
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setProducts([]); setParseResult(null); setFileName(''); }}>
                  Trocar arquivo
                </Button>
                <Button onClick={handleImport} disabled={validProducts.length === 0}>
                  Importar {validProducts.length} produtos
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
