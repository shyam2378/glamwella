import glamwellaLogo from "@/assets/glamwella-logo.png";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Check,
  Edit2,
  Loader2,
  MessageSquare,
  Package,
  Plus,
  Save,
  Settings,
  Tag,
  ThumbsDown,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Order, Product, Review } from "../backend";
import { useActor } from "../hooks/useActor";
import {
  useAddProduct,
  useAllOrders,
  useDeleteProduct,
  useProducts,
  useUpdateOrderStatus,
  useUpdateProduct,
} from "../hooks/useQueries";
import type { Coupon } from "../types/coupon";

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

const CATEGORIES = [
  "Eye Collection",
  "Lips Collection",
  "Face Collection",
  "Nail Collection",
];

const DEMO_PRODUCTS: Product[] = [
  {
    name: "Glitter Eyeshadow Palette",
    category: "Eye Collection",
    priceINR: 899n,
    discountPriceINR: 0n,
    description: "12 vibrant shimmer shades for dramatic eyes",
    imageUrl: "/assets/generated/product-eye-palette.dim_400x400.jpg",
    stockQuantity: 10n,
  },
  {
    name: "Dramatic Lash Mascara",
    category: "Eye Collection",
    priceINR: 499n,
    discountPriceINR: 399n,
    description: "Lengthening and volumizing mascara for bold lashes",
    imageUrl: "/assets/generated/product-mascara.dim_400x400.jpg",
    stockQuantity: 10n,
  },
  {
    name: "Velvet Matte Lipstick",
    category: "Lips Collection",
    priceINR: 399n,
    discountPriceINR: 0n,
    description: "Long-lasting velvet matte finish in gorgeous rose pink",
    imageUrl: "/assets/generated/product-lipstick.dim_400x400.jpg",
    stockQuantity: 10n,
  },
  {
    name: "Glossy Lip Plumper",
    category: "Lips Collection",
    priceINR: 549n,
    discountPriceINR: 449n,
    description: "Plumping gloss for fuller, juicier lips",
    imageUrl: "/assets/generated/product-lip-gloss.dim_400x400.jpg",
    stockQuantity: 10n,
  },
  {
    name: "Dewy Glow Foundation",
    category: "Face Collection",
    priceINR: 1299n,
    discountPriceINR: 999n,
    description: "Medium coverage foundation with dewy finish",
    imageUrl: "/assets/generated/product-foundation.dim_400x400.jpg",
    stockQuantity: 10n,
  },
  {
    name: "Rose Blush Palette",
    category: "Face Collection",
    priceINR: 699n,
    discountPriceINR: 0n,
    description: "4-shade blush palette from soft pink to deep mauve",
    imageUrl: "/assets/generated/product-blush.dim_400x400.jpg",
    stockQuantity: 10n,
  },
  {
    name: "Shimmer Nail Polish Set",
    category: "Nail Collection",
    priceINR: 349n,
    discountPriceINR: 0n,
    description: "Set of 6 shimmer nail polishes",
    imageUrl: "/assets/generated/product-nail-polish.dim_400x400.jpg",
    stockQuantity: 10n,
  },
  {
    name: "Crystal Nail Art Kit",
    category: "Nail Collection",
    priceINR: 599n,
    discountPriceINR: 499n,
    description: "Complete nail art kit with crystals and rhinestones",
    imageUrl: "/assets/generated/product-nail-art.dim_400x400.jpg",
    stockQuantity: 10n,
  },
];

const EMPTY_PRODUCT: Product = {
  name: "",
  category: "Eye Collection",
  priceINR: 0n,
  discountPriceINR: 0n,
  description: "",
  imageUrl: "",
  stockQuantity: 10n,
};

const EMPTY_COUPON: Coupon = {
  code: "",
  discountAmountINR: 50n,
  maxUsesPerUser: 1n,
  isActive: true,
};

const STATUS_OPTIONS = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

interface ProductFormFieldsProps {
  product: Product;
  setProduct: (p: Product) => void;
}

