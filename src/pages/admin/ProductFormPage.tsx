import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminLayout } from './AdminLayout';
import { useAdminProducts, useAdminProduct } from '@/hooks/admin/useAdminProducts';
import { useAdminCategories } from '@/hooks/admin/useAdminCategories';
import { useAdminBrands } from '@/hooks/admin/useAdminBrands';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, Loader2, Save } from 'lucide-react';

const variantSchema = z.object({
  size: z.string().min(1, 'Tamanho é obrigatório'),
  color: z.string().optional(),
  color_hex: z.string().optional(),
  stock_quantity: z.number().min(0, 'Estoque não pode ser negativo'),
  sku: z.string().optional(),
});

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  slug: z.string().min(1, 'Slug é obrigatório'),
  description: z.string().optional(),
  category_id: z.string().optional(),
  brand_id: z.string().optional(),
  retail_price: z.number().positive('Preço deve ser maior que zero'),
  wholesale_price: z.number().optional(),
  wholesale_min_qty: z.number().optional(),
  images: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  is_new: z.boolean().optional(),
  is_active: z.boolean().optional(),
  variants: z.array(variantSchema).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnPage = searchParams.get('page');
  const returnUrl = returnPage ? `/admin/produtos?page=${returnPage}` : '/admin/produtos';
  const isEditing = !!id && id !== 'novo';

  const { data: existingProduct, isLoading: isLoadingProduct } = useAdminProduct(
    isEditing ? id : ''
  );
  const { createProduct, updateProduct, isCreating, isUpdating } = useAdminProducts();
  const { categories } = useAdminCategories();
  const { brands } = useAdminBrands();

  const [images, setImages] = useState<string[]>([]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      category_id: '',
      brand_id: '',
      retail_price: 0,
      wholesale_price: undefined,
      wholesale_min_qty: 6,
      images: [],
      featured: false,
      is_new: false,
      is_active: true,
      variants: [{ size: '', color: '', color_hex: '', stock_quantity: 0, sku: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'variants',
  });

  // Load existing product data
  useEffect(() => {
    if (existingProduct) {
      form.reset({
        name: existingProduct.name,
        slug: existingProduct.slug,
        description: existingProduct.description || '',
        category_id: existingProduct.category_id || '',
        brand_id: existingProduct.brand_id || '',
        retail_price: Number(existingProduct.retail_price),
        wholesale_price: existingProduct.wholesale_price
          ? Number(existingProduct.wholesale_price)
          : undefined,
        wholesale_min_qty: existingProduct.wholesale_min_qty || 6,
        featured: existingProduct.featured || false,
        is_new: existingProduct.is_new || false,
        is_active: existingProduct.is_active !== false,
        variants:
          existingProduct.variants.length > 0
            ? existingProduct.variants.map((v) => ({
                size: v.size,
                color: v.color || '',
                color_hex: v.color_hex || '',
                stock_quantity: v.stock_quantity || 0,
                sku: v.sku || '',
              }))
            : [{ size: '', color: '', color_hex: '', stock_quantity: 0, sku: '' }],
      });
      setImages(existingProduct.images || []);
    }
  }, [existingProduct, form]);

  // Auto-generate slug from name
  const watchName = form.watch('name');
  useEffect(() => {
    if (!isEditing && watchName) {
      const slug = watchName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      form.setValue('slug', slug);
    }
  }, [watchName, isEditing, form]);

  const onSubmit = (data: ProductFormData) => {
    const productData = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      category_id: data.category_id || undefined,
      brand_id: data.brand_id || undefined,
      retail_price: data.retail_price,
      wholesale_price: data.wholesale_price,
      wholesale_min_qty: data.wholesale_min_qty,
      images,
      featured: data.featured,
      is_new: data.is_new,
      is_active: data.is_active,
    };

    const validVariants = (data.variants || [])
      .filter((v) => v.size && v.size.trim() !== '')
      .map((v) => ({
        size: v.size || '',
        color: v.color,
        color_hex: v.color_hex,
        stock_quantity: v.stock_quantity || 0,
        sku: v.sku?.trim() || null,
      }));

    if (isEditing) {
      updateProduct(
        { id, product: productData, variants: validVariants },
        {
          onSuccess: () => navigate(returnUrl),
        }
      );
    } else {
      createProduct(
        { product: productData, variants: validVariants },
        {
          onSuccess: () => navigate(returnUrl),
        }
      );
    }
  };

  if (isEditing && isLoadingProduct) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => navigate(returnUrl)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {isEditing ? 'Editar Produto' : 'Novo Produto'}
              </h1>
            </div>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {(isCreating || isUpdating) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Produto</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Vestido Floral" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug (URL)</FormLabel>
                        <FormControl>
                          <Input placeholder="vestido-floral" {...field} />
                        </FormControl>
                        <FormDescription>
                          URL amigável do produto (gerada automaticamente)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva o produto..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="brand_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marca</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {brands.map((brand) => (
                                <SelectItem key={brand.id} value={brand.id}>
                                  {brand.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Imagens</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUploader
                    images={images}
                    onChange={setImages}
                    maxImages={5}
                  />
                </CardContent>
              </Card>

              {/* Variants */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Variações</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({ size: '', color: '', color_hex: '', stock_quantity: 0, sku: '' })
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-6 gap-3 p-4 border rounded-lg"
                    >
                      <FormField
                        control={form.control}
                        name={`variants.${index}.size`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Tamanho</FormLabel>
                            <FormControl>
                              <Input placeholder="P, M, G..." {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`variants.${index}.color`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Cor</FormLabel>
                            <FormControl>
                              <Input placeholder="Preto" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`variants.${index}.color_hex`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Hex</FormLabel>
                            <FormControl>
                              <Input type="color" {...field} className="h-10 p-1" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`variants.${index}.stock_quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Estoque</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`variants.${index}.sku`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">SKU</FormLabel>
                            <FormControl>
                              <Input placeholder="Opcional" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Preços</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="retail_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço Varejo (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min={0}
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wholesale_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço Atacado (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min={0}
                            {...field}
                            value={field.value || ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wholesale_min_qty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qtd Mínima Atacado</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            value={field.value || 6}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 6)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Opções</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Ativo</FormLabel>
                          <FormDescription>
                            Produto visível na loja
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Destaque</FormLabel>
                          <FormDescription>
                            Exibir na home
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_new"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Novidade</FormLabel>
                          <FormDescription>
                            Exibir badge "Novo"
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </AdminLayout>
  );
}
