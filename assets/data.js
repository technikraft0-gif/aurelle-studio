/* Aurelle Studio — seed data.
   All amounts are in the store's configured currency (NGN by default).
   Images are remote Unsplash URLs; image failures fall back to a placeholder. */

(function () {
  "use strict";

  const photo = (id) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=80`;

  const now = new Date();
  const daysAgo = (days) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d.toISOString();
  };

  const products = [
    ["P-001", "The Sculpted Blazer", "Tailoring", 89500, 34, "Published", "M"],
    ["P-002", "Satin Slip Dress", "Dresses", 68500, 18, "Published", "S"],
    ["P-003", "Everyday Linen Shirt", "Tops", 32500, 56, "Published", "M"],
    ["P-004", "The Weekend Tote", "Accessories", 27500, 7, "Published", "One Size"],
    ["P-005", "Wide-Leg Tailored Trouser", "Tailoring", 49500, 22, "Published", "M"],
    ["P-006", "Ribbed Knit Tank", "Tops", 18500, 42, "Published", "S"],
    ["P-007", "Soft Structure Mini Bag", "Accessories", 42000, 5, "Published", "One Size"],
    ["P-008", "Pleated Midi Skirt", "Bottoms", 38500, 13, "Published", "M"],
    ["P-009", "The Sunday Knit", "Knitwear", 56500, 9, "Published", "M"],
    ["P-010", "Linen Blend Co-ord", "Sets", 79500, 16, "Published", "M"],
    ["P-011", "Classic Cotton Tee", "Tops", 15500, 68, "Published", "M"],
    ["P-012", "Draped Evening Top", "Tops", 44500, 11, "Published", "S"],
    ["P-013", "The City Trench", "Outerwear", 125000, 4, "Published", "M"],
    ["P-014", "Relaxed Denim Jean", "Bottoms", 47500, 29, "Published", "M"],
    ["P-015", "Gold Arc Earrings", "Jewellery", 12500, 32, "Published", "One Size"],
    ["P-016", "The Occasion Gown", "Dresses", 145000, 6, "Published", "S"],
    ["P-017", "Structured Crossbody", "Accessories", 39500, 15, "Published", "One Size"],
    ["P-018", "Cashmere-Blend Cardigan", "Knitwear", 89500, 8, "Published", "M"],
    ["P-019", "Textured Resort Shirt", "Tops", 36500, 21, "Published", "M"],
    ["P-020", "The Column Dress", "Dresses", 76500, 12, "Published", "M"],
    ["P-021", "Classic Leather Belt", "Accessories", 19500, 19, "Published", "One Size"],
    ["P-022", "Soft Pleat Shorts", "Bottoms", 28500, 25, "Published", "M"],
    ["P-023", "Evening Clutch", "Accessories", 34500, 0, "Draft", "One Size"],
    ["P-024", "Autumn Wrap Coat", "Outerwear", 155000, 3, "Draft", "M"],
    ["P-025", "Silk-Feel Scarf", "Accessories", 16500, 27, "Archived", "One Size"],
    ["P-026", "The Essential Bodysuit", "Tops", 24500, 14, "Published", "S"]
  ];

  const imageIds = [
    "photo-1591047139829-d91aecb6caea",
    "photo-1595777457583-95e059d581b8",
    "photo-1598554747436-c9293d6a588f",
    "photo-1548036328-c9fa89d128fa",
    "photo-1594633312681-425c7b97ccd1",
    "photo-1551488831-00ddcb6c6bd3",
    "photo-1584917865442-de89df76afd3",
    "photo-1583496661160-fb5886a0aaaa",
    "photo-1576566588028-4147f3842f27",
    "photo-1515886657613-9f3515b0c78f",
    "photo-1521572163474-6864f9cf17ab",
    "photo-1551163943-3f6a855d1153",
    "photo-1548126032-079a0fb0099d",
    "photo-1541099649105-f69ad21f3246",
    "photo-1535632066927-ab7c9ab60908",
    "photo-1539008835657-9e8e9680c956",
    "photo-1566150905458-1bf1fc113f0d",
    "photo-1576566588028-4147f3842f27",
    "photo-1525507119028-ed4c629a60a3",
    "photo-1591047139829-d91aecb6caea",
    "photo-1622560480654-d96214fdc887",
    "photo-1591195853828-11db59a44f6b",
    "photo-1584917865442-de89df76afd3",
    "photo-1548126032-079a0fb0099d",
    "photo-1529139574466-a303027c1d8b",
    "photo-1551163943-3f6a855d1153"
  ];

  const productRows = products.map((p, i) => ({
    id: p[0],
    sku: p[0],
    name: p[1],
    category: p[2],
    price: p[3],
    compareAtPrice: p[3] * (i % 4 === 0 ? 1.15 : 1),
    stock: p[4],
    status: p[5],
    defaultSize: p[6],
    description: `${p[1]} by Aurelle Studio. Thoughtfully designed for modern wardrobes, with an understated silhouette and considered details.`,
    slug: p[1].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    tags: ["Aurelle", i % 2 ? "New season" : "Everyday"],
    sizes: p[6] === "One Size" ? ["One Size"] : ["XS", "S", "M", "L", "XL"],
    colors: ["Espresso", "Ivory", "Clay"],
    material: i % 2 ? "Cotton blend" : "Linen blend",
    care: "Cold gentle wash. Dry in shade.",
    weight: 0.35 + (i % 5) * 0.1,
    images: [photo(imageIds[i])],
    variants: [
      {
        id: `${p[0]}-ESP-M`,
        sku: `${p[0]}-ESP-M`,
        size: p[6],
        color: "Espresso",
        stock: p[4],
        reserved: Math.min(3, p[4]),
        reorderPoint: 8
      }
    ],
    createdAt: daysAgo(40 - i),
    updatedAt: daysAgo(i % 13),
    publishedAt: p[5] === "Published" ? daysAgo(35 - (i % 20)) : null
  }));

  const customerNames = [
    ["Amara Okafor", "amara.okafor@example.com"],
    ["Zainab Bello", "zainab.bello@example.com"],
    ["Tomi Adeyemi", "tomi.adeyemi@example.com"],
    ["Nneka Eze", "nneka.eze@example.com"],
    ["Mariam Yusuf", "mariam.yusuf@example.com"],
    ["Ada Nwosu", "ada.nwosu@example.com"],
    ["Dara Akinola", "dara.akinola@example.com"],
    ["Imani James", "imani.james@example.com"],
    ["Kemi Balogun", "kemi.balogun@example.com"],
    ["Lara Ogunleye", "lara.ogunleye@example.com"],
    ["Sade Williams", "sade.williams@example.com"],
    ["Farida Hassan", "farida.hassan@example.com"],
    ["Chika Obi", "chika.obi@example.com"],
    ["Bisi Lawal", "bisi.lawal@example.com"],
    ["Moyo Adebayo", "moyo.adebayo@example.com"],
    ["Rita Onuoha", "rita.onuoha@example.com"]
  ];

  const customers = customerNames.map((c, i) => ({
    id: `CUS-${String(i + 1).padStart(3, "0")}`,
    name: c[0],
    email: c[1],
    phone: `+234 80${String(10000000 + i * 13827).slice(0, 8)}`,
    city: ["Lagos", "Abuja", "Port Harcourt", "Ibadan"][i % 4],
    ordersCount: 1 + (i * 3) % 8,
    totalSpent: 65000 + i * 27400,
    lastOrderAt: daysAgo(i % 28),
    notes: i % 4 === 0 ? "Prefers neutral colours and classic silhouettes." : "",
    createdAt: daysAgo(90 - i * 3),
    status: "Active"
  }));

  const staff = [
    {
      id: "STF-001",
      name: "Nadia Adebayo",
      email: "admin@aurelle.demo",
      phone: "+234 801 234 5601",
      role: "Admin",
      status: "Active",
      password: "aurelle123",
      avatar: "",
      lastActiveAt: daysAgo(0),
      requirePasswordChange: false
    },
    {
      id: "STF-002",
      name: "Tola Martins",
      email: "cashier@aurelle.demo",
      phone: "+234 802 345 6702",
      role: "Cashier",
      status: "Active",
      password: "aurelle123",
      avatar: "",
      lastActiveAt: daysAgo(0),
      requirePasswordChange: false
    },
    {
      id: "STF-003",
      name: "Ifeoma Okoye",
      email: "attendant@aurelle.demo",
      phone: "+234 803 456 7803",
      role: "Sales Attendant",
      status: "Active",
      password: "aurelle123",
      avatar: "",
      lastActiveAt: daysAgo(1),
      requirePasswordChange: false
    },
    {
      id: "STF-004",
      name: "Mina Yusuf",
      email: "mina@aurelle.demo",
      phone: "+234 804 567 8904",
      role: "Sales Attendant",
      status: "Active",
      password: "welcome123",
      avatar: "",
      lastActiveAt: daysAgo(2),
      requirePasswordChange: true
    },
    {
      id: "STF-005",
      name: "Kara Bello",
      email: "kara@aurelle.demo",
      phone: "+234 805 678 9005",
      role: "Cashier",
      status: "Active",
      password: "welcome123",
      avatar: "",
      lastActiveAt: daysAgo(4),
      requirePasswordChange: true
    },
    {
      id: "STF-006",
      name: "Simi James",
      email: "simi@aurelle.demo",
      phone: "+234 806 789 0106",
      role: "Sales Attendant",
      status: "Invited",
      password: "welcome123",
      avatar: "",
      lastActiveAt: null,
      requirePasswordChange: true
    }
  ];

  const paymentMethods = ["Card", "Bank transfer", "Cash", "Mobile money"];
  const orderStatuses = ["Delivered", "Processing", "Shipped", "Pending", "Cancelled", "Refunded"];

  const orders = Array.from({ length: 44 }, (_, index) => {
    const n = index + 1;
    const customer = customers[(index * 5 + 2) % customers.length];
    const product = productRows[(index * 7 + 1) % productRows.length];
    const secondProduct = productRows[(index * 3 + 4) % productRows.length];
    const quantity = 1 + (index % 2);
    const items = [{
      productId: product.id,
      name: product.name,
      sku: product.sku,
      image: product.images[0],
      price: product.price,
      quantity,
      size: product.defaultSize,
      color: "Espresso"
    }];

    if (index % 4 === 0) {
      items.push({
        productId: secondProduct.id,
        name: secondProduct.name,
        sku: secondProduct.sku,
        image: secondProduct.images[0],
        price: secondProduct.price,
        quantity: 1,
        size: secondProduct.defaultSize,
        color: "Ivory"
      });
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = index % 7 === 0 ? Math.round(subtotal * 0.05) : 0;
    const shipping = subtotal >= 100000 ? 0 : 2500;
    const tax = Math.round((subtotal - discount) * 0.075);
    const status = orderStatuses[index % orderStatuses.length];
    const staffMember = staff[1 + (index % 4)];

    return {
      id: `ORD-${String(1001 + index)}`,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      items,
      subtotal,
      discount,
      shipping,
      tax,
      total: subtotal - discount + shipping + tax,
      status,
      paymentMethod: paymentMethods[index % paymentMethods.length],
      paymentStatus: status === "Refunded" ? "Refunded" : "Paid",
      staffId: staffMember.id,
      staffName: staffMember.name,
      source: index % 5 === 0 ? "In-store" : "Online",
      note: "",
      createdAt: daysAgo(index % 35),
      updatedAt: daysAgo(index % 12),
      timeline: [
        { label: "Order placed", date: daysAgo(index % 35), done: true },
        { label: "Payment confirmed", date: daysAgo(index % 35), done: true },
        { label: "Order fulfilled", date: status === "Delivered" ? daysAgo(index % 30) : null, done: status === "Delivered" },
        { label: "Delivered", date: status === "Delivered" ? daysAgo(index % 28) : null, done: status === "Delivered" }
      ]
    };
  });

  const expenses = [
    { id: "EXP-001", title: "Studio rent", category: "Rent", amount: 450000, date: daysAgo(4), note: "Monthly studio rent", receipt: "" },
    { id: "EXP-002", title: "Packaging supplies", category: "Supplies", amount: 67500, date: daysAgo(3), note: "Gift boxes and tissue paper", receipt: "" },
    { id: "EXP-003", title: "Content photography", category: "Marketing", amount: 120000, date: daysAgo(7), note: "New-season product shoot", receipt: "" },
    { id: "EXP-004", title: "Courier charges", category: "Shipping", amount: 38500, date: daysAgo(2), note: "Customer deliveries", receipt: "" },
    { id: "EXP-005", title: "Store utilities", category: "Utilities", amount: 42000, date: daysAgo(10), note: "Electricity and internet", receipt: "" }
  ];

  const stockMovements = productRows.slice(0, 12).map((p, i) => ({
    id: `MOV-${String(i + 1).padStart(3, "0")}`,
    productId: p.id,
    productName: p.name,
    variantSku: p.variants[0].sku,
    type: i % 3 === 0 ? "Restock" : "Correction",
    delta: i % 3 === 0 ? 8 : -1,
    before: p.stock,
    after: p.stock + (i % 3 === 0 ? 8 : -1),
    reason: i % 3 === 0 ? "Restock" : "Correction",
    note: i % 3 === 0 ? "Opening stock intake" : "Stock count reconciliation",
    staffId: staff[i % staff.length].id,
    staffName: staff[i % staff.length].name,
    createdAt: daysAgo(i)
  }));

  const coupons = [
    { id: "CPN-001", code: "WELCOME10", type: "percentage", value: 10, minOrder: 50000, usageCount: 23, usageLimit: 250, perCustomerLimit: 1, startsAt: daysAgo(30), expiresAt: daysAgo(-60), active: true },
    { id: "CPN-002", code: "AURELLE15", type: "percentage", value: 15, minOrder: 100000, usageCount: 8, usageLimit: 100, perCustomerLimit: 1, startsAt: daysAgo(5), expiresAt: daysAgo(-20), active: true },
    { id: "CPN-003", code: "FREESHIP", type: "free shipping", value: 0, minOrder: 75000, usageCount: 14, usageLimit: 200, perCustomerLimit: 2, startsAt: daysAgo(14), expiresAt: daysAgo(-30), active: false }
  ];

  const reviews = [
    { id: "REV-001", customerName: "Amara Okafor", productId: "P-002", rating: 5, title: "Beautiful fit", body: "The satin feels lovely and the fit is exactly right. I will be ordering again.", status: "Pending", createdAt: daysAgo(1), reply: "" },
    { id: "REV-002", customerName: "Zainab Bello", productId: "P-003", rating: 4, title: "An easy wardrobe staple", body: "Lovely fabric and a relaxed fit. Would love more colours.", status: "Approved", createdAt: daysAgo(3), reply: "Thank you for your kind review!" },
    { id: "REV-003", customerName: "Dara Akinola", productId: "P-008", rating: 3, title: "Nice skirt", body: "Nice shape, but I would recommend checking the size guide.", status: "Pending", createdAt: daysAgo(5), reply: "" }
  ];

  const activity = [
    { id: "ACT-001", actorId: "STF-001", actorName: "Nadia Adebayo", action: "Signed in", target: "Admin panel", createdAt: daysAgo(0) },
    { id: "ACT-002", actorId: "STF-002", actorName: "Tola Martins", action: "Created order", target: "ORD-1004", createdAt: daysAgo(0) },
    { id: "ACT-003", actorId: "STF-003", actorName: "Ifeoma Okoye", action: "Updated stock", target: "P-007", createdAt: daysAgo(1) },
    { id: "ACT-004", actorId: "STF-001", actorName: "Nadia Adebayo", action: "Updated product", target: "P-003", createdAt: daysAgo(1) }
  ];

  const categories = [
    { id: "CAT-001", name: "Dresses", slug: "dresses", description: "Pieces for every occasion", sortOrder: 1, active: true },
    { id: "CAT-002", name: "Tops", slug: "tops", description: "Everyday layers and statement tops", sortOrder: 2, active: true },
    { id: "CAT-003", name: "Tailoring", slug: "tailoring", description: "Considered structure and sharp lines", sortOrder: 3, active: true },
    { id: "CAT-004", name: "Bottoms", slug: "bottoms", description: "Modern wardrobe foundations", sortOrder: 4, active: true },
    { id: "CAT-005", name: "Accessories", slug: "accessories", description: "The finishing details", sortOrder: 5, active: true },
    { id: "CAT-006", name: "Knitwear", slug: "knitwear", description: "Soft layers for everyday", sortOrder: 6, active: true },
    { id: "CAT-007", name: "Outerwear", slug: "outerwear", description: "Layers with intention", sortOrder: 7, active: true },
    { id: "CAT-008", name: "Sets", slug: "sets", description: "Coordinated, effortless dressing", sortOrder: 8, active: true },
    { id: "CAT-009", name: "Jewellery", slug: "jewellery", description: "Subtle finishing touches", sortOrder: 9, active: true }
  ];

  const collections = [
    { id: "COL-001", name: "The Autumn Edit", description: "Rich textures and thoughtful layers.", productIds: ["P-009", "P-013", "P-018", "P-024"], active: true },
    { id: "COL-002", name: "Everyday Essentials", description: "The pieces you reach for most.", productIds: ["P-003", "P-006", "P-011", "P-014"], active: true },
    { id: "COL-003", name: "Occasion Dressing", description: "For evenings worth remembering.", productIds: ["P-002", "P-012", "P-016", "P-020"], active: true }
  ];

  const notifications = [
    { id: "NTF-001", title: "Low stock alert", body: "The Weekend Tote has only 7 units left.", type: "warning", read: false, createdAt: daysAgo(0), href: "inventory.html" },
    { id: "NTF-002", title: "New customer review", body: "A new review is waiting for moderation.", type: "info", read: false, createdAt: daysAgo(1), href: "reviews.html" },
    { id: "NTF-003", title: "Order delivered", body: "Order ORD-1001 was delivered.", type: "success", read: true, createdAt: daysAgo(2), href: "orders.html" }
  ];

  const settings = {
    storeName: "Aurelle Studio",
    email: "hello@aurellestudio.example",
    phone: "+234 809 555 0142",
    address: "Victoria Island, Lagos, Nigeria",
    currency: "NGN",
    timezone: "Africa/Lagos",
    taxRate: 7.5,
    freeShippingThreshold: 100000,
    announcementEnabled: true,
    announcementText: "Complimentary delivery on orders over ₦100,000",
    heroHeadline: "Considered pieces. Effortless presence.",
    heroSubtext: "A modern wardrobe, thoughtfully made.",
    featuredCollection: "The Autumn Edit",
    accentColor: "#B5654A",
    paymentMethods: {
      Card: true,
      "Bank transfer": true,
      Cash: true,
      "Mobile money": false
    },
    notifications: {
      email: true,
      inApp: true
    }
  };

  window.AurelleSeed = {
    products: productRows,
    customers,
    staff,
    orders,
    expenses,
    stockMovements,
    coupons,
    reviews,
    activity,
    categories,
    collections,
    notifications,
    settings
  };
})();