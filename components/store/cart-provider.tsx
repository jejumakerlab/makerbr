"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Product } from "@/types/database";
import { shippingFeeFor } from "@/lib/store/shipping";

export type CartItem = {
  /** 같은 상품이라도 요청사항(memo)이 다르면 별도 줄로 담습니다. */
  key: string;
  product: Product;
  quantity: number;
  memo: string;
};

type CartState = {
  items: CartItem[];
  add: (product: Product, quantity?: number, memo?: string) => void;
  remove: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  shippingFee: number;
  total: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  setOpen: (open: boolean) => void;
};

// 상품·장바구니 구조가 바뀌면 키 버전을 올려 이전 장바구니를 비웁니다.
const STORAGE_KEY = "makerbridge-cart-v3";
const EMPTY_CART: CartItem[] = [];

let snapshot: CartItem[] = EMPTY_CART;
let snapshotRaw = "[]";
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function cartKey(productId: string, memo: string) {
  return `${productId}::${memo.trim()}`;
}

/** 재고를 넘지 않는 1 이상의 수량 */
export function clampQuantity(quantity: number, stock: number) {
  const max = Math.max(stock, 1);
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(Math.max(Math.floor(quantity), 1), max);
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
        typeof item.key === "string" &&
        item.product &&
        typeof item.product.id === "string" &&
        typeof item.product.price === "number" &&
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
  const [isOpen, setOpen] = useState(false);

  const value = useMemo<CartState>(() => {
    const add = (product: Product, quantity = 1, memo = "") => {
      const trimmedMemo = memo.trim();
      const key = cartKey(product.id, trimmedMemo);
      const current = getSnapshot();
      const existing = current.find((item) => item.key === key);
      const next = existing
        ? current.map((item) =>
            item.key === key
              ? {
                  ...item,
                  product,
                  quantity: clampQuantity(item.quantity + quantity, product.stock),
                }
              : item,
          )
        : [
            ...current,
            {
              key,
              product,
              quantity: clampQuantity(quantity, product.stock),
              memo: trimmedMemo,
            },
          ];
      writeCart(next);
    };

    const remove = (key: string) => {
      writeCart(getSnapshot().filter((item) => item.key !== key));
    };

    const setQuantity = (key: string, quantity: number) => {
      if (quantity <= 0) {
        remove(key);
        return;
      }
      writeCart(
        getSnapshot().map((item) =>
          item.key === key
            ? { ...item, quantity: clampQuantity(quantity, item.product.stock) }
            : item,
        ),
      );
    };

    const clear = () => writeCart(EMPTY_CART);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shippingFee = shippingFeeFor(subtotal);

    return {
      items,
      add,
      remove,
      setQuantity,
      clear,
      count,
      subtotal,
      shippingFee,
      total: subtotal + shippingFee,
      isOpen,
      openCart: () => setOpen(true),
      closeCart: () => setOpen(false),
      setOpen,
    };
  }, [items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
