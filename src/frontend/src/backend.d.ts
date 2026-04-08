import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface DeliveryRule {
    zoneOrPincode: string;
    isDefault: boolean;
    chargeINR: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface OrderItem {
    productId: bigint;
    quantity: bigint;
    price: bigint;
}
export interface CustomerProfile {
    city: string;
    name: string;
    gmail: string;
    address: string;
    landmark: string;
    phone: string;
    pincode: string;
    profileComplete: boolean;
}
export interface Coupon {
    discountAmountINR: bigint;
    code: string;
    isActive: boolean;
    maxUsesPerUser: bigint;
}
export interface Order {
    customerName: string;
    status: string;
    city: string;
    createdAt: bigint;
    totalINR: bigint;
    razorpayOrderId: string;
    address: string;
    customerId: Principal;
    landmark: string;
    phone: string;
    items: Array<OrderItem>;
    pincode: string;
}
export interface Review {
    status: string;
    createdAt: bigint;
    productId: bigint;
    comment: string;
    customerId: Principal;
    rating: bigint;
}
export interface Product {
    stockQuantity: bigint;
    name: string;
    description: string;
    imageUrl: string;
    discountPriceINR: bigint;
    category: string;
    priceINR: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCoupon(coupon: Coupon): Promise<bigint>;
    addDeliveryRule(rule: DeliveryRule): Promise<bigint>;
    addProduct(product: Product): Promise<bigint>;
    adminLogin(username: string, password: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    approveReview(reviewId: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrUpdateProfile(profile: CustomerProfile): Promise<void>;
    createOrder(items: Array<OrderItem>, totalINR: bigint, razorpayOrderId: string, customerName: string, phone: string, address: string, city: string, pincode: string, landmark: string): Promise<bigint | null>;
    createRazorpayOrder(amountPaise: bigint, receipt: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteCoupon(id: bigint): Promise<void>;
    deleteDeliveryRule(id: bigint): Promise<void>;
    deleteProduct(id: bigint): Promise<void>;
    deleteReview(reviewId: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    filterProductsByCategory(category: string): Promise<Array<[bigint, Product]>>;
    getAllOrders(): Promise<Array<[bigint, Order]>>;
    getApprovedReviewsForProduct(productId: bigint): Promise<Array<Review>>;
    getCallerUserProfile(): Promise<CustomerProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCompletedOrders(): Promise<Array<[bigint, Order]>>;
    getCoupons(): Promise<Array<[bigint, Coupon]>>;
    getCustomerReviews(): Promise<Array<Review>>;
    getDeletedOrders(): Promise<Array<[bigint, Order]>>;
    getDeliveryChargeForPincode(pincode: string): Promise<bigint>;
    getDeliveryRules(): Promise<Array<[bigint, DeliveryRule]>>;
    getMyOrders(): Promise<Array<[bigint, Order]>>;
    getMyProfile(): Promise<CustomerProfile | null>;
    getOrderById(orderId: bigint): Promise<Order | null>;
    getOrdersSortedById(): Promise<Array<[bigint, Order]>>;
    getOrdersSortedByTotal(): Promise<Array<[bigint, Order]>>;
    getPendingOrders(): Promise<Array<[bigint, Order]>>;
    getPendingReviews(): Promise<Array<[bigint, Review]>>;
    getProductById(id: bigint): Promise<Product | null>;
    getProducts(): Promise<Array<[bigint, Product]>>;
    getProductsSortedByName(): Promise<Array<[bigint, Product]>>;
    getProductsSortedByPrice(): Promise<Array<[bigint, Product]>>;
    getProfile(user: Principal): Promise<CustomerProfile | null>;
    getRazorpayKeys(): Promise<[string, string]>;
    getUserProfile(user: Principal): Promise<CustomerProfile | null>;
    hasCouponBeenUsed(code: string): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    redeemCoupon(code: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    saveCallerUserProfile(profile: CustomerProfile): Promise<void>;
    searchProducts(searchText: string): Promise<Array<[bigint, Product]>>;
    setRazorpayKeys(keyId: string, keySecret: string): Promise<void>;
    softDeleteOrders(orderIds: Array<bigint>): Promise<boolean>;
    submitReview(productId: bigint, rating: bigint, comment: string): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateCoupon(id: bigint, coupon: Coupon): Promise<void>;
    updateDeliveryRule(id: bigint, rule: DeliveryRule): Promise<void>;
    updateOrderStatus(orderId: bigint, status: string): Promise<boolean>;
    updateProduct(id: bigint, product: Product): Promise<void>;
    validateAdminToken(token: string): Promise<boolean>;
    validateCoupon(code: string): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
}
