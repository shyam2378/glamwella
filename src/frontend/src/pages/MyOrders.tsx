import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Package } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyOrders } from "../hooks/useQueries";

interface MyOrdersProps {
  onNavigate: (path: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export function MyOrders({ onNavigate }: MyOrdersProps) {
  const { identity } = useInternetIdentity();
  const { data: orders, isLoading } = useMyOrders();

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">
          Please login to view your orders.
        </p>
        <button
          type="button"
          onClick={() => onNavigate("/")}
          className="btn-primary"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 pb-16">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => onNavigate("/")}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="font-display text-2xl font-bold">My Orders 📦</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {["a", "b", "c"].map((k) => (
            <div key={k} className="card-pink p-6">
              <Skeleton className="h-5 w-40 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center py-20" data-ocid="orders.empty_state">
          <Package size={64} className="text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-xl text-foreground mb-2">
            No orders yet
          </h2>
          <p className="text-muted-foreground mb-6">
            Start shopping to see your orders here! 💕
          </p>
          <button
            type="button"
            onClick={() => onNavigate("/")}
            className="btn-primary"
          >
            Shop Now 🛍️
          </button>
        </div>
      ) : (
        <div className="space-y-4" data-ocid="orders.list">
          {orders.map(([id, order], i) => (
            <motion.div
              key={id.toString()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-pink p-6"
              data-ocid={`orders.item.${i + 1}`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-display font-semibold text-foreground">
                    Order #{id.toString()}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(
                      Number(order.createdAt) / 1_000_000,
                    ).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                    STATUS_COLORS[order.status.toLowerCase()] ??
                    "bg-gray-100 text-gray-600"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="text-sm text-muted-foreground mb-3">
                <p>
                  📍 {order.address}, {order.city} - {order.pincode}
                </p>
                <p>📞 {order.phone}</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {order.items.map((item) => (
                  <Badge
                    key={item.productId.toString()}
                    variant="secondary"
                    className="text-xs"
                  >
                    Item #{item.productId.toString()} x{Number(item.quantity)}
                  </Badge>
                ))}
              </div>

              <div className="flex justify-between items-center border-t border-border pt-3">
                <span className="text-sm text-muted-foreground">
                  {order.items.length} items
                </span>
                <span className="font-bold text-primary text-base">
                  ₹{Number(order.totalINR)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
