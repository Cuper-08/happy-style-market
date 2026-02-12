import { useState, useCallback } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2, AlertCircle, CheckCircle2, Plus, Sparkles } from 'lucide-react';
import { parseUpdateCSV, type ProductDiff } from '@/components/admin/csvTemplate';
import { useBulkUpdateProducts, type ProductChange } from '@/hooks/admin/useBulkUpdate';
import type { Product } from '@/types';

interface BulkUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
}

const fieldLabels: Record<string, string> = {
  retail_price: 'Preço Varejo',
  wholesale_price: 'Preço Atacado',
  wholesale_min_qty: 'Qtd Mín. Atacado',
  featured: 'Destaque',
  is_new: 'Novo',
  is_active: 'Ativo',
  size: 'Tamanho',
  color: 'Cor',
  color_hex: 'Hex Cor',
  stock_quantity: 'Estoque',
  sku: 'SKU',
};

export function BulkUpdateModal({ open, onOpenChange, products }: BulkUpdateModalProps) {
  const [diffs, setDiffs] = useState<ProductDiff[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [step, setStep] = useState<'upload' | 'review'>('upload');
  const bulkUpdate = useBulkUpdateProducts();

  const reset = useCallback(() => {
    setDiffs([]);
    setErrors([]);
    setStep('upload');
  }, []);

  const handleClose = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const { diffs: parsed, errors: errs } = parseUpdateCSV(content, products);
      setDiffs(parsed);
      setErrors(errs);
      setStep('review');
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const handleConfirm = () => {
    const changes: ProductChange[] = diffs.map(d => ({
      id: d.id,
      changes: d.changes,
      variantChanges: d.variantDiffs.map(vd => ({
        variant_id: vd.variant_id,
        changes: vd.changes,
      })),
      newVariants: d.newVariants,
    }));
    bulkUpdate.mutate(changes, {
      onSuccess: () => handleClose(false),
    });
  };

  const formatValue = (key: string, val: any) => {
    if (typeof val === 'boolean') return val ? 'Sim' : 'Não';
    if (key.includes('price')) return `R$ ${Number(val).toFixed(2)}`;
    return String(val);
  };

  const totalChanges = diffs.reduce(
    (acc, d) => acc + Object.keys(d.changes).length + d.variantDiffs.length + d.newVariants.length,
    0
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Atualizar Produtos via CSV</DialogTitle>
          <DialogDescription>
            {step === 'upload'
              ? 'Envie o CSV exportado com as alterações desejadas.'
              : `${diffs.length} produto(s) com ${totalChanges} alteração(ões).`}
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="csv-update-file">Arquivo CSV</Label>
              <Input
                id="csv-update-file"
                type="file"
                accept=".csv"
                onChange={handleFile}
                className="mt-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Use o arquivo gerado por "Exportar Produtos". Edite os campos desejados e envie de volta.
              Apenas os campos alterados serão atualizados. Agora inclui tamanhos, cores e estoque.
            </p>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-3">
            {errors.length > 0 && (
              <div className="rounded-md bg-destructive/10 p-3 space-y-1">
                <div className="flex items-center gap-2 text-destructive text-sm font-medium">
                  <AlertCircle className="h-4 w-4" />
                  Avisos
                </div>
                {errors.map((err, i) => (
                  <p key={i} className="text-xs text-destructive">{err}</p>
                ))}
              </div>
            )}

            {diffs.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <CheckCircle2 className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma diferença encontrada. Os dados do CSV são iguais aos do banco.
                </p>
              </div>
            ) : (
              <ScrollArea className="max-h-[300px]">
                <div className="space-y-3">
                  {diffs.map((diff) => (
                    <div key={diff.id} className="rounded-md border p-3 space-y-2">
                      <p className="font-medium text-sm">{diff.name}</p>

                      {/* Product-level changes */}
                      {Object.keys(diff.changes).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(diff.changes).map(([key, newVal]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {fieldLabels[key] || key}: {formatValue(key, diff.oldValues[key])} → {formatValue(key, newVal)}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Variant changes */}
                      {diff.variantDiffs.length > 0 && (
                        <div className="space-y-1">
                          {diff.variantDiffs.map((vd, i) => (
                            <div key={i} className="flex flex-wrap items-center gap-1">
                              <span className="text-xs text-muted-foreground">{vd.label}:</span>
                              {Object.entries(vd.changes).map(([key, newVal]) => (
                                <Badge key={key} variant="secondary" className="text-xs">
                                  {fieldLabels[key] || key}: {String(vd.oldValues[key])} → {String(newVal)}
                                </Badge>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* New variants */}
                      {diff.newVariants.length > 0 && (
                        <div className="space-y-1">
                          {diff.newVariants.map((nv, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <Plus className="h-3 w-3 text-primary" />
                              <Badge variant="secondary" className="text-xs bg-accent">
                                Nova variante: Tam {nv.size}{nv.color ? ` / ${nv.color}` : ''}{nv.stock_quantity ? ` (${nv.stock_quantity} un)` : ''}
                              </Badge>
                              {nv.size === 'Unico' && nv.color && (
                                <Badge className="text-xs bg-primary/20 text-primary border-0">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Detectada do nome
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 'review' && (diffs.length > 0) && (
            <Button onClick={handleConfirm} disabled={bulkUpdate.isPending}>
              {bulkUpdate.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Confirmar {totalChanges} alteração(ões)
                </>
              )}
            </Button>
          )}
          {step === 'review' && (
            <Button variant="outline" onClick={reset}>
              Voltar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
