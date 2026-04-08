import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Product, ProductImage, ProductVariant } from "@/types/database";

export interface CartItemWithProduct {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  product: Product & {
    product_images?: ProductImage[];
    product_variants?: ProductVariant[];
  };
}

interface CartContextType {
  items: CartItemWithProduct[];
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number, variantId?: string | null) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getSessionId(): string {
  let sessionId = localStorage.getItem("cart_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("cart_session_id", sessionId);
  }
  return sessionId;
}

async function findOrCreateCart(currentUser: User | null): Promise<string | null> {
  try {
    let query = supabase.from("carts").select("id").limit(1);

    if (currentUser) {
      query = query.eq("user_id", currentUser.id);
    } else {
      query = query.eq("session_id", getSessionId()).is("user_id", null);
    }

    const { data: existingCarts } = await query;

    if (existingCarts && existingCarts.length > 0) {
      return existingCarts[0].id;
    }

    // Create new cart
    const cartData = currentUser
      ? { user_id: currentUser.id }
      : { session_id: getSessionId() };

    const { data: newCart, error } = await supabase
      .from("carts")
      .insert(cartData)
      .select("id")
      .single();

    if (error) throw error;

    return newCart.id;
  } catch (error) {
    console.error("Error getting/creating cart:", error);
    return null;
  }
}

async function loadCartItems(cartId: string): Promise<CartItemWithProduct[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select(`
      *,
      product:products (
        *,
        product_images (*),
        product_variants (*)
      )
    `)
    .eq("cart_id", cartId);

  if (error) throw error;

  return (data as unknown as CartItemWithProduct[]) || [];
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const cartIdRef = useRef<string | null>(null);

  // Get cart ID, finding or creating if needed
  async function getCartId(): Promise<string | null> {
    if (cartIdRef.current) return cartIdRef.current;

    const id = await findOrCreateCart(user);
    cartIdRef.current = id;
    return id;
  }

  // Fetch cart items from database
  async function fetchCartItems() {
    const currentCartId = await getCartId();
    if (!currentCartId) return;

    setIsLoading(true);
    try {
      const loadedItems = await loadCartItems(currentCartId);
      setItems(loadedItems);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Load cart on mount and when user changes
  useEffect(() => {
    if (authLoading) return;

    // Reset and reload
    cartIdRef.current = null;

    async function init() {
      const id = await findOrCreateCart(user);
      if (!id) {
        setItems([]);
        return;
      }
      cartIdRef.current = id;

      setIsLoading(true);
      try {
        const loadedItems = await loadCartItems(id);
        setItems(loadedItems);
      } catch (error) {
        console.error("Error fetching cart items:", error);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [user?.id, authLoading]);

  // Add to cart
  async function addToCart(productId: string, quantity = 1, variantId: string | null = null) {
    const currentCartId = await getCartId();
    if (!currentCartId) {
      toast({
        title: t("common.error"),
        description: t("cart.errorAddItem"),
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if item already exists
      const existingItem = items.find(
        (item) => item.product_id === productId && item.variant_id === variantId
      );

      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
        return;
      }

      // Add new item to database
      const { error } = await supabase.from("cart_items").insert({
        cart_id: currentCartId,
        product_id: productId,
        variant_id: variantId,
        quantity,
      });

      if (error) throw error;

      // Reload items from database
      const loadedItems = await loadCartItems(currentCartId);
      setItems(loadedItems);

      toast({
        title: t("cart.addedToCart"),
        description: t("cart.addedToCartDesc"),
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: t("common.error"),
        description: t("cart.errorAddItem"),
        variant: "destructive",
      });
    }
  }

  // Update quantity
  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) {
      await removeItem(itemId);
      return;
    }

    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", itemId);

      if (error) throw error;

      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: t("common.error"),
        description: t("cart.errorUpdateQuantity"),
        variant: "destructive",
      });
    }
  }

  // Remove item
  async function removeItem(itemId: string) {
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setItems((prev) => prev.filter((item) => item.id !== itemId));

      toast({
        title: t("cart.itemRemoved"),
        description: t("cart.itemRemovedDesc"),
      });
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        title: t("common.error"),
        description: t("cart.errorRemoveItem"),
        variant: "destructive",
      });
    }
  }

  // Clear cart
  async function clearCart() {
    if (!cartIdRef.current) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cartIdRef.current);

      if (error) throw error;

      setItems([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        isLoading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
