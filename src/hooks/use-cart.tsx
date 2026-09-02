import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image?: string | null;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "electromaison-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch { /* ignore */ }
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    count: items.reduce((n, i) => n + i.quantity, 0),
    total: items.reduce((n, i) => n + i.quantity * Number(i.price), 0),
    addItem: (item, quantity = 1) =>
      setItems((prev) => {
        const found = prev.find((i) => i.id === item.id);
        if (found) {
          return prev.map((i) =>
            i.id === item.id ? { ...i, quantity: Math.min(99, i.quantity + quantity) } : i,
          );
        }
        return [...prev, { ...item, price: Number(item.price), quantity }];
      }),
    setQuantity: (id, quantity) =>
      setItems((prev) =>
        quantity <= 0
          ? prev.filter((i) => i.id !== id)
          : prev.map((i) => (i.id === id ? { ...i, quantity: Math.min(99, quantity) } : i)),
      ),
    removeItem: (id) => setItems((prev) => prev.filter((i) => i.id !== id)),
    clear: () => setItems([]),
    open,
    setOpen,
  }), [items, open]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
