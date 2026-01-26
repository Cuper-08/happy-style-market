import { useState, useEffect, useCallback } from 'react';
import { Product, ProductVariant } from '@/types';

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

const CART_STORAGE_KEY = 'bras-conceito-cart';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
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

  // Save cart to localStorage whenever items change
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

  const getItemPrice = useCallback((item: CartItem) => {
    const { product, quantity } = item;
    const minQty = product.wholesale_min_qty || 6;
    const wholesalePrice = product.wholesale_price;
    
    // Apply wholesale price if quantity meets minimum and wholesale price exists
    if (wholesalePrice && quantity >= minQty) {
      return wholesalePrice;
    }
    return product.retail_price;
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    return sum + getItemPrice(item) * item.quantity;
  }, 0);

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
  };
}
