import { useState, useEffect, useCallback } from 'react';
import { Product, ProductVariant } from '@/types';

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

const CART_STORAGE_KEY = 'bras-conceito-cart';
const WHOLESALE_MIN_ITEMS = 6;

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse cart:', e);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoading]);

  const addItem = useCallback((product: Product, variant?: ProductVariant, quantity: number = 1) => {
    setItems(current => {
      const existingIndex = current.findIndex(
        item => item.product.id === product.id && item.variant?.id === variant?.id
      );

      if (existingIndex >= 0) {
        const updated = [...current];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...current, { product, variant, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId: string, variantId?: string) => {
    setItems(current =>
      current.filter(
        item => !(item.product.id === productId && item.variant?.id === variantId)
      )
    );
  }, []);

  const updateQuantity = useCallback((productId: string, variantId: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, variantId);
      return;
    }

    setItems(current =>
      current.map(item =>
        item.product.id === productId && item.variant?.id === variantId
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const isWholesale = totalItems >= WHOLESALE_MIN_ITEMS;

  const getItemPrice = useCallback((item: CartItem) => {
    if (isWholesale && item.product.price && item.product.price > 0) {
      return item.product.price;
    }
    return item.product.price_retail || 0;
  }, [isWholesale]);

  const subtotal = items.reduce((sum, item) => {
    return sum + getItemPrice(item) * item.quantity;
  }, 0);

  // Calculate how much user saves vs retail
  const retailTotal = items.reduce((sum, item) => {
    return sum + (item.product.price_retail || 0) * item.quantity;
  }, 0);
  const wholesaleSavings = isWholesale ? retailTotal - subtotal : 0;

  const itemsUntilWholesale = isWholesale ? 0 : WHOLESALE_MIN_ITEMS - totalItems;

  return {
    items,
    isLoading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemPrice,
    totalItems,
    subtotal,
    isWholesale,
    wholesaleSavings,
    itemsUntilWholesale,
  };
}
