export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image_url?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  category?: string | null;
  price?: number | null; // wholesale price
  price_display?: string | null;
  price_retail?: number | null; // retail price
  price_retail_display?: string | null;
  images: string[];
  original_url?: string | null;
  created_at: string;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  product_id: string | null;
  size: string;
  stock?: boolean | null;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  is_default: boolean;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name?: string;
  phone?: string;
  cpf?: string;
  avatar_url?: string;
  customer_type?: string;
  created_at?: string;
  updated_at?: string;
}

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'pix' | 'card' | 'boleto';
export type ShippingMethod = 'pac' | 'sedex' | 'express';

export interface Order {
  id: string;
  user_id?: string;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  payment_method?: PaymentMethod;
  shipping_method?: ShippingMethod;
  shipping_address?: Address;
  tracking_code?: string;
  notes?: string;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  variant_id?: string;
  product_name: string;
  variant_info?: string;
  quantity: number;
  unit_price: number;
}
