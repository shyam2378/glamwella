import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Int "mo:core/Int";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Order "mo:core/Order";

import OutCall "mo:caffeineai-http-outcalls/outcall";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import AccessControl "mo:caffeineai-authorization/access-control";



actor {
  // Access Control (Internet Identity)
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  type Product = {
    name : Text;
    category : Text;
    description : Text;
    priceINR : Nat;
    discountPriceINR : Nat;
    imageUrl : Text;
    stockQuantity : Nat;
  };

  module Product {
    public func compareByPrice(prod1 : Product, prod2 : Product) : Order.Order {
      Nat.compare(prod1.priceINR, prod2.priceINR);
    };

    public func compareByName(prod1 : Product, prod2 : Product) : Order.Order {
      Text.compare(prod1.name, prod2.name);
    };
  };

  type OrderItem = {
    productId : Nat;
    quantity : Nat;
    price : Nat;
  };

  // V1 type for migration compatibility with existing stable data
  type OrderV1 = {
    customerId : Principal;
    items : [OrderItem];
    totalINR : Nat;
    razorpayOrderId : Text;
    status : Text;
    customerName : Text;
    phone : Text;
    address : Text;
    city : Text;
    pincode : Text;
    createdAt : Int;
  };

  // Current type with landmark
  type Order = {
    customerId : Principal;
    items : [OrderItem];
    totalINR : Nat;
    razorpayOrderId : Text;
    status : Text;
    customerName : Text;
    phone : Text;
    address : Text;
    city : Text;
    pincode : Text;
    landmark : Text;
    createdAt : Int;
  };

  module OrderSummary {
    public func compareByTotal(order1 : { id : Nat; totalINR : Nat }, order2 : { id : Nat; totalINR : Nat }) : Order.Order {
      Nat.compare(order1.totalINR, order2.totalINR);
    };

    public func compareById(order1 : { id : Nat; totalINR : Nat }, order2 : { id : Nat; totalINR : Nat }) : Order.Order {
      Nat.compare(order1.id, order2.id);
    };
  };

  // V1 type for migration compatibility with existing stable data
  type CustomerProfileV1 = {
    name : Text;
    phone : Text;
    gmail : Text;
    address : Text;
    city : Text;
    pincode : Text;
    profileComplete : Bool;
  };

  // Current type with landmark
  type CustomerProfile = {
    name : Text;
    phone : Text;
    gmail : Text;
    address : Text;
    city : Text;
    pincode : Text;
    landmark : Text;
    profileComplete : Bool;
  };

  type Review = {
    productId : Nat;
    customerId : Principal;
    rating : Nat;
    comment : Text;
    status : Text;
    createdAt : Int;
  };

  type Coupon = {
    code : Text;
    discountAmountINR : Nat;
    maxUsesPerUser : Nat;
    isActive : Bool;
  };

  // State
  let products = Map.empty<Nat, Product>();
  var nextProductId = 1;

  // V1 maps: keep same names as old stable vars so existing data is loaded here
  let orders = Map.empty<Nat, OrderV1>();
  var nextOrderId = 1;

  let customerProfiles = Map.empty<Principal, CustomerProfileV1>();

  // V2 maps: new types with landmark field
  let ordersV2 = Map.empty<Nat, Order>();
  let deletedOrders = Map.empty<Nat, Order>();
  let customerProfilesV2 = Map.empty<Principal, CustomerProfile>();

  // Migration flag
  var _profilesMigrated = false;

  system func postupgrade() {
    if (not _profilesMigrated) {
      for ((p, cp) in customerProfiles.entries()) {
        customerProfilesV2.add(p, {
          name = cp.name;
          phone = cp.phone;
          gmail = cp.gmail;
          address = cp.address;
          city = cp.city;
          pincode = cp.pincode;
          landmark = "";
          profileComplete = cp.profileComplete;
        });
      };
      for ((id, order) in orders.entries()) {
        ordersV2.add(id, {
          customerId = order.customerId;
          items = order.items;
          totalINR = order.totalINR;
          razorpayOrderId = order.razorpayOrderId;
          status = order.status;
          customerName = order.customerName;
          phone = order.phone;
          address = order.address;
          city = order.city;
          pincode = order.pincode;
          landmark = "";
          createdAt = order.createdAt;
        });
      };
      _profilesMigrated := true;
    };
  };
  let reviews = Map.empty<Nat, Review>();
  var nextReviewId = 1;

  var razorpayKeyId = "rzp_test_SXMVdpx3clK2gE";
  var razorpayKeySecret = "NRMY169glLmFuJj7t5evmOZf";

  // Coupons
  let coupons = Map.empty<Nat, Coupon>();
  var nextCouponId = 1;
  // tracks usage: key is "principalText:couponCode"
  let couponUsage = Map.empty<Text, Nat>();

  // Seed WELCOME coupon
  do {
    coupons.add(1, {
      code = "WELCOME";
      discountAmountINR = 50;
      maxUsesPerUser = 1;
      isActive = true;
    });
    nextCouponId := 2;
  };

  // Admin Authentication
  public query func adminLogin(username : Text, password : Text) : async {
    #ok : Text;
    #err : Text;
  } {
    if (username == "Jenifer" and password == "Jenifer@0307") {
      #ok("admin-token-verified");
    } else {
      #err("Invalid credentials. Please check your username and password.");
    };
  };

  public query func validateAdminToken(token : Text) : async Bool {
    token == "admin-token-verified";
  };

  // Products (Admin - no IC-level auth, protected by frontend token)
  public shared func addProduct(product : Product) : async Nat {
    let id = nextProductId;
    products.add(id, product);
    nextProductId += 1;
    id;
  };

  public shared func updateProduct(id : Nat, product : Product) : async () {
    if (not products.containsKey(id)) { Runtime.trap("Product not found") };
    products.add(id, product);
  };

  public shared func deleteProduct(id : Nat) : async () {
    if (not products.containsKey(id)) { Runtime.trap("Product not found") };
    products.remove(id);
  };

  // Products (Public)
  public query func getProducts() : async [(Nat, Product)] {
    let results = List.empty<(Nat, Product)>();
    for ((id, product) in products.entries()) {
      results.add((id, product));
    };
    results.values().toArray();
  };

  public query func getProductById(id : Nat) : async ?Product {
    products.get(id);
  };

  public query func searchProducts(searchText : Text) : async [(Nat, Product)] {
    let results = List.empty<(Nat, Product)>();
    for ((id, product) in products.entries()) {
      if (product.name.contains(#text(searchText)) or product.category.contains(#text(searchText))) {
        results.add((id, product));
      };
    };
    results.values().toArray();
  };

  public query func filterProductsByCategory(category : Text) : async [(Nat, Product)] {
    let results = List.empty<(Nat, Product)>();
    for ((id, product) in products.entries()) {
      if (product.category == category) {
        results.add((id, product));
      };
    };
    results.values().toArray();
  };

  // Orders
  public shared ({ caller }) func createOrder(items : [OrderItem], totalINR : Nat, razorpayOrderId : Text, customerName : Text, phone : Text, address : Text, city : Text, pincode : Text, landmark : Text) : async ?Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };

    // Decrement stock for each ordered item
    for (item in items.vals()) {
      switch (products.get(item.productId)) {
        case (null) {};
        case (?product) {
          let newStock : Nat = if (product.stockQuantity >= item.quantity) {
            product.stockQuantity - item.quantity : Nat;
          } else { 0 };
          let updatedProduct : Product = {
            product with stockQuantity = newStock;
          };
          products.add(item.productId, updatedProduct);
        };
      };
    };

    let orderId = nextOrderId;
    let order : Order = {
      customerId = caller;
      items;
      totalINR;
      razorpayOrderId;
      status = "Pending";
      customerName;
      phone;
      address;
      city;
      pincode;
      landmark;
      createdAt = Time.now();
    };

    ordersV2.add(orderId, order);
    nextOrderId += 1;
    ?orderId;
  };

  public shared ({ caller = _ }) func updateOrderStatus(orderId : Nat, status : Text) : async Bool {
    switch (ordersV2.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder : Order = {
          order with status;
        };
        ordersV2.add(orderId, updatedOrder);
        true;
      };
    };
  };

  public query ({ caller }) func getMyOrders() : async [(Nat, Order)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    let results = List.empty<(Nat, Order)>();
    for ((id, order) in ordersV2.entries()) {
      if (order.customerId == caller) {
        results.add((id, order));
      };
    };
    results.values().toArray();
  };

  public query ({ caller }) func getOrderById(orderId : Nat) : async ?Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    ordersV2.get(orderId);
  };

  // Admin - no IC-level auth, protected by frontend token
  public query func getAllOrders() : async [(Nat, Order)] {
    let results = List.empty<(Nat, Order)>();
    for ((id, order) in ordersV2.entries()) {
      results.add((id, order));
    };
    results.values().toArray();
  };

  public query func getPendingOrders() : async [(Nat, Order)] {
    let results = List.empty<(Nat, Order)>();
    for ((id, order) in ordersV2.entries()) {
      if (order.status == "Pending") {
        results.add((id, order));
      };
    };
    results.values().toArray();
  };

  public query func getCompletedOrders() : async [(Nat, Order)] {
    let results = List.empty<(Nat, Order)>();
    for ((id, order) in ordersV2.entries()) {
      if (order.status == "Completed") {
        results.add((id, order));
      };
    };
    results.values().toArray();
  };

  public func softDeleteOrders(orderIds : [Nat]) : async Bool {
    for (orderId in orderIds.vals()) {
      switch (ordersV2.get(orderId)) {
        case (?order) {
          deletedOrders.add(orderId, order);
          ordersV2.remove(orderId);
        };
        case (null) {};
      };
    };
    true;
  };

  public query func getDeletedOrders() : async [(Nat, Order)] {
    let results = List.empty<(Nat, Order)>();
    for ((id, order) in deletedOrders.entries()) {
      results.add((id, order));
    };
    results.values().toArray();
  };

  // Customer Profiles
  public query ({ caller }) func getCallerUserProfile() : async ?CustomerProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    customerProfilesV2.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?CustomerProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    customerProfilesV2.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : CustomerProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    customerProfilesV2.add(caller, profile);
  };

  public shared ({ caller }) func createOrUpdateProfile(profile : CustomerProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    customerProfilesV2.add(caller, profile);
  };

  public query ({ caller }) func getMyProfile() : async ?CustomerProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    customerProfilesV2.get(caller);
  };

  public query ({ caller }) func getProfile(user : Principal) : async ?CustomerProfile {
    if (caller != user) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    customerProfilesV2.get(user);
  };

  // Razorpay Integration
  public shared func setRazorpayKeys(keyId : Text, keySecret : Text) : async () {
    razorpayKeyId := keyId;
    razorpayKeySecret := keySecret;
  };

  public query func getRazorpayKeys() : async (Text, Text) {
    (razorpayKeyId, razorpayKeySecret);
  };

  public shared ({ caller }) func createRazorpayOrder(amountPaise : Nat, receipt : Text) : async {
    #ok : Text;
    #err : Text;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create Razorpay orders");
    };

    let url = "https://api.razorpay.com/v1/orders";
    let body = "{\"amount\":" # amountPaise.toText() # ",\"currency\":\"INR\",\"receipt\":\"" # receipt # "\"}";

    let credentials = razorpayKeyId # ":" # razorpayKeySecret;
    let basicAuth = "Basic " # credentials;

    let headers : [OutCall.Header] = [
      { name = "Authorization"; value = basicAuth },
      { name = "Content-Type"; value = "application/json" },
    ];

    try {
      let response = await OutCall.httpPostRequest(url, headers, body, transform);
      #ok(response);
    } catch (_e) {
      #err("HTTP outcall failed");
    };
  };

  // HTTP Outcall Transform
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Product Sorting Functions
  public query func getProductsSortedByPrice() : async [(Nat, Product)] {
    products.toArray().sort(
      func((idA, productA), (idB, productB)) {
        Product.compareByPrice(productA, productB);
      }
    );
  };

  public query func getProductsSortedByName() : async [(Nat, Product)] {
    products.toArray().sort(
      func((idA, productA), (idB, productB)) {
        Product.compareByName(productA, productB);
      }
    );
  };

  // Order Sorting Functions
  public query func getOrdersSortedByTotal() : async [(Nat, Order)] {
    ordersV2.toArray().sort(
      func((idA, orderA), (idB, orderB)) {
        OrderSummary.compareByTotal(
          { id = idA; totalINR = orderA.totalINR },
          { id = idB; totalINR = orderB.totalINR },
        );
      }
    );
  };

  public query func getOrdersSortedById() : async [(Nat, Order)] {
    ordersV2.toArray().sort(
      func((idA, orderA), (idB, orderB)) {
        OrderSummary.compareById(
          { id = idA; totalINR = orderA.totalINR },
          { id = idB; totalINR = orderB.totalINR },
        );
      }
    );
  };

  // Review System
  public shared ({ caller }) func submitReview(productId : Nat, rating : Nat, comment : Text) : async {
    #ok : Nat;
    #err : Text;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      #err("Unauthorized: Only customers can submit reviews");
    } else if (rating < 1 or rating > 5) {
      #err("Rating must be between 1 and 5");
    } else {
      let reviewId = nextReviewId;
      let review : Review = {
        productId;
        customerId = caller;
        rating;
        comment;
        status = "pending";
        createdAt = Time.now();
      };
      reviews.add(reviewId, review);
      nextReviewId += 1;
      #ok(reviewId);
    };
  };

  public shared func approveReview(reviewId : Nat) : async {
    #ok;
    #err : Text;
  } {
    switch (reviews.get(reviewId)) {
      case (null) { #err("Review not found") };
      case (?review) {
        let updatedReview : Review = {
          review with status = "approved" : Text;
        };
        reviews.add(reviewId, updatedReview);
        #ok;
      };
    };
  };

  public shared func deleteReview(reviewId : Nat) : async {
    #ok;
    #err : Text;
  } {
    if (not reviews.containsKey(reviewId)) { return #err("Review not found") };
    reviews.remove(reviewId);
    #ok;
  };

  public query func getApprovedReviewsForProduct(productId : Nat) : async [Review] {
    let filtered = reviews.values().filter(
      func(review) {
        review.productId == productId and review.status == "approved";
      }
    );
    filtered.toArray();
  };

  public query func getPendingReviews() : async [(Nat, Review)] {
    let results = List.empty<(Nat, Review)>();
    for ((id, review) in reviews.entries()) {
      if (review.status == "pending") {
        results.add((id, review));
      };
    };
    results.values().toArray();
  };

  public query func getCustomerReviews() : async [Review] {
    let filtered = reviews.values().filter(
      func(review) {
        review.status == "approved";
      }
    );
    filtered.toArray();
  };

  // ==================== COUPON SYSTEM ====================

  // Admin: add a new coupon
  public shared func addCoupon(coupon : Coupon) : async Nat {
    let id = nextCouponId;
    coupons.add(id, coupon);
    nextCouponId += 1;
    id;
  };

  // Admin: update existing coupon
  public shared func updateCoupon(id : Nat, coupon : Coupon) : async () {
    if (not coupons.containsKey(id)) { Runtime.trap("Coupon not found") };
    coupons.add(id, coupon);
  };

  // Admin: delete a coupon
  public shared func deleteCoupon(id : Nat) : async () {
    if (not coupons.containsKey(id)) { Runtime.trap("Coupon not found") };
    coupons.remove(id);
  };

  // Admin: get all coupons
  public query func getCoupons() : async [(Nat, Coupon)] {
    let results = List.empty<(Nat, Coupon)>();
    for ((id, coupon) in coupons.entries()) {
      results.add((id, coupon));
    };
    results.values().toArray();
  };

  // User: validate a coupon code (check eligibility)
  public query ({ caller }) func validateCoupon(code : Text) : async {
    #ok : Nat; // discount amount in INR
    #err : Text;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err("Please log in to apply a coupon");
    };
    var found = false;
    var result : { #ok : Nat; #err : Text } = #err("Invalid coupon code");
    for ((id, coupon) in coupons.entries()) {
      if (coupon.code == code and not found) {
        found := true;
        if (not coupon.isActive) {
          result := #err("This coupon is no longer active");
        } else {
          let usageKey = caller.toText() # ":" # code;
          let used = switch (couponUsage.get(usageKey)) {
            case (null) { 0 };
            case (?n) { n };
          };
          if (used >= coupon.maxUsesPerUser) {
            result := #err("You have already used this coupon");
          } else {
            result := #ok(coupon.discountAmountINR);
          };
        };
      };
    };
    result;
  };

  // User: redeem a coupon (called after successful order)
  public shared ({ caller }) func redeemCoupon(code : Text) : async {
    #ok;
    #err : Text;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err("Unauthorized");
    };
    var found = false;
    var result : { #ok; #err : Text } = #err("Invalid coupon code");
    for ((id, coupon) in coupons.entries()) {
      if (coupon.code == code and not found) {
        found := true;
        if (not coupon.isActive) {
          result := #err("Coupon is not active");
        } else {
          let usageKey = caller.toText() # ":" # code;
          let used = switch (couponUsage.get(usageKey)) {
            case (null) { 0 };
            case (?n) { n };
          };
          if (used >= coupon.maxUsesPerUser) {
            result := #err("Coupon usage limit reached");
          } else {
            couponUsage.add(usageKey, used + 1);
            result := #ok;
          };
        };
      };
    };
    result;
  };

  // User: check if they have used a specific coupon (for banner logic)
  public query ({ caller }) func hasCouponBeenUsed(code : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return false;
    };
    let usageKey = caller.toText() # ":" # code;
    switch (couponUsage.get(usageKey)) {
      case (null) { false };
      case (?n) { n > 0 };
    };
  };

  // Delivery Rules
  type DeliveryRule = {
    zoneOrPincode : Text;
    chargeINR : Nat;
    isDefault : Bool;
  };

  let deliveryRules = Map.empty<Nat, DeliveryRule>();
  var nextDeliveryRuleId = 1;

  // Seed default delivery rule
  do {
    deliveryRules.add(1, {
      zoneOrPincode = "Default";
      chargeINR = 60;
      isDefault = true;
    });
    nextDeliveryRuleId := 2;
  };

  // Admin: add delivery rule
  public shared func addDeliveryRule(rule : DeliveryRule) : async Nat {
    let id = nextDeliveryRuleId;
    deliveryRules.add(id, rule);
    nextDeliveryRuleId += 1;
    id;
  };

  // Admin: update delivery rule
  public shared func updateDeliveryRule(id : Nat, rule : DeliveryRule) : async () {
    if (not deliveryRules.containsKey(id)) { Runtime.trap("Delivery rule not found") };
    deliveryRules.add(id, rule);
  };

  // Admin: delete delivery rule
  public shared func deleteDeliveryRule(id : Nat) : async () {
    if (not deliveryRules.containsKey(id)) { Runtime.trap("Delivery rule not found") };
    deliveryRules.remove(id);
  };

  // Admin/Public: get all delivery rules
  public query func getDeliveryRules() : async [(Nat, DeliveryRule)] {
    let results = List.empty<(Nat, DeliveryRule)>();
    for ((id, rule) in deliveryRules.entries()) {
      results.add((id, rule));
    };
    results.values().toArray();
  };

  // Public: get delivery charge for a specific pincode
  // Returns 0 if subtotal > 999 (free delivery threshold handled on frontend)
  public query func getDeliveryChargeForPincode(pincode : Text) : async Nat {
    var charge : Nat = 0;
    var foundExact = false;
    var defaultCharge : Nat = 60;
    
    for ((id, rule) in deliveryRules.entries()) {
      if (rule.isDefault) {
        defaultCharge := rule.chargeINR;
      };
      if (rule.zoneOrPincode == pincode and not rule.isDefault) {
        charge := rule.chargeINR;
        foundExact := true;
      };
    };
    
    if (foundExact) { charge } else { defaultCharge };
  };

};
