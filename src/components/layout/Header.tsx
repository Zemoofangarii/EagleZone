import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, Menu, Heart, Trash2, ShoppingBag, Loader2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useRef, useCallback, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  price: number;
  short_description?: string | null;
  product_images: { url: string; alt_text?: string }[];
}

export function Header() {
  const { t, i18n } = useTranslation();
  const { user, isAdmin, signOut } = useAuth();
  const { itemCount } = useCart();
  const { items: wishlistItems, itemCount: wishlistCount, isOpen: wishlistOpen, setIsOpen: setWishlistOpen, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAr = i18n.language === "ar";

  function toggleLanguage() {
    const newLang = isAr ? "en" : "ar";
    i18n.changeLanguage(newLang);
  }
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<SearchResult[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch all products when search modal opens
  useEffect(() => {
    if (!searchOpen) return;
    if (allProducts.length > 0) {
      setSearchResults(allProducts);
      return;
    }

    setSearchLoading(true);
    supabase
      .from("products")
      .select("id, title, slug, price, short_description, product_images (url, alt_text)")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        const products = (data as unknown as SearchResult[]) || [];
        setAllProducts(products);
        setSearchResults(products);
        setSearchLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchOpen]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setSearchResults(allProducts);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    debounceRef.current = setTimeout(() => {
      const q = query.trim().toLowerCase();
      const filtered = allProducts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.short_description && p.short_description.toLowerCase().includes(q))
      );
      setSearchResults(filtered);
      setSearchLoading(false);
    }, 200);
  }, [allProducts]);

  function handleSelectResult(slug: string) {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    navigate(`/products/${slug}`);
  }

  const navLinks = [
    { href: "/products", label: t("nav.shop") },
    { href: "/categories", label: t("nav.categories") },
    { href: "/about", label: t("nav.about") },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
      className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <motion.span
            className="font-display text-2xl font-bold gradient-text"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            Eagle Zone
          </motion.span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
            >
              <Link
                to={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              title={isAr ? "Switch to English" : "التبديل إلى العربية"}
            >
              <span className="text-sm font-bold">{isAr ? "EN" : "ع"}</span>
            </Button>
          </motion.div>

          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Search Modal */}
          <Dialog open={searchOpen} onOpenChange={(open) => {
            setSearchOpen(open);
            if (!open) {
              setSearchQuery("");
              setSearchResults([]);
            }
          }}>
            <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 border-b border-border">
                <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t("common.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  autoFocus
                  className="flex-1 h-14 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                />
                {searchQuery && (
                  <button
                    type="button"
                    title="Clear search"
                    onClick={() => handleSearch("")}
                    className="shrink-0 p-1 rounded-md hover:bg-muted transition-colors"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
                <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[400px] overflow-y-auto">
                {searchLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}

                {!searchLoading && searchQuery && searchResults.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <Search className="h-10 w-10 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">{t("common.noResults")} "{searchQuery}"</p>
                  </div>
                )}

                {!searchLoading && searchResults.length > 0 && (
                  <div>
                    <p className="px-4 pt-3 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {searchQuery ? `${t("common.results")} (${searchResults.length})` : `${t("common.allProducts")} (${searchResults.length})`}
                    </p>
                    <AnimatePresence>
                      {searchResults.map((product, i) => (
                        <motion.button
                          key={product.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: i * 0.03 }}
                          onClick={() => handleSelectResult(product.slug)}
                          className="w-full flex items-center gap-4 px-4 py-3 hover:bg-muted/70 transition-colors text-left"
                        >
                          <div className="shrink-0 w-12 h-12 rounded-md overflow-hidden bg-muted border border-border">
                            {product.product_images?.[0] ? (
                              <img
                                src={product.product_images[0].url}
                                alt={product.product_images[0].alt_text || product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-1">{product.title}</p>
                            {product.short_description && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{product.short_description}</p>
                            )}
                          </div>
                          <span className="shrink-0 font-semibold text-sm">
                            ${product.price.toFixed(2)}
                          </span>
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {!searchLoading && searchResults.length === 0 && !searchQuery && (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Sheet open={wishlistOpen} onOpenChange={setWishlistOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                <AnimatePresence mode="wait">
                  {wishlistCount > 0 && (
                    <motion.span
                      key={wishlistCount}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center"
                    >
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[380px] flex flex-col p-0">
              <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
                <SheetTitle className="flex items-center gap-2 text-lg">
                  <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                  {t("header.wishlist")}
                  {wishlistCount > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                      ({wishlistCount} {wishlistCount === 1 ? t("header.item") : t("header.items")})
                    </span>
                  )}
                </SheetTitle>
              </SheetHeader>

              {wishlistItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Heart className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{t("wishlist.empty")}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("wishlist.emptyDesc")}
                    </p>
                  </div>
                  <SheetClose asChild>
                    <Link to="/products">
                      <Button variant="gold" size="sm">
                        <ShoppingBag className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                        {t("common.browseProducts")}
                      </Button>
                    </Link>
                  </SheetClose>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  <AnimatePresence initial={false}>
                    {wishlistItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.05 }}
                        className="flex gap-4 px-6 py-4 border-b border-border group hover:bg-muted/50 transition-colors"
                      >
                        {/* Product Image */}
                        <SheetClose asChild>
                          <Link
                            to={`/products/${item.product.slug}`}
                            className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted border border-border"
                          >
                            {item.product.product_images?.[0] ? (
                              <img
                                src={item.product.product_images[0].url}
                                alt={item.product.product_images[0].alt_text || item.product.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </Link>
                        </SheetClose>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <SheetClose asChild>
                            <Link
                              to={`/products/${item.product.slug}`}
                              className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors"
                            >
                              {item.product.title}
                            </Link>
                          </SheetClose>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-semibold text-sm">
                              ${item.product.price.toFixed(2)}
                            </span>
                            {item.product.compare_at_price && item.product.compare_at_price > item.product.price && (
                              <span className="text-xs text-muted-foreground line-through">
                                ${item.product.compare_at_price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleWishlist(item.product_id)}
                          className="shrink-0 self-center h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {wishlistItems.length > 0 && (
                <div className="px-6 py-4 border-t border-border">
                  <SheetClose asChild>
                    <Link to="/products" className="block">
                      <Button variant="gold" className="w-full">
                        <ShoppingBag className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                        {t("common.continueShopping")}
                      </Button>
                    </Link>
                  </SheetClose>
                </div>
              )}
            </SheetContent>
          </Sheet>

          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <AnimatePresence mode="wait">
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center"
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/account">{t("header.myAccount")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/orders">{t("header.orders")}</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="text-primary font-medium">
                        {t("header.adminPanel")}
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  {t("common.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button variant="gold" size="sm">
                {t("common.signIn")}
              </Button>
            </Link>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                  >
                    <Link
                      to={link.href}
                      className="text-lg font-medium py-2 border-b border-border"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
