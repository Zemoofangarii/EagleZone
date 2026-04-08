import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CreditCard, Truck, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  // Split full_name into first and last name
  const nameParts = profile?.full_name?.split(" ") || [];
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const [shippingAddress, setShippingAddress] = useState({
    first_name: firstName,
    last_name: lastName,
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
    phone: profile?.phone || "",
  });

  const [notes, setNotes] = useState("");

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      const parts = profile.full_name?.split(" ") || [];
      setShippingAddress((prev) => ({
        ...prev,
        first_name: prev.first_name || parts[0] || "",
        last_name: prev.last_name || parts.slice(1).join(" ") || "",
        phone: prev.phone || profile.phone || "",
      }));
    }
  }, [profile]);

  const shipping = 0; // Free shipping
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      navigate("/auth?redirect=/checkout");
      return;
    }

    if (items.length === 0) {
      toast({
        title: t("checkout.cartEmpty"),
        description: t("checkout.cartEmptyDesc"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([{
          user_id: user.id,
          order_number: `ORD-${Date.now()}`, // Will be overwritten by trigger
          subtotal,
          tax,
          shipping,
          total,
          shipping_address: shippingAddress as any,
          notes,
          status: "pending",
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        title: item.product.title,
        sku: item.product.slug,
        quantity: item.quantity,
        unit_price: item.product.price,
        total: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      await clearCart();

      toast({
        title: t("checkout.orderPlaced"),
        description: t("checkout.orderPlacedDesc", { orderNumber: order.order_number }),
      });

      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: t("common.error"),
        description: t("checkout.orderFailed"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t("checkout.emptyCart")}</h1>
          <p className="text-muted-foreground mb-6">{t("checkout.emptyCartDesc")}</p>
          <Button variant="gold" onClick={() => navigate("/products")}>
            {t("common.browseProducts")}
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Helmet>
        <title>Checkout - Eagle Zone</title>
        <meta name="description" content="Complete your purchase" />
      </Helmet>

      <div className="container py-8 md:py-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">{t("checkout.title")}</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Address */}
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="font-display text-xl font-bold">{t("checkout.shippingAddress")}</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">{t("checkout.firstName")}</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={shippingAddress.first_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">{t("checkout.lastName")}</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={shippingAddress.last_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address_line1">{t("checkout.address")}</Label>
                    <Input
                      id="address_line1"
                      name="address_line1"
                      value={shippingAddress.address_line1}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address_line2">{t("checkout.apartment")}</Label>
                    <Input
                      id="address_line2"
                      name="address_line2"
                      value={shippingAddress.address_line2}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">{t("checkout.city")}</Label>
                    <Input
                      id="city"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">{t("checkout.state")}</Label>
                    <Input
                      id="state"
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">{t("checkout.zip")}</Label>
                    <Input
                      id="postal_code"
                      name="postal_code"
                      value={shippingAddress.postal_code}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("checkout.phone")}</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="font-display text-xl font-bold mb-4">{t("checkout.orderNotes")}</h2>
                <Textarea
                  placeholder={t("checkout.orderNotesPlaceholder")}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Payment - Placeholder */}
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="font-display text-xl font-bold">{t("checkout.payment")}</h2>
                </div>
                <p className="text-muted-foreground">
                  {t("checkout.codMessage")}
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card rounded-lg border border-border p-6 space-y-4">
                <h2 className="font-display text-xl font-bold">{t("checkout.orderSummary")}</h2>

                {/* Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.product.title} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        {t("common.currency")}{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("checkout.subtotal")}</span>
                    <span className="font-medium">{t("common.currency")}{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("checkout.shipping")}</span>
                    <span className="font-medium text-green-500">{t("common.free")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("checkout.tax")}</span>
                    <span className="font-medium">{t("common.currency")}{tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t("checkout.total")}</span>
                    <span>{t("common.currency")}{total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("checkout.placingOrder") : t("checkout.placeOrder")}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
