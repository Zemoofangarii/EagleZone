import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import type { Order } from "@/types/database";
import { format } from "date-fns";
import { Helmet } from "react-helmet-async";

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-500",
  processing: "bg-blue-500/20 text-blue-500",
  shipped: "bg-purple-500/20 text-purple-500",
  delivered: "bg-green-500/20 text-green-500",
  cancelled: "bg-red-500/20 text-red-500",
};

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        profiles (
          email,
          full_name
        )
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data as unknown as Order[]);
    }
    setLoading(false);
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Orders - High Mirror Admin</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage and fulfill customer orders
          </p>
        </div>

        {/* Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-28 animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-16 animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <p className="text-muted-foreground">No orders yet.</p>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {order.order_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{(order as any).profiles?.full_name || "Guest"}</p>
                        <p className="text-sm text-muted-foreground">
                          {(order as any).profiles?.email || "-"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status] || "bg-muted"}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${order.total.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {order.created_at && format(new Date(order.created_at), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
