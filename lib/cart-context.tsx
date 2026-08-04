"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Player, Product } from "./types";

export interface SquadItem {
  player: Player;
  positionKey?: string;
}

export interface ShopItem {
  product: Product;
  quantity: number;
  variant?: string;
}

interface CartContextType {
  // Squad (players)
  squad: SquadItem[];
  addToSquad: (player: Player, positionKey?: string) => void;
  removeFromSquad: (playerId: string) => void;
  clearSquad: () => void;
  isInSquad: (playerId: string) => boolean;
  squadCount: number;

  // Shop products
  shopItems: ShopItem[];
  addToShop: (product: Product, quantity?: number, variant?: string) => void;
  removeFromShop: (productId: string) => void;
  updateShopQty: (productId: string, quantity: number) => void;
  clearShop: () => void;
  isInShop: (productId: string) => boolean;
  shopCount: number;
  shopSubtotal: number;

  // Combined
  totalCount: number;
  clearAll: () => void;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

const SQUAD_KEY = "amarteam-squad";
const SHOP_KEY = "amarteam-shop";

export function CartProvider({ children }: { children: ReactNode }) {
  const [squad, setSquad] = useState<SquadItem[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const s = localStorage.getItem(SQUAD_KEY);
      const p = localStorage.getItem(SHOP_KEY);
      if (s) setSquad(JSON.parse(s));
      if (p) setShopItems(JSON.parse(p));
    } catch {}
    setLoaded(true);
  }, []);

  // Persist
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(SQUAD_KEY, JSON.stringify(squad)); } catch {}
  }, [squad, loaded]);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(SHOP_KEY, JSON.stringify(shopItems)); } catch {}
  }, [shopItems, loaded]);

  // ─── Squad ───
  const addToSquad = (player: Player, positionKey?: string) => {
    setSquad(prev => prev.some(i => i.player.id === player.id) ? prev : [...prev, { player, positionKey }]);
  };
  const removeFromSquad = (playerId: string) => {
    setSquad(prev => prev.filter(i => i.player.id !== playerId));
  };
  const clearSquad = () => setSquad([]);
  const isInSquad = (playerId: string) => squad.some(i => i.player.id === playerId);

  // ─── Shop ───
  const addToShop = (product: Product, quantity = 1, variant?: string) => {
    setShopItems(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.variant === variant);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id && i.variant === variant
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
            : i
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stock), variant }];
    });
  };
  const removeFromShop = (productId: string) => {
    setShopItems(prev => prev.filter(i => i.product.id !== productId));
  };
  const updateShopQty = (productId: string, quantity: number) => {
    if (quantity < 1) { removeFromShop(productId); return; }
    setShopItems(prev => prev.map(i =>
      i.product.id === productId
        ? { ...i, quantity: Math.min(quantity, i.product.stock) }
        : i
    ));
  };
  const clearShop = () => setShopItems([]);
  const isInShop = (productId: string) => shopItems.some(i => i.product.id === productId);

  const shopCount = shopItems.reduce((sum, i) => sum + i.quantity, 0);
  const shopSubtotal = shopItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const clearAll = () => { clearSquad(); clearShop(); };

  return (
    <CartContext.Provider value={{
      squad, addToSquad, removeFromSquad, clearSquad, isInSquad, squadCount: squad.length,
      shopItems, addToShop, removeFromShop, updateShopQty, clearShop, isInShop, shopCount, shopSubtotal,
      totalCount: squad.length + shopCount,
      clearAll,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);