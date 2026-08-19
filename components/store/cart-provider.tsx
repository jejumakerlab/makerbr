"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Product } from "@/types/database";

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  add: (product: Product, quantity?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  count: number;
  total: number;
};

const STORAGE_KEY = "makerbridge-cart";

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

let memoryCart: CartItem[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return typeof window === "undefined" ? memoryCart : readCart();
}

function getServerSnapshot() {
  return memoryCart;
}

function writeCart(items: CartItem[]) {
  memoryCart = items;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  emit();
}

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value = useMemo<CartState>(() => {
    const add = (product: Product, quantity = 1) => {
      const current = readCart();
      const existing = current.find((item) => item.product.id === product.id);
      const next = existing
        ? current.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          )
        : [...current, { product, quantity }];
      writeCart(next);
    };

    const remove = (productId: string) => {
      writeCart(readCart().filter((item) => item.product.id !== productId));
    };

    const setQuantity = (productId: string, quantity: number) => {
      if (quantity <= 0) {
        remove(productId);
        return;
      }
      writeCart(
        readCart().map((item) =>
          item.product.id === productId ? { ...item, quantity } : item,
        ),
      );
    };

    const clear = () => writeCart([]);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => {
      const price = item.product.sale_price ?? item.product.price;
      return sum + price * item.quantity;
    }, 0);

    return { items, add, remove, setQuantity, clear, count, total };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
