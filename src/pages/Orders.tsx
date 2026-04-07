import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Package, ChevronRight, Loader2, ShoppingBag } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  order_items: {
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
  }[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  delivered: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Orders() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/orders");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;

      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          status,
          total,
          created_at,
          order_items (
            id,
            title,
            quantity,
            unit_price
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(data as unknown as Order[]);
      }
      setIsLoading(false);
    }

    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="container py-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!user) return null;

  return (
    <MainLayout>
      <Helmet>
        <title>My Orders - High Mirror</title>
        <meta name="description" content="View your order history" />
      </Helmet>

      <div className="container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">My Orders</h1>

          {orders.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-lg border border-border">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">
                When you place an order, it will appear here.
              </p>
              <Link to="/products">
                <Button variant="gold">Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-card rounded-lg border border-border p-6 hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant="outline"
                        className={statusColors[order.status] || statusColors.pending}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <span className="font-bold">${Number(order.total).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="border-t border-border pt-4">
                    <div className="space-y-2">
                      {order.order_items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.title} × {item.quantity}
                          </span>
                          <span>${(item.unit_price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      {order.order_items.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          +{order.order_items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/order-confirmation/${order.id}`)}
                    >
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