function ProductFormFields({ product, setProduct }: ProductFormFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1">
        <Label className="text-xs">Product Name *</Label>
        <Input
          value={product.name}
          onChange={(e) => setProduct({ ...product, name: e.target.value })}
          className="rounded-xl text-sm"
          required
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Category *</Label>
        <Select
          value={product.category}
          onValueChange={(v) => setProduct({ ...product, category: v })}
        >
          <SelectTrigger
            data-ocid="admin.select"
            className="rounded-xl text-sm"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Price (₹) *</Label>
        <Input
          type="number"
          value={Number(product.priceINR)}
          onChange={(e) =>
            setProduct({ ...product, priceINR: BigInt(e.target.value || 0) })
          }
          className="rounded-xl text-sm"
          required
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">
          Discount Price (₹){" "}
          <span className="text-muted-foreground">(0 = no discount)</span>
        </Label>
        <Input
          type="number"
          value={Number(product.discountPriceINR)}
          onChange={(e) =>
            setProduct({
              ...product,
              discountPriceINR: BigInt(e.target.value || 0),
            })
          }
          className="rounded-xl text-sm"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Stock Quantity</Label>
        <Input
          type="number"
          min={0}
          value={Number(product.stockQuantity)}
          onChange={(e) =>
            setProduct({
              ...product,
              stockQuantity: BigInt(e.target.value || 0),
            })
          }
          className="rounded-xl text-sm"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Image URL</Label>
        <Input
          value={product.imageUrl}
          onChange={(e) => setProduct({ ...product, imageUrl: e.target.value })}
          className="rounded-xl text-sm"
          placeholder="https://..."
        />
      </div>
      <div className="md:col-span-2 space-y-1">
        <Label className="text-xs">Description</Label>
        <Textarea
          value={product.description}
          onChange={(e) =>
            setProduct({ ...product, description: e.target.value })
          }
          className="rounded-xl text-sm"
          rows={2}
        />
      </div>
    </div>
  );
}

interface CouponFormFieldsProps {
  coupon: Coupon;
  setCoupon: (c: Coupon) => void;
}

