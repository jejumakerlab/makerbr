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
const EMPTY_CART: CartItem[] = [];

let snapshot: CartItem[] = EMPTY_CART;
let snapshotRaw = "[]";
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function parseCart(raw: string | null): CartItem[] {
  if (!raw) return EMPTY_CART;
  try {
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed) || parsed.length === 0) return EMPTY_CART;
    return parsed.filter(
      (item) =>
        item &&
        typeof item === "object" &&
        item.product &&
        typeof item.product.id === "string" &&
        Number.isFinite(item.quantity) &&
        item.quantity > 0,
    );
  } catch {
    return EMPTY_CART;
  }
}

function hydrateFromStorage() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const next = parseCart(window.localStorage.getItem(STORAGE_KEY));
  snapshot = next;
  snapshotRaw = JSON.stringify(next);
}

function getSnapshot() {
  hydrateFromStorage();
  return snapshot;
}

function getServerSnapshot() {
  return EMPTY_CART;
}

function writeCart(items: CartItem[]) {
  const next = items.length === 0 ? EMPTY_CART : items;
  const raw = JSON.stringify(next);
  if (raw === snapshotRaw) return;

  snapshot = next;
  snapshotRaw = raw;

  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    // quota / private mode
  }
  emit();
}

function handleStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  const next = parseCart(event.newValue);
  const raw = JSON.stringify(next);
  if (raw === snapshotRaw) return;
  snapshot = next;
  snapshotRaw = raw;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (typeof window !== "undefined" && listeners.size === 1) {
    window.addEventListener("storage", handleStorage);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined" && listeners.size === 0) {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value = useMemo<CartState>(() => {
    const add = (product: Product, quantity = 1) => {
      const current = getSnapshot();
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
      writeCart(getSnapshot().filter((item) => item.product.id !== productId));
    };

    const setQuantity = (productId: string, quantity: number) => {
      if (quantity <= 0) {
        remove(productId);
        return;
      }
      writeCart(
        getSnapshot().map((item) =>
          item.product.id === productId ? { ...item, quantity } : item,
        ),
      );
    };

    const clear = () => writeCart(EMPTY_CART);
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
