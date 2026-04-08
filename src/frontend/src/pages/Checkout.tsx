import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Loader2,
  Tag,
  Truck,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCart } from "../contexts/CartContext";
import { useActor } from "../hooks/useActor";
import { useMyProfile } from "../hooks/useQueries";
import { useCreateOrder } from "../hooks/useQueries";
import type { CouponActor } from "../types/coupon";

interface CheckoutProps {
  onNavigate: (path: string) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
  }) => void;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export function Checkout({ onNavigate }: CheckoutProps) {
  const { items, totalINR, clearCart } = useCart();
  const { actor } = useActor();
  const { data: profile } = useMyProfile();
  const createOrder = useCreateOrder();
  const [isPaying, setIsPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Delivery charge state
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    gmail: "",
    landmark: "",
  });

  useEffect(() => {
    if (profile) {
      const p = profile.pincode;
      setForm({
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        pincode: p,
        gmail: profile.gmail,
        landmark: profile.landmark ?? "",
      });
      if (p && p.length === 6 && actor) {
        if (totalINR > 999) {
          setDeliveryCharge(0);
        } else {
          (actor as any)
            .getDeliveryChargeForPincode(p)
            .then((c: bigint) => setDeliveryCharge(Number(c)))
            .catch(() => {});
        }
      }
    }
  }, [profile, actor, totalINR]);

  // Re-fetch when pincode field changes
  useEffect(() => {
    if (form.pincode.length === 6 && actor) {
      if (totalINR > 999) {
        setDeliveryCharge(0);
      } else {
        (actor as any)
          .getDeliveryChargeForPincode(form.pincode)
          .then((c: bigint) => setDeliveryCharge(Number(c)))
          .catch(() => {});
      }
    }
  }, [form.pincode, actor, totalINR]);

  const isFreeDelivery = totalINR > 999;
  const finalTotal =
    Math.max(0, totalINR - (appliedCoupon?.discount ?? 0)) +
    (isFreeDelivery ? 0 : deliveryCharge);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    if (!actor) {
      toast.error("Not connected to backend");
      return;
    }
    setValidatingCoupon(true);
    setCouponError("");
    try {
      const result = await (actor as unknown as CouponActor).validateCoupon(
        couponCode.trim().toUpperCase(),
      );
      if ("ok" in result) {
        const discount = Number(result.ok);
        setAppliedCoupon({ code: couponCode.trim().toUpperCase(), discount });
        toast.success(`Coupon applied! ₹${discount} off 🎉`);
      } else {
        setCouponError(result.err);
        setAppliedCoupon(null);
      }
    } catch {
      setCouponError("Failed to validate coupon. Try again.");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  if (items.length === 0 && !success) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <button
          type="button"
          onClick={() => onNavigate("/")}
          className="btn-primary mt-4"
        >
          Shop Now
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="container mx-auto px-4 py-20 text-center"
        data-ocid="checkout.success_state"
      >
        <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
        <h2 className="font-display text-3xl font-bold text-foreground mb-3">
          Order Placed! 🎉
        </h2>
        <p className="text-muted-foreground mb-8">
          Thank you for shopping with GLAMWELLA! Your order is confirmed. ♥
        </p>
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={() => onNavigate("/orders")}
            className="btn-primary"
          >
            My Orders
          </button>
          <button
            type="button"
            onClick={() => onNavigate("/")}
            className="btn-gold"
          >
            Continue Shopping
          </button>
        </div>
      </motion.div>
    );
  }

  const handlePay = async () => {
    if (
      !form.name ||
      !form.phone ||
      !form.address ||
      !form.city ||
      !form.pincode
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!actor) {
      toast.error("Not connected to backend");
      return;
    }

    setIsPaying(true);
    try {
      // Load Razorpay SDK
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error("Failed to load Razorpay. Please check your connection.");
        setIsPaying(false);
        return;
      }

      // Get Razorpay key ID from backend
      const [keyId] = await actor.getRazorpayKeys();

      // Open Razorpay checkout directly (no server-side order required)
      const options: RazorpayOptions = {
        key: keyId,
        amount: finalTotal * 100, // amount in paise
        currency: "INR",
        name: "GLAMWELLA",
        description: "Beauty Products Order",
        handler: async (response) => {
          try {
            // Save order to backend after successful payment
            const orderItems = items.map((item) => ({
              productId: item.productId,
              quantity: BigInt(item.quantity),
              price:
                item.discountPriceINR > 0n
                  ? item.discountPriceINR
                  : item.priceINR,
            }));
            await createOrder.mutateAsync({
              items: orderItems,
              totalINR: BigInt(finalTotal),
              razorpayOrderId: response.razorpay_payment_id,
              customerName: form.name,
              phone: form.phone,
              address: form.address,
              city: form.city,
              pincode: form.pincode,
              landmark: form.landmark ?? "",
            });
            // Redeem coupon if applied
            if (appliedCoupon) {
              try {
                await (actor as unknown as CouponActor).redeemCoupon(
                  appliedCoupon.code,
                );
              } catch {
                // Non-critical: order is saved, coupon redemption failed
              }
            }
            clearCart();
            setSuccess(true);
          } catch (err) {
            console.error(err);
            toast.error("Order save failed. Contact support.");
          } finally {
            setIsPaying(false);
          }
        },
        prefill: {
          name: form.name,
          email: form.gmail,
          contact: form.phone,
        },
        theme: { color: "#e91e8c" },
        modal: {
          ondismiss: () => {
            setIsPaying(false);
            toast.info("Payment cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error("Payment failed. Please try again.");
      setIsPaying(false);
    }
  };

  const field = (
    id: string,
    label: string,
    key: keyof typeof form,
    type = "text",
    required = true,
  ) => (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-sm font-medium">
        {label} {required && <span className="text-primary">*</span>}
      </Label>
      <Input
        id={id}
        data-ocid="checkout.input"
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="rounded-xl border-border focus:border-primary"
        required={required}
      />
    </div>
  );

  return (
    <main className="container mx-auto px-4 py-8 pb-16">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => onNavigate("/cart")}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="font-display text-2xl font-bold">Checkout 💕</h1>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Form */}
        <div className="md:col-span-3 space-y-5">
          <div className="card-pink p-6">
            <h2 className="font-display font-semibold text-lg mb-4">
              Delivery Details 🎀
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field("name", "Full Name", "name")}
              {field("phone", "Phone Number", "phone", "tel")}
              {field("gmail", "Email", "gmail", "email", false)}
              {field("address", "Full Address", "address")}
              {field("city", "City", "city")}
              {field("pincode", "Pincode", "pincode")}
            </div>
            <div className="mt-3">
              {field(
                "landmark",
                "Landmark (Near / Opposite)",
                "landmark",
                "text",
                false,
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-2">
          <div className="card-pink p-6 sticky top-24">
            <h2 className="font-display font-semibold text-lg mb-4">
              Order Summary ♥
            </h2>
            <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
              {items.map((item) => (
                <div
                  key={item.productId.toString()}
                  className="flex items-center gap-2 text-sm"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full"
                        style={{
                          background:
                            "linear-gradient(135deg, #fce4ec, #f48fb1)",
                        }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-foreground">{item.name}</p>
                    <p className="text-muted-foreground">x{item.quantity}</p>
                  </div>
                  <span className="font-medium">
                    ₹
                    {Number(
                      item.discountPriceINR > 0n
                        ? item.discountPriceINR
                        : item.priceINR,
                    ) * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Section */}
            <div className="border-t border-border pt-4 mb-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <Tag size={12} /> Have a coupon?
              </p>
              {appliedCoupon ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2"
                  data-ocid="checkout.success_state"
                >
                  <div>
                    <p className="text-xs font-bold text-green-700 font-mono">
                      {appliedCoupon.code}
                    </p>
                    <p className="text-xs text-green-600">
                      −₹{appliedCoupon.discount} off
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-green-600 hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    data-ocid="checkout.input"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    placeholder="Enter code"
                    className="rounded-xl text-sm font-mono uppercase flex-1"
                  />
                  <Button
                    type="button"
                    data-ocid="checkout.secondary_button"
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                    size="sm"
                    className="rounded-xl px-3 bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20"
                    variant="ghost"
                  >
                    {validatingCoupon ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      "Apply"
                    )}
                  </Button>
                </div>
              )}
              {couponError && (
                <p
                  className="text-xs text-red-500 mt-1"
                  data-ocid="checkout.error_state"
                >
                  {couponError}
                </p>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{totalINR}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span>−₹{appliedCoupon.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Truck size={12} /> Delivery
                </span>
                {isFreeDelivery ? (
                  <span className="text-green-600 font-semibold text-xs">
                    FREE 🎉
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    ₹{deliveryCharge}
                  </span>
                )}
              </div>
              <div className="flex justify-between font-bold text-base border-t border-border pt-2">
                <span>Total</span>
                <span className="text-primary">₹{finalTotal}</span>
              </div>
            </div>

            <Button
              data-ocid="checkout.primary_button"
              onClick={handlePay}
              disabled={isPaying}
              className="btn-primary w-full py-3 text-base"
            >
              {isPaying ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />{" "}
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={16} className="mr-2" /> Pay ₹{finalTotal}{" "}
                  with Razorpay
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">
              🔒 Secure payment powered by Razorpay
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
