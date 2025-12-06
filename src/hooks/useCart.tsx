import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
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

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get or create cart
  const getOrCreateCart = useCallback(async (): Promise<string | null> => {
    if (cartId) return cartId;

    try {
      // Try to find existing cart
      let query = supabase.from("carts").select("id");
      
      if (user) {
        query = query.eq("user_id", user.id);
      } else {
        // Use session ID for anonymous users
        const sessionId = getSessionId();
        query = query.eq("session_id", sessionId).is("user_id", null);
      }

      const { data: existingCart } = await query.maybeSingle();

      if (existingCart) {
        setCartId(existingCart.id);
        return existingCart.id;
      }

      // Create new cart
      const cartData = user
        ? { user_id: user.id }
        : { session_id: getSessionId() };

      const { data: newCart, error } = await supabase
        .from("carts")
        .insert(cartData)
        .select("id")
        .single();

      if (error) throw error;

      setCartId(newCart.id);
      return newCart.id;
    } catch (error) {
      console.error("Error getting/creating cart:", error);
      return null;
    }
  }, [user, cartId]);

  // Get session ID for anonymous users
  function getSessionId(): string {
    let sessionId = localStorage.getItem("cart_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("cart_session_id", sessionId);
    }
    return sessionId;
  }

  // Fetch cart items
  const fetchCartItems = useCallback(async () => {
    const currentCartId = await getOrCreateCart();
    if (!currentCartId) return;

    setIsLoading(true);
    try {
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
        .eq("cart_id", currentCartId);

      if (error) throw error;

      setItems((data as unknown as CartItemWithProduct[]) || []);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getOrCreateCart]);

  // Load cart on mount and when user changes
  useEffect(() => {
    // Reset cart when user changes
    setCartId(null);
    setItems([]);
    fetchCartItems();
  }, [user?.id]);

  // Add to cart
  async function addToCart(productId: string, quantity = 1, variantId: string | null = null) {
    const currentCartId = await getOrCreateCart();
    if (!currentCartId) {
      toast({
        title: "Error",
        description: "Could not add item to cart. Please try again.",
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
        // Update quantity
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
        return;
      }

      // Add new item
      const { error } = await supabase.from("cart_items").insert({
        cart_id: currentCartId,
        product_id: productId,
        variant_id: variantId,
        quantity,
      });

      if (error) throw error;

      await fetchCartItems();

      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Could not add item to cart. Please try again.",
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
        title: "Error",
        description: "Could not update quantity. Please try again.",
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
        title: "Removed",
        description: "Item has been removed from your cart.",
      });
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        title: "Error",
        description: "Could not remove item. Please try again.",
        variant: "destructive",
      });
    }
  }

  // Clear cart
  async function clearCart() {
    if (!cartId) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cartId);

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
