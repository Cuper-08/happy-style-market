import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAdminCategories } from '@/hooks/admin/useAdminCategories';
import { useAdminBrands } from '@/hooks/admin/useAdminBrands';
import { parseCSV, downloadCSVTemplate, type ParsedProduct } from './csvTemplate';
import { useBulkCreateProducts } from '@/hooks/admin/useBulkImport';

interface BulkImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAX_PREVIEW = 50;

export function BulkImportModal({ open, onOpenChange }: BulkImportModalProps) {
  const [products, setProducts] = useState<ParsedProduct[]>([]);
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  const { categories } = useAdminCategories();
  const { brands } = useAdminBrands();
  const bulkCreate = useBulkCreateProducts();

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
        setProducts(parsed);
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

  const handleImport = async () => {
    if (validProducts.length === 0) return;
    setImporting(true);
    setProgress(0);

    const batchSize = 10;
    let success = 0;
    let failed = 0;

    for (let i = 0; i < validProducts.length; i += batchSize) {
      const batch = validProducts.slice(i, i + batchSize);
      try {
        await bulkCreate.mutateAsync(batch);
        success += batch.length;
      } catch {
        failed += batch.length;
      }
      setProgress(Math.round(((i + batch.length) / validProducts.length) * 100));
    }

    setResult({ success, failed });
    setImporting(false);
  };

  const handleClose = (value: boolean) => {
    if (importing) return;
    if (!value) {
      setProducts([]);
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
            </div>

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
                      <TableCell>{p.categoryName || '-'}</TableCell>
                      <TableCell>{p.brandName || '-'}</TableCell>
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
                <Button variant="outline" onClick={() => { setProducts([]); setFileName(''); }}>
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
