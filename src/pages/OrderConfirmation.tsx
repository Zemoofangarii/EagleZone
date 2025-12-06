import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Order } from "@/types/database";

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!id) return;

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setOrder(data as unknown as Order);
      }
      setLoading(false);
    }

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-16 w-16 bg-muted rounded-full mx-auto" />
            <div className="h-8 bg-muted rounded w-64 mx-auto" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Helmet>
        <title>Order Confirmed - LUXE</title>
        <meta name="description" content="Your order has been placed successfully" />
      </Helmet>

      <div className="container py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Thank You for Your Order!
          </h1>

          {order && (
            <p className="text-muted-foreground text-lg mb-8">
              Your order <span className="font-semibold text-foreground">#{order.order_number}</span> has been placed successfully.
            </p>
          )}

          <div className="bg-card rounded-lg border border-border p-6 mb-8 text-left">
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">What's Next?</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground">
              <li>• You will receive an email confirmation shortly.</li>
              <li>• We'll notify you when your order ships.</li>
              <li>• Track your order in your account dashboard.</li>
            </ul>
          </div>

          {order && (
            <div className="bg-card rounded-lg border border-border p-6 mb-8">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-500">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${Number(order.tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-border">
                  <span>Total</span>
                  <span>${Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products">
              <Button variant="gold" size="lg">
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/orders">
              <Button variant="outline" size="lg">
                View Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
