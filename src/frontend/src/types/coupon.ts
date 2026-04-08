export interface Coupon {
  code: string;
  discountAmountINR: bigint;
  maxUsesPerUser: bigint;
  isActive: boolean;
}

export interface CouponActor {
  getCoupons(): Promise<Array<[bigint, Coupon]>>;
  addCoupon(coupon: Coupon): Promise<bigint>;
  updateCoupon(id: bigint, coupon: Coupon): Promise<void>;
  deleteCoupon(id: bigint): Promise<void>;
  validateCoupon(code: string): Promise<{ ok: bigint } | { err: string }>;
  redeemCoupon(code: string): Promise<{ ok: null } | { err: string }>;
  hasCouponBeenUsed(code: string): Promise<boolean>;
}
