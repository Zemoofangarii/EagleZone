import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    compare_at_price?: number | null;
    product_images: { url: string; alt_text?: string }[];
  };
}

interface WishlistContextType {
  items: WishlistItem[];
  itemCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  async function fetchWishlist() {
    if (!user) return;

    // Step 1: Fetch wishlist rows
    const { data: wishlistRows, error: wishlistError } = await supabase
      .from("wishlists")
      .select("id, product_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (wishlistError || !wishlistRows || wishlistRows.length === 0) {
      setItems([]);
      return;
    }

    // Step 2: Fetch products for those IDs
    const productIds = wishlistRows.map((w) => w.product_id);
    const { data: products } = await supabase
      .from("products")
      .select("id, title, slug, price, compare_at_price, product_images (url, alt_text)")
      .in("id", productIds);

    if (!products) {
      setItems([]);
      return;
    }

    // Step 3: Merge wishlist rows with product data
    const productMap = new Map(products.map((p) => [p.id, p]));
    const merged = wishlistRows
      .filter((w) => productMap.has(w.product_id))
      .map((w) => ({
        id: w.id,
        product_id: w.product_id,
        created_at: w.created_at || "",
        product: productMap.get(w.product_id)!,
      }));

    setItems(merged as unknown as WishlistItem[]);
  }

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setItems([]);
      return;
    }

    fetchWishlist();
  }, [user?.id, authLoading]);

  function isInWishlist(productId: string) {
    return items.some((item) => item.product_id === productId);
  }

  async function toggleWishlist(productId: string) {
    if (!user) {
      toast({
        title: t("wishlist.signInRequired"),
        description: t("wishlist.signInRequiredDesc"),
        variant: "destructive",
      });
      return;
    }

    const inList = isInWishlist(productId);

    if (inList) {
      // Optimistic remove
      const prev = items;
      setItems((old) => old.filter((i) => i.product_id !== productId));

      const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (error) {
        setItems(prev);
        toast({ title: t("common.error"), description: t("wishlist.errorUpdate"), variant: "destructive" });
        return;
      }

      toast({ title: t("wishlist.removed"), description: t("wishlist.removedDesc") });
    } else {
      const { error } = await supabase
        .from("wishlists")
        .insert({ user_id: user.id, product_id: productId });

      if (error) {
        toast({ title: t("common.error"), description: t("wishlist.errorUpdate"), variant: "destructive" });
        return;
      }

      toast({ title: t("wishlist.added"), description: t("wishlist.addedDesc") });
      await fetchWishlist();
    }
  }

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount: items.length,
        isOpen,
        setIsOpen,
        isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
