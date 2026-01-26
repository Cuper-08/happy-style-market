import { createContext, useContext, ReactNode } from 'react';
import { useCart as useCartHook } from '@/hooks/useCart';

type CartContextType = ReturnType<typeof useCartHook>;

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useCartHook();

  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