function CouponFormFields({ coupon, setCoupon }: CouponFormFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1">
        <Label className="text-xs">Coupon Code *</Label>
        <Input
          value={coupon.code}
          onChange={(e) =>
            setCoupon({ ...coupon, code: e.target.value.toUpperCase() })
          }
          className="rounded-xl text-sm font-mono"
          placeholder="e.g. WELCOME"
          required
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Discount Amount (₹) *</Label>
        <Input
          type="number"
          min={1}
          value={Number(coupon.discountAmountINR)}
          onChange={(e) =>
            setCoupon({
              ...coupon,
              discountAmountINR: BigInt(e.target.value || 0),
            })
          }
          className="rounded-xl text-sm"
          required
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Max Uses Per User</Label>
        <Input
          type="number"
          min={1}
          value={Number(coupon.maxUsesPerUser)}
          onChange={(e) =>
            setCoupon({
              ...coupon,
              maxUsesPerUser: BigInt(e.target.value || 1),
            })
          }
          className="rounded-xl text-sm"
        />
      </div>
      <div className="space-y-1 flex items-center gap-3 pt-5">
        <Switch
          checked={coupon.isActive}
          onCheckedChange={(v) => setCoupon({ ...coupon, isActive: v })}
          id="coupon-active"
        />
        <Label htmlFor="coupon-active" className="text-xs cursor-pointer">
          Active
        </Label>
      </div>
    </div>
  );
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { actor } = useActor();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: orders, isLoading: ordersLoading } = useAllOrders();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateOrderStatus = useUpdateOrderStatus();

  const productMap = new Map(
    (products ?? []).map(([id, p]) => [id.toString(), p.name]),
  );

  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [editForm, setEditForm] = useState<Product>(EMPTY_PRODUCT);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState<Product>(EMPTY_PRODUCT);
  const [seedingDemo, setSeedingDemo] = useState(false);
  const [rzKeyId, setRzKeyId] = useState("");
  const [rzKeySecret, setRzKeySecret] = useState("");
  const [savingKeys, setSavingKeys] = useState(false);

  // Order selection & soft-delete state
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(
    new Set(),
  );
  const [deletingOrders, setDeletingOrders] = useState(false);
  const [deletedOrders, setDeletedOrders] = useState<[bigint, Order][]>([]);
  const [deletedOrdersLoading, setDeletedOrdersLoading] = useState(false);
  const queryClient = useQueryClient();

  // Reviews state
  const [pendingReviews, setPendingReviews] = useState<[bigint, Review][]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Coupons state
  const [coupons, setCoupons] = useState<[bigint, Coupon][]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [showAddCouponForm, setShowAddCouponForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Coupon>(EMPTY_COUPON);
  const [editingCouponId, setEditingCouponId] = useState<bigint | null>(null);
  const [editCouponForm, setEditCouponForm] = useState<Coupon>(EMPTY_COUPON);
  const [savingCoupon, setSavingCoupon] = useState(false);

  const fetchPendingReviews = useCallback(async () => {
    if (!actor) return;
    setReviewsLoading(true);
    try {
      const reviews = await actor.getPendingReviews();
      setPendingReviews(reviews);
    } catch {
      // ignore
    } finally {
      setReviewsLoading(false);
    }
  }, [actor]);

  const fetchCoupons = useCallback(async () => {
    if (!actor) return;
    setCouponsLoading(true);
    try {
      const result = await actor.getCoupons();
      setCoupons(result);
    } catch {
      // ignore
    } finally {
      setCouponsLoading(false);
    }
  }, [actor]);

  const handleApproveReview = async (reviewId: bigint) => {
    if (!actor) return;
    try {
      const result = await actor.approveReview(reviewId);
      if ("ok" in result) {
        toast.success("Review approved! ✅");
        fetchPendingReviews();
      } else {
        toast.error("Failed to approve review");
      }
    } catch {
      toast.error("Error approving review");
    }
  };

  const handleDeleteReview = async (reviewId: bigint) => {
    if (!actor) return;
    try {
      const result = await actor.deleteReview(reviewId);
      if ("ok" in result) {
        toast.success("Review rejected ✅");
        fetchPendingReviews();
      } else {
        toast.error("Failed to reject review");
      }
    } catch {
      toast.error("Error rejecting review");
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    setSavingCoupon(true);
    try {
      await actor.addCoupon(newCoupon);
      setNewCoupon(EMPTY_COUPON);
      setShowAddCouponForm(false);
      toast.success("Coupon added! 🎟️");
      fetchCoupons();
    } catch {
      toast.error("Failed to add coupon");
    } finally {
      setSavingCoupon(false);
    }
  };

  const handleUpdateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !editingCouponId) return;
    setSavingCoupon(true);
    try {
      await actor.updateCoupon(editingCouponId, editCouponForm);
      setEditingCouponId(null);
      toast.success("Coupon updated! ♥");
      fetchCoupons();
    } catch {
      toast.error("Failed to update coupon");
    } finally {
      setSavingCoupon(false);
    }
  };

  const handleDeleteCoupon = async (id: bigint) => {
    if (!actor) return;
    if (!confirm("Delete this coupon?")) return;
    try {
      await actor.deleteCoupon(id);
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch {
      toast.error("Failed to delete coupon");
    }
  };

  // Delivery rules state
  interface DeliveryRule {
    zoneOrPincode: string;
    chargeINR: bigint;
    isDefault: boolean;
  }
  const [deliveryRules, setDeliveryRules] = useState<[bigint, DeliveryRule][]>(
    [],
  );
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [showAddDeliveryForm, setShowAddDeliveryForm] = useState(false);
  const [newDeliveryRule, setNewDeliveryRule] = useState<DeliveryRule>({
    zoneOrPincode: "",
    chargeINR: 60n,
    isDefault: false,
  });
  const [editingDeliveryId, setEditingDeliveryId] = useState<bigint | null>(
    null,
  );
  const [editDeliveryForm, setEditDeliveryForm] = useState<DeliveryRule>({
    zoneOrPincode: "",
    chargeINR: 60n,
    isDefault: false,
  });
  const [savingDelivery, setSavingDelivery] = useState(false);

  const fetchDeliveryRules = useCallback(async () => {
    if (!actor) return;
    setDeliveryLoading(true);
    try {
      const result = await (actor as any).getDeliveryRules();
      setDeliveryRules(result);
    } catch {
      // ignore
    } finally {
      setDeliveryLoading(false);
    }
  }, [actor]);

  const handleAddDeliveryRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    setSavingDelivery(true);
    try {
      await (actor as any).addDeliveryRule({
        ...newDeliveryRule,
        chargeINR: BigInt(newDeliveryRule.chargeINR),
      });
      setNewDeliveryRule({
        zoneOrPincode: "",
        chargeINR: 60n,
        isDefault: false,
      });
      setShowAddDeliveryForm(false);
      toast.success("Delivery rule added! 🚚");
      fetchDeliveryRules();
    } catch {
      toast.error("Failed to add delivery rule");
    } finally {
      setSavingDelivery(false);
    }
  };

  const handleUpdateDeliveryRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || editingDeliveryId === null) return;
    setSavingDelivery(true);
    try {
      await (actor as any).updateDeliveryRule(editingDeliveryId, {
        ...editDeliveryForm,
        chargeINR: BigInt(editDeliveryForm.chargeINR),
      });
      setEditingDeliveryId(null);
      toast.success("Delivery rule updated! ♥");
      fetchDeliveryRules();
    } catch {
      toast.error("Failed to update delivery rule");
    } finally {
      setSavingDelivery(false);
    }
  };

  const handleDeleteDeliveryRule = async (id: bigint, isDefault: boolean) => {
    if (!actor) return;
    if (isDefault && deliveryRules.length === 1) {
      toast.error("Cannot delete the only default rule");
      return;
    }
    if (!confirm("Delete this delivery rule?")) return;
    try {
      await (actor as any).deleteDeliveryRule(id);
      toast.success("Delivery rule deleted");
      fetchDeliveryRules();
    } catch {
      toast.error("Failed to delete delivery rule");
    }
  };

  // Validate admin token
  useEffect(() => {
    const token = localStorage.getItem("glamwella_admin_token");
    if (!token) {
      onNavigate("/admin");
      return;
    }
    if (actor) {
      actor
        .validateAdminToken(token)
        .then((valid) => {
          if (!valid) {
            localStorage.removeItem("glamwella_admin_token");
            onNavigate("/admin");
          }
        })
        .catch(() => {
          // Allow if offline
        });
    }
  }, [actor, onNavigate]);

  // Load Razorpay keys
  useEffect(() => {
    if (actor) {
      actor
        .getRazorpayKeys()
        .then(([id, secret]) => {
          setRzKeyId(id);
          setRzKeySecret(secret);
        })
        .catch(() => {});
    }
  }, [actor]);

  // Load pending reviews
  useEffect(() => {
    fetchPendingReviews();
  }, [fetchPendingReviews]);

  // Load coupons
  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // Load delivery rules
  useEffect(() => {
    fetchDeliveryRules();
  }, [fetchDeliveryRules]);

  const handleSeedDemo = async () => {
    if (!actor) return;
    setSeedingDemo(true);
    try {
      for (const p of DEMO_PRODUCTS) {
        await addProduct.mutateAsync(p);
      }
      toast.success("Demo products added! 🎀");
    } catch {
      toast.error("Failed to seed products");
    } finally {
      setSeedingDemo(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addProduct.mutateAsync(newProduct);
      setNewProduct(EMPTY_PRODUCT);
      setShowAddForm(false);
      toast.success("Product added! ✨");
    } catch {
      toast.error("Failed to add product");
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      await updateProduct.mutateAsync({ id: editingId, product: editForm });
      setEditingId(null);
      toast.success("Product updated! ♥");
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleDeleteProduct = async (id: bigint) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleSaveRazorpayKeys = async () => {
    if (!actor) return;
    setSavingKeys(true);
    try {
      await actor.setRazorpayKeys(rzKeyId, rzKeySecret);
      toast.success("Razorpay keys saved! 🔒");
    } catch {
      toast.error("Failed to save keys");
    } finally {
      setSavingKeys(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 pb-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <img src={glamwellaLogo} alt="GLAMWELLA" className="h-10 w-auto" />
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-xs text-muted-foreground">
              GLAMWELLA Management 🎀
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("glamwella_admin_token");
            onNavigate("/admin");
          }}
          data-ocid="admin.secondary_button"
          className="text-sm text-muted-foreground hover:text-destructive transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Products", value: products?.length ?? 0, icon: "✨" },
          { label: "Orders", value: orders?.length ?? 0, icon: "📦" },
          {
            label: "Revenue",
            value: `₹${(orders ?? []).reduce((sum, [, o]) => sum + Number(o.totalINR), 0)}`,
            icon: "💰",
          },
          {
            label: "Pending Reviews",
            value: pendingReviews.length,
            icon: "💬",
          },
        ].map((stat) => (
          <div key={stat.label} className="card-pink p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="font-display font-bold text-xl text-foreground">
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="products">
        <TabsList className="mb-4 flex-wrap h-auto gap-1" data-ocid="admin.tab">
          <TabsTrigger value="products" data-ocid="admin.tab">
            <BarChart3 size={14} className="mr-1" /> Products
          </TabsTrigger>
          <TabsTrigger value="orders" data-ocid="admin.tab">
            <Package size={14} className="mr-1" /> Orders
          </TabsTrigger>
          <TabsTrigger
            value="deleted-orders"
            data-ocid="admin.tab"
            onClick={async () => {
              if (!actor) return;
              setDeletedOrdersLoading(true);
              try {
                const r = await actor.getDeletedOrders();
                setDeletedOrders(r);
              } catch {
              } finally {
                setDeletedOrdersLoading(false);
              }
            }}
          >
            <Trash2 size={14} className="mr-1" /> Deleted Orders 🗑️
          </TabsTrigger>
          <TabsTrigger value="reviews" data-ocid="admin.tab">
            <MessageSquare size={14} className="mr-1" /> Reviews 💬
          </TabsTrigger>
          <TabsTrigger value="coupons" data-ocid="admin.tab">
            <Tag size={14} className="mr-1" /> Coupons 🎟️
          </TabsTrigger>
          <TabsTrigger value="delivery" data-ocid="admin.tab">
            <Truck size={14} className="mr-1" /> Delivery
          </TabsTrigger>
          <TabsTrigger value="settings" data-ocid="admin.tab">
            <Settings size={14} className="mr-1" /> Settings
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg">Products ✨</h2>
            <div className="flex gap-2">
              {(!products || products.length === 0) && (
                <Button
                  data-ocid="admin.secondary_button"
                  onClick={handleSeedDemo}
                  disabled={seedingDemo}
                  variant="outline"
                  size="sm"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full"
                >
                  {seedingDemo ? (
                    <Loader2 size={14} className="mr-1 animate-spin" />
                  ) : null}
                  Seed Demo Products
                </Button>
              )}
              <Button
                data-ocid="admin.primary_button"
                onClick={() => setShowAddForm(!showAddForm)}
                size="sm"
                className="btn-primary rounded-full"
              >
                <Plus size={14} className="mr-1" /> Add Product
              </Button>
            </div>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="card-pink p-6 mb-4"
            >
              <h3 className="font-display font-semibold mb-4">New Product</h3>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <ProductFormFields
                  product={newProduct}
                  setProduct={setNewProduct}
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    data-ocid="admin.submit_button"
                    disabled={addProduct.isPending}
                    className="btn-primary"
                  >
                    {addProduct.isPending ? (
                      <Loader2 size={14} className="mr-1 animate-spin" />
                    ) : (
                      <Plus size={14} className="mr-1" />
                    )}
                    Add Product
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="rounded-full"
                  >
                    <X size={14} className="mr-1" /> Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {productsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="card-pink overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(products ?? []).map(([id, product], i) =>
                    editingId === id ? (
                      <TableRow key={id.toString()}>
                        <TableCell colSpan={6}>
                          <form
                            onSubmit={handleUpdateProduct}
                            className="space-y-4 py-2"
                          >
                            <ProductFormFields
                              product={editForm}
                              setProduct={setEditForm}
                            />
                            <div className="flex gap-2">
                              <Button
                                type="submit"
                                data-ocid={`admin.save_button.${i + 1}`}
                                disabled={updateProduct.isPending}
                                size="sm"
                                className="btn-primary"
                              >
                                <Save size={14} className="mr-1" /> Save
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingId(null)}
                                className="rounded-full"
                              >
                                <X size={14} className="mr-1" /> Cancel
                              </Button>
                            </div>
                          </form>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow
                        key={id.toString()}
                        data-ocid={`admin.row.${i + 1}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {product.imageUrl && (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-8 h-8 rounded-lg object-cover"
                              />
                            )}
                            <span className="text-sm font-medium">
                              {product.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {product.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          ₹{Number(product.priceINR)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {product.discountPriceINR > 0n ? (
                            <span className="text-primary font-semibold">
                              ₹{Number(product.discountPriceINR)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {product.stockQuantity === 0n ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                              Sold Out
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                              In Stock ({Number(product.stockQuantity)})
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              data-ocid={`admin.edit_button.${i + 1}`}
                              onClick={() => {
                                setEditingId(id);
                                setEditForm(product);
                              }}
                              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              data-ocid={`admin.delete_button.${i + 1}`}
                              onClick={() => handleDeleteProduct(id)}
                              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                  {(!products || products.length === 0) && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                        data-ocid="admin.empty_state"
                      >
                        No products yet. Seed demo products or add new ones!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="font-display font-semibold text-lg">
              All Orders 📦
            </h2>
            {orders && orders.length > 0 && (
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center gap-2 cursor-pointer text-sm"
                  data-ocid="orders.checkbox"
                >
                  <Checkbox
                    id="select-all-orders"
                    checked={selectedOrderIds.size === orders.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedOrderIds(
                          new Set(orders.map(([id]) => id.toString())),
                        );
                      } else {
                        setSelectedOrderIds(new Set());
                      }
                    }}
                    className="border-primary data-[state=checked]:bg-primary"
                  />
                  <Label
                    htmlFor="select-all-orders"
                    className="cursor-pointer text-sm"
                  >
                    Select All
                  </Label>
                </div>
                {selectedOrderIds.size > 0 && (
                  <Button
                    size="sm"
                    data-ocid="orders.delete_button"
                    disabled={deletingOrders}
                    onClick={async () => {
                      if (!actor) return;
                      setDeletingOrders(true);
                      try {
                        await actor.softDeleteOrders(
                          Array.from(selectedOrderIds).map(BigInt),
                        );
                        setSelectedOrderIds(new Set());
                        queryClient.invalidateQueries({
                          queryKey: ["allOrders"],
                        });
                        toast.success("Orders moved to deleted");
                      } catch {
                        toast.error("Failed to delete orders");
                      } finally {
                        setDeletingOrders(false);
                      }
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full text-xs h-8"
                  >
                    {deletingOrders ? (
                      <Loader2 size={12} className="mr-1 animate-spin" />
                    ) : (
                      <Trash2 size={12} className="mr-1" />
                    )}
                    Delete Selected ({selectedOrderIds.size})
                  </Button>
                )}
              </div>
            )}
          </div>
          {ordersLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          ) : !orders || orders.length === 0 ? (
            <div
              className="text-center py-20 text-muted-foreground"
              data-ocid="orders.empty_state"
            >
              No orders yet
            </div>
          ) : (
            <div className="space-y-4" data-ocid="orders.list">
              {orders.map(([id, order], i) => (
                <motion.div
                  key={id.toString()}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="card-pink p-5"
                  data-ocid={`orders.item.${i + 1}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedOrderIds.has(id.toString())}
                        onCheckedChange={(checked) => {
                          setSelectedOrderIds((prev) => {
                            const next = new Set(prev);
                            if (checked) next.add(id.toString());
                            else next.delete(id.toString());
                            return next;
                          });
                        }}
                        className="mt-1 border-primary data-[state=checked]:bg-primary"
                        data-ocid={`orders.checkbox.${i + 1}`}
                      />
                      <div>
                        <h3 className="font-display font-semibold text-sm">
                          Order #{id.toString()}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(
                            Number(order.createdAt) / 1_000_000,
                          ).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <Select
                      value={order.status}
                      onValueChange={(v) =>
                        updateOrderStatus.mutate({ orderId: id, status: v })
                      }
                    >
                      <SelectTrigger
                        data-ocid={`orders.select.${i + 1}`}
                        className="w-36 h-8 text-xs rounded-full"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem
                            key={s}
                            value={s}
                            className="text-xs capitalize"
                          >
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                    <div>
                      <p className="font-semibold text-foreground">
                        {order.customerName}
                      </p>
                      <p>📞 {order.phone}</p>
                    </div>
                    <div>
                      <p>📍 {order.address}</p>
                      <p>
                        {order.city} - {order.pincode}
                      </p>
                      {order.landmark && <p>🏠 {order.landmark}</p>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {order.items.map((item) => (
                      <Badge
                        key={item.productId.toString()}
                        variant="secondary"
                        className="text-xs"
                      >
                        {productMap.get(item.productId.toString()) ??
                          `#${item.productId.toString()}`}{" "}
                        × {Number(item.quantity)} @ ₹{Number(item.price)}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-between items-center border-t border-border pt-3">
                    <span className="text-xs text-muted-foreground">
                      {order.items.length} items
                    </span>
                    <span className="font-bold text-primary">
                      ₹{Number(order.totalINR)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Deleted Orders Tab */}
        <TabsContent value="deleted-orders">
          <h2 className="font-display font-semibold text-lg mb-4">
            Deleted Orders 🗑️
          </h2>
          {deletedOrdersLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          ) : deletedOrders.length === 0 ? (
            <div
              className="text-center py-20 text-muted-foreground card-pink"
              data-ocid="deleted-orders.empty_state"
            >
              <div className="text-4xl mb-2">🗑️</div>
              <p>No deleted orders</p>
            </div>
          ) : (
            <div className="space-y-4" data-ocid="deleted-orders.list">
              {deletedOrders.map(([id, order], i) => (
                <motion.div
                  key={id.toString()}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="card-pink p-5 opacity-70"
                  data-ocid={`deleted-orders.item.${i + 1}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-display font-semibold text-sm line-through text-muted-foreground">
                        Order #{id.toString()}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(
                          Number(order.createdAt) / 1_000_000,
                        ).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-red-100 text-red-600 border-0"
                    >
                      Deleted
                    </Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                    <div>
                      <p className="font-semibold text-foreground">
                        {order.customerName}
                      </p>
                      <p>📞 {order.phone}</p>
                    </div>
                    <div>
                      <p>📍 {order.address}</p>
                      <p>
                        {order.city} - {order.pincode}
                      </p>
                      {order.landmark && <p>🏠 {order.landmark}</p>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {order.items.map((item) => (
                      <Badge
                        key={item.productId.toString()}
                        variant="secondary"
                        className="text-xs"
                      >
                        {productMap.get(item.productId.toString()) ??
                          `#${item.productId.toString()}`}{" "}
                        × {Number(item.quantity)} @ ₹{Number(item.price)}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-between items-center border-t border-border pt-3">
                    <span className="text-xs text-muted-foreground">
                      {order.items.length} items
                    </span>
                    <span className="font-bold text-primary">
                      ₹{Number(order.totalINR)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg">
              Pending Reviews 💬
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPendingReviews}
              disabled={reviewsLoading}
              className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              {reviewsLoading ? (
                <Loader2 size={14} className="mr-1 animate-spin" />
              ) : null}
              Refresh
            </Button>
          </div>

          {reviewsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          ) : pendingReviews.length === 0 ? (
            <div
              className="text-center py-20 text-muted-foreground card-pink"
              data-ocid="reviews.empty_state"
            >
              <div className="text-4xl mb-2">💬</div>
              <p>No pending reviews</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReviews.map(([reviewId, review], i) => (
                <motion.div
                  key={reviewId.toString()}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-pink p-5"
                  data-ocid={`reviews.item.${i + 1}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          Product #{review.productId.toString()}
                        </Badge>
                        <span className="text-yellow-500 text-sm">
                          {"★".repeat(Number(review.rating))}
                          {"☆".repeat(5 - Number(review.rating))}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">
                        {review.comment}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(
                          Number(review.createdAt) / 1_000_000,
                        ).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <Badge className="text-xs bg-yellow-100 text-yellow-800 border-0 shrink-0">
                      Pending
                    </Badge>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="rounded-full bg-green-500 hover:bg-green-600 text-white flex-1"
                      onClick={() => handleApproveReview(reviewId)}
                    >
                      <Check size={13} className="mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full border-red-400 text-red-500 hover:bg-red-50 flex-1"
                      onClick={() => handleDeleteReview(reviewId)}
                    >
                      <ThumbsDown size={13} className="mr-1" /> Reject
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Coupons Tab */}
        <TabsContent value="coupons">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg">Coupons 🎟️</h2>
            <Button
              data-ocid="admin.primary_button"
              onClick={() => setShowAddCouponForm(!showAddCouponForm)}
              size="sm"
              className="btn-primary rounded-full"
            >
              <Plus size={14} className="mr-1" /> Add Coupon
            </Button>
          </div>

          {/* Add Coupon Form */}
          {showAddCouponForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="card-pink p-6 mb-4"
            >
              <h3 className="font-display font-semibold mb-4">New Coupon</h3>
              <form onSubmit={handleAddCoupon} className="space-y-4">
                <CouponFormFields coupon={newCoupon} setCoupon={setNewCoupon} />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    data-ocid="admin.submit_button"
                    disabled={savingCoupon}
                    className="btn-primary"
                  >
                    {savingCoupon ? (
                      <Loader2 size={14} className="mr-1 animate-spin" />
                    ) : (
                      <Plus size={14} className="mr-1" />
                    )}
                    Add Coupon
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddCouponForm(false)}
                    className="rounded-full"
                  >
                    <X size={14} className="mr-1" /> Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {couponsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="card-pink overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Max Uses / User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map(([id, coupon], i) =>
                    editingCouponId === id ? (
                      <TableRow key={id.toString()}>
                        <TableCell colSpan={5}>
                          <form
                            onSubmit={handleUpdateCoupon}
                            className="space-y-4 py-2"
                          >
                            <CouponFormFields
                              coupon={editCouponForm}
                              setCoupon={setEditCouponForm}
                            />
                            <div className="flex gap-2">
                              <Button
                                type="submit"
                                data-ocid={`admin.save_button.${i + 1}`}
                                disabled={savingCoupon}
                                size="sm"
                                className="btn-primary"
                              >
                                <Save size={14} className="mr-1" /> Save
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingCouponId(null)}
                                className="rounded-full"
                              >
                                <X size={14} className="mr-1" /> Cancel
                              </Button>
                            </div>
                          </form>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow
                        key={id.toString()}
                        data-ocid={`coupons.row.${i + 1}`}
                      >
                        <TableCell>
                          <span className="font-mono font-bold text-primary text-sm">
                            {coupon.code}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm font-semibold">
                          ₹{Number(coupon.discountAmountINR)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {Number(coupon.maxUsesPerUser)}
                        </TableCell>
                        <TableCell>
                          {coupon.isActive ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                              Active
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                              Inactive
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              data-ocid={`coupons.edit_button.${i + 1}`}
                              onClick={() => {
                                setEditingCouponId(id);
                                setEditCouponForm(coupon);
                              }}
                              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              data-ocid={`coupons.delete_button.${i + 1}`}
                              onClick={() => handleDeleteCoupon(id)}
                              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                  {coupons.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                        data-ocid="coupons.empty_state"
                      >
                        No coupons yet. Add one to get started!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Delivery Tab */}
        <TabsContent value="delivery">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-semibold text-lg">
                Delivery Charges 🚚
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Orders above ₹999 always get free delivery
              </p>
            </div>
            <Button
              data-ocid="admin.primary_button"
              onClick={() => setShowAddDeliveryForm(!showAddDeliveryForm)}
              size="sm"
              className="btn-primary rounded-full"
            >
              <Plus size={14} className="mr-1" /> Add Rule
            </Button>
          </div>

          {showAddDeliveryForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="card-pink p-6 mb-4"
            >
              <h3 className="font-display font-semibold mb-4">
                New Delivery Rule
              </h3>
              <form onSubmit={handleAddDeliveryRule} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Zone / Pincode *</Label>
                    <Input
                      data-ocid="admin.input"
                      value={newDeliveryRule.zoneOrPincode}
                      onChange={(e) =>
                        setNewDeliveryRule({
                          ...newDeliveryRule,
                          zoneOrPincode: e.target.value,
                        })
                      }
                      placeholder="e.g. 600001 or South Zone"
                      className="rounded-xl text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Charge (₹) *</Label>
                    <Input
                      data-ocid="admin.input"
                      type="number"
                      min={0}
                      value={Number(newDeliveryRule.chargeINR)}
                      onChange={(e) =>
                        setNewDeliveryRule({
                          ...newDeliveryRule,
                          chargeINR: BigInt(e.target.value || 0),
                        })
                      }
                      className="rounded-xl text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1 flex items-end pb-1">
                    <div className="flex items-center gap-2">
                      <Switch
                        data-ocid="admin.switch"
                        checked={newDeliveryRule.isDefault}
                        onCheckedChange={(v) =>
                          setNewDeliveryRule({
                            ...newDeliveryRule,
                            isDefault: v,
                          })
                        }
                        id="new-default"
                      />
                      <Label
                        htmlFor="new-default"
                        className="text-xs cursor-pointer"
                      >
                        Set as Default
                      </Label>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    data-ocid="admin.submit_button"
                    disabled={savingDelivery}
                    className="btn-primary"
                  >
                    {savingDelivery ? (
                      <Loader2 size={14} className="mr-1 animate-spin" />
                    ) : (
                      <Plus size={14} className="mr-1" />
                    )}
                    Add Rule
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddDeliveryForm(false)}
                    className="rounded-full"
                  >
                    <X size={14} className="mr-1" /> Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {deliveryLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="card-pink overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zone / Pincode</TableHead>
                    <TableHead>Charge (₹)</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveryRules.map(([id, rule], _i) =>
                    editingDeliveryId === id ? (
                      <TableRow key={id.toString()}>
                        <TableCell colSpan={4}>
                          <form
                            onSubmit={handleUpdateDeliveryRule}
                            className="space-y-3 py-2"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <Label className="text-xs">
                                  Zone / Pincode
                                </Label>
                                <Input
                                  data-ocid="admin.input"
                                  value={editDeliveryForm.zoneOrPincode}
                                  onChange={(e) =>
                                    setEditDeliveryForm({
                                      ...editDeliveryForm,
                                      zoneOrPincode: e.target.value,
                                    })
                                  }
                                  className="rounded-xl text-sm"
                                  required
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Charge (₹)</Label>
                                <Input
                                  data-ocid="admin.input"
                                  type="number"
                                  min={0}
                                  value={Number(editDeliveryForm.chargeINR)}
                                  onChange={(e) =>
                                    setEditDeliveryForm({
                                      ...editDeliveryForm,
                                      chargeINR: BigInt(e.target.value || 0),
                                    })
                                  }
                                  className="rounded-xl text-sm"
                                  required
                                />
                              </div>
                              <div className="space-y-1 flex items-end pb-1">
                                <div className="flex items-center gap-2">
                                  <Switch
                                    data-ocid="admin.switch"
                                    checked={editDeliveryForm.isDefault}
                                    onCheckedChange={(v) =>
                                      setEditDeliveryForm({
                                        ...editDeliveryForm,
                                        isDefault: v,
                                      })
                                    }
                                    id="edit-default"
                                  />
                                  <Label
                                    htmlFor="edit-default"
                                    className="text-xs cursor-pointer"
                                  >
                                    Default
                                  </Label>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="submit"
                                data-ocid="admin.save_button"
                                disabled={savingDelivery}
                                size="sm"
                                className="btn-primary"
                              >
                                <Save size={14} className="mr-1" /> Save
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingDeliveryId(null)}
                                className="rounded-full"
                              >
                                <X size={14} className="mr-1" /> Cancel
                              </Button>
                            </div>
                          </form>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow key={id.toString()} data-ocid="delivery.row">
                        <TableCell className="font-medium text-sm">
                          {rule.zoneOrPincode}
                        </TableCell>
                        <TableCell className="font-semibold text-sm">
                          ₹{Number(rule.chargeINR)}
                        </TableCell>
                        <TableCell>
                          {rule.isDefault ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-primary">
                              Default
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                              Custom
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              data-ocid="delivery.edit_button"
                              onClick={() => {
                                setEditingDeliveryId(id);
                                setEditDeliveryForm(rule);
                              }}
                              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              data-ocid="delivery.delete_button"
                              onClick={() =>
                                handleDeleteDeliveryRule(id, rule.isDefault)
                              }
                              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                  {deliveryRules.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                        data-ocid="delivery.empty_state"
                      >
                        No delivery rules yet. Add one to get started!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="max-w-lg">
            <h2 className="font-display font-semibold text-lg mb-6">
              Settings ⚙️
            </h2>

            <div className="card-pink p-6 mb-6">
              <h3 className="font-semibold mb-1">🔒 Razorpay Configuration</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Set your Razorpay API keys for payment processing
              </p>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">
                    Key ID (rzp_live_... / rzp_test_...)
                  </Label>
                  <Input
                    data-ocid="admin.input"
                    value={rzKeyId}
                    onChange={(e) => setRzKeyId(e.target.value)}
                    className="rounded-xl text-sm"
                    placeholder="rzp_test_..."
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Key Secret</Label>
                  <Input
                    data-ocid="admin.input"
                    type="password"
                    value={rzKeySecret}
                    onChange={(e) => setRzKeySecret(e.target.value)}
                    className="rounded-xl text-sm"
                    placeholder="••••••••"
                  />
                </div>
                <Button
                  data-ocid="admin.save_button"
                  onClick={handleSaveRazorpayKeys}
                  disabled={savingKeys}
                  className="btn-primary"
                >
                  {savingKeys ? (
                    <Loader2 size={14} className="mr-1 animate-spin" />
                  ) : (
                    <Save size={14} className="mr-1" />
                  )}
                  Save Keys
                </Button>
              </div>
            </div>

            <div className="card-pink p-6">
              <h3 className="font-semibold mb-1">📇 Contact Info</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Customer-facing contact details
              </p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li>📧 glamwellaa@gmail.com</li>
                <li>📸 @glamwellaa._ on Instagram</li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
