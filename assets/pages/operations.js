
/* Aurelle Studio — shared operations pages
   Requires: Store, Auth, UI, AurelleLayout
*/
(() => {
  "use strict";

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = (v = "") => UI.escapeHTML(String(v ?? ""));
  const money = v => UI.money(Number(v) || 0, Store.get("settings")?.currency || "USD");
  const list = key => Store.list(key) || [];
  const byId = (key, id) => list(key).find(x => String(x.id) === String(id));
  const id = () => Store.makeId();
  const today = () => new Date().toISOString().slice(0, 10);
  const val = (form, name) => new FormData(form).get(name)?.toString().trim() || "";
  const can = (feature, action = "view") => Auth.can(feature, action);
  const isAdmin = () => Auth.currentRole() === "admin";
  const page = document.body.dataset.page || location.pathname.split("/").pop().replace(".html", "");
  let query = "";
  let activeFilter = "All";
  let selectedRecord = null;

  const configs = {
    orders: { title: "Orders", subtitle: "Track fulfilment, payments, and customer purchases.", key: "orders", feature: "orders" },
    customers: { title: "Customers", subtitle: "Understand your customers and their order history.", key: "customers", feature: "customers" },
    users: { title: "Team & access", subtitle: "Manage staff accounts, roles, and activity.", key: "staff", feature: "users" },
    inventory: { title: "Inventory", subtitle: "Keep stock accurate and replenishment predictable.", key: "products", feature: "inventory" },
    sales: { title: "Sales & finance", subtitle: "Review transactions, expenses, and store performance.", key: "orders", feature: "sales" },
    settings: { title: "Settings", subtitle: "Configure the store experience and checkout.", key: "settings", feature: "settings" },
    profile: { title: "My profile", subtitle: "Your account, preferences, and security.", key: "staff", feature: "profile" },
    reviews: { title: "Reviews", subtitle: "Keep customer feedback thoughtful and useful.", key: "reviews", feature: "reviews" },
    notifications: { title: "Notifications", subtitle: "Updates and reminders for your store.", key: "notifications", feature: "notifications" },
    help: { title: "Help & shortcuts", subtitle: "Quick answers for everyday store operations.", key: "", feature: "help" },
    "404": { title: "Page not found", subtitle: "That page isn't part of this collection.", key: "", feature: "" },
    "no-access": { title: "Access restricted", subtitle: "Your current role can't open this page.", key: "", feature: "" }
  };

  function records() {
    let rows = list(configs[page]?.key);
    if (page === "sales" && !isAdmin()) {
      const staff = Auth.currentStaff();
      rows = rows.filter(r => String(r.staffId || r.createdBy || "") === String(staff?.id));
    }
    if (query) {
      const q = query.toLowerCase();
      rows = rows.filter(r => JSON.stringify(r).toLowerCase().includes(q));
    }
    if (activeFilter !== "All") {
      rows = rows.filter(r => String(r.status || r.role || r.type || "").toLowerCase() === activeFilter.toLowerCase());
    }
    return rows;
  }

  function stats(items) {
    const total = items.length;
    const amount = items.reduce((sum, x) => sum + Number(x.total ?? x.amount ?? x.price ?? 0), 0);
    return { total, amount };
  }

  function button(label, action, kind = "secondary", extra = "") {
    return `<button type="button" data-action="${esc(action)}" ${extra}
      class="btn-${kind}">${esc(label)}</button>`;
  }

  function field(label, name, value = "", type = "text", extra = "") {
    return `<label class="block space-y-1.5">
      <span class="field-label">${esc(label)}</span>
      <input class="field-input w-full" name="${esc(name)}" type="${esc(type)}"
        value="${esc(value)}" ${extra}/>
    </label>`;
  }

  function selectField(label, name, options, value = "") {
    return `<label class="block space-y-1.5">
      <span class="field-label">${esc(label)}</span>
      <select class="field-input w-full" name="${esc(name)}">
        ${options.map(o => {
          const item = typeof o === "string" ? { value: o, label: o } : o;
          return `<option value="${esc(item.value)}" ${item.value === value ? "selected" : ""}>${esc(item.label)}</option>`;
        }).join("")}
      </select>
    </label>`;
  }

  function textarea(label, name, value = "", rows = 3) {
    return `<label class="block space-y-1.5">
      <span class="field-label">${esc(label)}</span>
      <textarea class="field-input w-full" name="${esc(name)}" rows="${rows}">${esc(value)}</textarea>
    </label>`;
  }

  function badge(status) {
    return UI.statusBadge(status || "Active");
  }

  function avatar(name = "") {
    return `<span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream font-semibold text-espresso">${esc(UI.initials(name || "A"))}</span>`;
  }

  function panel(title, body, action = "") {
    return `<section class="panel min-w-0 overflow-hidden">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-espresso/10 px-4 py-4 md:px-5">
        <h2 class="font-display text-xl text-espresso">${esc(title)}</h2>${action}
      </div><div class="p-4 md:p-5">${body}</div></section>`;
  }

  function statCard(label, value, note = "") {
    return `<article class="panel p-4 md:p-5">
      <p class="text-sm text-muted">${esc(label)}</p>
      <p class="mt-2 font-display text-3xl tabular-nums text-espresso">${esc(value)}</p>
      <p class="mt-1 text-xs text-muted">${esc(note)}</p>
    </article>`;
  }

  function toolbar(placeholder = "Search records…", addLabel = "", addAction = "create") {
    return `<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <label class="relative block min-w-0 flex-1 sm:max-w-sm">
        <span class="sr-only">Search</span>
        <input id="page-search" class="field-input w-full pl-10" placeholder="${esc(placeholder)}" value="${esc(query)}"/>
        <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">${UI.icon("search", 18)}</span>
      </label>
      <div class="flex flex-wrap gap-2">
        ${button("Export CSV", "export")}
        ${addLabel && can(configs[page].feature, "edit") ? button(addLabel, addAction, "primary") : ""}
      </div>
    </div>`;
  }

  function filterTabs(statuses) {
    return `<div class="flex gap-2 overflow-x-auto pb-1" role="tablist">
      ${statuses.map(s => `<button data-filter="${esc(s)}" class="filter-tab whitespace-nowrap ${activeFilter === s ? "active" : ""}">${esc(s)}</button>`).join("")}
    </div>`;
  }

  function table(headers, rows) {
    return `<div class="overflow-x-auto"><table class="w-full min-w-[680px] text-left text-sm">
      <thead class="bg-cream text-xs uppercase tracking-wide text-muted"><tr>
        ${headers.map(h => `<th class="px-4 py-3 font-semibold">${esc(h)}</th>`).join("")}
      </tr></thead><tbody class="divide-y divide-espresso/10">${rows || ""}</tbody>
    </table></div>`;
  }

  function row(cells, actions = "") {
    return `<tr class="align-middle hover:bg-ivory/70">${cells.map(c => `<td class="px-4 py-3.5">${c}</td>`).join("")}
      ${actions ? `<td class="px-4 py-3.5 text-right">${actions}</td>` : ""}</tr>`;
  }

  function empty(title = "Nothing to show yet", detail = "New records will appear here when they're added.") {
    return `<div class="px-5 py-12 text-center">
      <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-cream text-espresso">${UI.icon("inbox", 22)}</div>
      <h3 class="font-semibold text-espresso">${esc(title)}</h3>
      <p class="mx-auto mt-1 max-w-sm text-sm text-muted">${esc(detail)}</p>
    </div>`;
  }

  function pageShell(content) {
    const root = $("#page-content") || $("#app-content") || $("#main-content") || $("main");
    if (root) root.innerHTML = content;
  }

  function header(c) {
    return `<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><p class="mb-1 text-xs font-semibold uppercase tracking-[.18em] text-clay">AURELLE STUDIO</p>
      <h1 class="font-display text-3xl text-espresso md:text-4xl">${esc(c.title)}</h1>
      <p class="mt-1 max-w-2xl text-sm text-muted">${esc(c.subtitle)}</p></div>
      ${page === "orders" ? button("Create order", "create", "primary") : ""}
    </div>`;
  }

  function persist(key, data, message = "Changes saved") {
    Store.set(key, data);
    UI.toast(message);
    render();
  }

  function createRecord(key, data, message) {
    Store.create(key, { id: id(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data });
    Auth.logActivity?.(`Created ${key.slice(0, -1)}`);
    UI.toast(message || "Created successfully");
    render();
  }

  function editRecord(key, record, fields, title = "Edit record", onSave) {
    const content = `<form id="record-form" class="space-y-4">
      ${fields(record).join("")}
      <div class="flex justify-end gap-2 pt-3">${button("Cancel", "close-modal")}
        <button class="btn-primary" type="submit">Save changes</button></div>
    </form>`;
    UI.openModal({ title, content, size: "lg" });
    $("#record-form")?.addEventListener("submit", e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      if (onSave) onSave(data, record);
      else Store.update(key, record.id, { ...data, updatedAt: new Date().toISOString() });
      UI.closeOverlay?.($(".modal-overlay"));
      UI.toast("Changes saved");
      render();
    });
  }

  function confirmDelete(key, record, label = "this record", nameGuard = false) {
    const input = nameGuard ? `<p class="mb-3 text-sm text-muted">Type <strong>${esc(record.name)}</strong> to confirm deletion.</p><input class="field-input w-full" name="confirmName" placeholder="Enter exact name" required/>` : "";
    UI.openModal({ title: "Delete record?", content: `<form id="delete-form" class="space-y-4">
      <p class="text-sm text-muted">This will permanently remove ${esc(label)}. This action cannot be undone.</p>${input}
      <div class="flex justify-end gap-2">${button("Cancel", "close-modal")}<button class="btn-primary" type="submit">Delete</button></div>
    </form>` });
    $("#delete-form")?.addEventListener("submit", e => {
      e.preventDefault();
      if (nameGuard && val(e.currentTarget, "confirmName") !== record.name) return UI.toast("The name doesn't match", "error");
      Store.remove(key, record.id);
      UI.closeOverlay?.($(".modal-overlay"));
      UI.toast("Record deleted");
      render();
    });
  }

  function showDetail(title, html) {
    UI.openDrawer({ title, content: html, size: "lg" });
  }

  function exportRows(rows, filename = `${page}-${today()}.csv`) {
    if (!rows.length) return UI.toast("There are no records to export", "error");
    UI.csvDownload(filename, rows);
  }

  function renderOrders() {
    const rows = records();
    const totals = stats(rows);
    const tableRows = rows.map(o => row([
      `<button class="font-semibold text-espresso underline-offset-4 hover:underline" data-action="detail" data-id="${esc(o.id)}">#${esc(o.orderNumber || o.id)}</button><p class="mt-1 text-xs text-muted">${esc(UI.date(o.createdAt || o.date))}</p>`,
      `<div class="font-medium">${esc(o.customerName || o.customer?.name || "Walk-in customer")}</div><div class="text-xs text-muted">${esc(o.email || o.customer?.email || "")}</div>`,
      money(o.total || o.amount), badge(o.status || "Pending"),
      esc(o.paymentMethod || o.payment?.method || "—")
    ], button("View", "detail", "secondary", `data-id="${esc(o.id)}"`))).join("");
    pageShell(`${header(configs.orders)}
      <div class="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        ${statCard("Orders", totals.total, "Matching records")}
        ${statCard("Order value", money(totals.amount), "Matching order totals")}
        ${statCard("Pending", rows.filter(o => (o.status || "").toLowerCase() === "pending").length, "Awaiting action")}
        ${statCard("Fulfilled", rows.filter(o => ["shipped", "delivered"].includes((o.status || "").toLowerCase())).length, "Shipped or delivered")}
      </div>
      <div class="space-y-4">${toolbar("Search order, customer, email…")}
      ${filterTabs(["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"])}
      ${panel("Order register", rows.length ? table(["Order", "Customer", "Total", "Status", "Payment", "Action"], tableRows) : empty("No orders found", "Try another filter or create a new order."))}</div>`);
  }

  function orderDetail(o) {
    const items = o.items || o.products || [];
    showDetail(`Order #${o.orderNumber || o.id}`, `
      <div class="mb-5 flex flex-wrap items-center justify-between gap-3">${badge(o.status || "Pending")}<span class="font-display text-2xl">${money(o.total || o.amount)}</span></div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-xl bg-ivory p-4"><p class="text-xs uppercase tracking-wide text-muted">Customer</p><p class="mt-1 font-semibold">${esc(o.customerName || o.customer?.name || "Walk-in customer")}</p><p class="text-sm text-muted">${esc(o.email || o.customer?.email || "No email")}</p></div>
        <div class="rounded-xl bg-ivory p-4"><p class="text-xs uppercase tracking-wide text-muted">Payment</p><p class="mt-1 font-semibold">${esc(o.paymentMethod || "Not specified")}</p><p class="text-sm text-muted">${esc(UI.date(o.createdAt || o.date))}</p></div>
      </div>
      <h3 class="mb-3 mt-6 font-semibold">Items</h3>
      <div class="space-y-3">${items.length ? items.map(it => `<div class="flex justify-between gap-3 border-b border-espresso/10 pb-3"><div><p class="font-medium">${esc(it.name || it.productName || "Product")}</p><p class="text-xs text-muted">Qty ${esc(it.quantity || 1)}</p></div><span class="tabular-nums">${money((it.price || 0) * (it.quantity || 1))}</span></div>`).join("") : `<p class="text-sm text-muted">Item details aren't available for this demo order.</p>`}</div>
      <div class="mt-5 space-y-2 text-sm"><div class="flex justify-between"><span>Subtotal</span><span>${money(o.subtotal ?? o.total ?? o.amount)}</span></div><div class="flex justify-between"><span>Shipping</span><span>${money(o.shipping || 0)}</span></div><div class="flex justify-between font-semibold"><span>Total</span><span>${money(o.total || o.amount)}</span></div></div>
      <div class="mt-6 flex flex-wrap gap-2">
        ${button("Mark shipped", "set-order-status", "primary", `data-id="${esc(o.id)}" data-status="Shipped"`)}
        ${button("Mark delivered", "set-order-status", "secondary", `data-id="${esc(o.id)}" data-status="Delivered"`)}
        ${button("Refund", "set-order-status", "secondary", `data-id="${esc(o.id)}" data-status="Refunded"`)}
        ${button("Print invoice", "print-order", "secondary", `data-id="${esc(o.id)}"`)}
      </div>`);
  }

  function renderCustomers() {
    const rows = records();
    const tableRows = rows.map(c => row([
      `<div class="flex items-center gap-3">${avatar(c.name)}<div><p class="font-semibold">${esc(c.name || "Unnamed customer")}</p><p class="text-xs text-muted">${esc(c.email || "")}</p></div></div>`,
      esc(c.phone || "—"), esc(c.ordersCount ?? c.orderCount ?? 0),
      money(c.totalSpent || c.spent || 0), esc(UI.date(c.lastOrderAt || c.lastOrder) || "—")
    ], button("Details", "customer-detail", "secondary", `data-id="${esc(c.id)}"`))).join("");
    pageShell(`${header(configs.customers)}<div class="space-y-4">${toolbar("Search name, email, or phone…")}
      ${panel("Customer directory", rows.length ? table(["Customer", "Phone", "Orders", "Total spent", "Last order", "Action"], tableRows) : empty("No customers yet", "Customers appear here as orders are placed."))}</div>`);
  }

  function renderUsers() {
    if (!isAdmin()) return renderNoAccess();
    const rows = records();
    const tableRows = rows.map(u => row([
      `<div class="flex items-center gap-3">${avatar(u.name)}<div><p class="font-semibold">${esc(u.name)}</p><p class="text-xs text-muted">${esc(u.email)}</p></div></div>`,
      badge(u.role || "Sales Attendant"), badge(u.status || "Active"),
      esc(u.phone || "—"), esc(UI.relativeDate(u.lastActive || u.updatedAt || u.createdAt))
    ], `<div class="flex justify-end gap-2">${button("Edit", "edit-user", "secondary", `data-id="${esc(u.id)}"`)}${button("Remove", "delete-user", "secondary", `data-id="${esc(u.id)}"`)}</div>`)).join("");
    pageShell(`${header(configs.users)}<div class="space-y-4">${toolbar("Search staff name or email…", "Add team member")}
      ${filterTabs(["All", "Active", "Suspended", "Invited"])}
      ${panel("Team members", rows.length ? table(["Team member", "Role", "Status", "Phone", "Last active", "Actions"], tableRows) : empty("No team members", "Add a staff account to get started."))}
      ${panel("Role overview", `<div class="grid gap-3 md:grid-cols-3">
        <div class="rounded-xl bg-ivory p-4"><p class="font-semibold">Admin</p><p class="mt-1 text-sm text-muted">Full access to products, orders, customers, finance, staff, and settings.</p></div>
        <div class="rounded-xl bg-ivory p-4"><p class="font-semibold">Cashier</p><p class="mt-1 text-sm text-muted">Orders, own sales transactions, and read-only inventory.</p></div>
        <div class="rounded-xl bg-ivory p-4"><p class="font-semibold">Sales Attendant</p><p class="mt-1 text-sm text-muted">View products, edit stock, create/view orders, and view customers.</p></div>
      </div>`)}
    </div>`);
  }

  function renderInventory() {
    const products = list("products");
    const variants = products.flatMap(p => (p.variants?.length ? p.variants : [{
      id: p.id, productId: p.id, name: p.name, sku: p.sku, size: "—", color: "—",
      stock: Number(p.stock) || 0, reorderPoint: Number(p.reorderPoint) || 5, price: p.price
    }]).map(v => ({ ...v, productName: p.name, price: Number(v.price ?? p.price) || 0 })));
    const filtered = variants.filter(v => {
      const q = query.toLowerCase();
      const matches = !q || `${v.productName} ${v.sku} ${v.size} ${v.color}`.toLowerCase().includes(q);
      return matches && (activeFilter === "All" || (activeFilter === "Low stock" && v.stock > 0 && v.stock <= v.reorderPoint) || (activeFilter === "Out of stock" && v.stock <= 0));
    });
    const units = variants.reduce((n, v) => n + Number(v.stock || 0), 0);
    const low = variants.filter(v => v.stock > 0 && v.stock <= v.reorderPoint).length;
    const out = variants.filter(v => v.stock <= 0).length;
    const tableRows = filtered.map(v => row([
      `<div class="font-medium">${esc(v.productName)}</div><div class="text-xs text-muted">${esc(v.sku || "No SKU")}</div>`,
      esc(v.size), esc(v.color), `<span class="tabular-nums font-semibold">${esc(v.stock)}</span>`,
      esc(v.reorderPoint), badge(v.stock <= 0 ? "Out of stock" : v.stock <= v.reorderPoint ? "Low stock" : "In stock")
    ], button("Adjust", "adjust-stock", "secondary", `data-id="${esc(v.productId)}" data-variant="${esc(v.id)}" data-stock="${esc(v.stock)}" data-name="${esc(v.productName)}"`))).join("");
    pageShell(`${header(configs.inventory)}
      <div class="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">${statCard("Total SKUs", variants.length, "Product variants")}${statCard("Units in stock", units, "Across all variants")}${statCard("Low stock", low, "At or below reorder point")}${statCard("Out of stock", out, "Replenishment needed")}</div>
      <div class="space-y-4">${toolbar("Search product, SKU, size…")}
      ${filterTabs(["All", "Low stock", "Out of stock"])}
      ${panel("Stock overview", filtered.length ? table(["Product / SKU", "Size", "Colour", "On hand", "Reorder point", "Status", "Action"], tableRows) : empty("No stock records", "Try changing the stock filter."))}
      ${panel("Stock movement history", renderMovements())}</div>`);
  }

  function renderMovements() {
    const movements = list("stockMovements").slice().reverse().slice(0, 12);
    return movements.length ? `<div class="space-y-3">${movements.map(m => `<div class="flex items-start justify-between gap-3 border-b border-espresso/10 pb-3 last:border-0"><div><p class="font-medium">${esc(m.productName || m.product || "Stock adjustment")}</p><p class="text-xs text-muted">${esc(m.reason || "Adjustment")} · ${esc(m.note || "No note")} · ${esc(UI.date(m.createdAt))}</p></div><span class="font-semibold tabular-nums ${Number(m.change) < 0 ? "text-danger" : "text-success"}">${Number(m.change) > 0 ? "+" : ""}${esc(m.change ?? m.quantity ?? 0)}</span></div>`).join("")}</div>` : empty("No stock movements", "Every stock adjustment will be recorded here.");
  }

  function renderSales() {
    const orders = records();
    const expenses = list("expenses");
    const gross = orders.reduce((s, o) => s + Number(o.subtotal ?? o.total ?? o.amount ?? 0), 0);
    const refunds = orders.filter(o => (o.status || "").toLowerCase() === "refunded").reduce((s, o) => s + Number(o.total || o.amount || 0), 0);
    const discounts = orders.reduce((s, o) => s + Number(o.discount || 0), 0);
    const costs = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    pageShell(`${header(configs.sales)}
      <div class="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        ${statCard("Gross sales", money(gross), "From visible transactions")}
        ${statCard("Net sales", money(gross - refunds), "After recorded refunds")}
        ${statCard("Refunds", money(refunds), "Refunded orders")}
        ${statCard("Expenses", money(costs), "Recorded operating costs")}
      </div>
      <div class="space-y-4">
        ${toolbar("Search order, payment, or staff…", "Add expense", "add-expense")}
        ${filterTabs(["All", "Pending", "Processing", "Delivered", "Refunded"])}
        ${panel("Transactions", orders.length ? table(["Reference", "Date", "Customer", "Payment", "Status", "Amount", "Action"], orders.map(o => row([
          `#${esc(o.orderNumber || o.id)}`, esc(UI.date(o.createdAt || o.date)),
          esc(o.customerName || "Walk-in customer"), esc(o.paymentMethod || "—"),
          badge(o.status || "Paid"), money(o.total || o.amount)
        ], button("Details", "detail", "secondary", `data-id="${esc(o.id)}"`))).join("")) : empty("No transactions", "Transactions will appear when orders are recorded."))}
        ${panel("Profit & loss snapshot", `<div class="grid gap-3 sm:grid-cols-3">
          <div><p class="text-sm text-muted">Net sales</p><p class="mt-1 font-display text-2xl">${money(gross - refunds)}</p></div>
          <div><p class="text-sm text-muted">Operating expenses</p><p class="mt-1 font-display text-2xl">${money(costs)}</p></div>
          <div><p class="text-sm text-muted">Estimated balance</p><p class="mt-1 font-display text-2xl">${money(gross - refunds - costs)}</p></div>
        </div><p class="mt-3 text-xs text-muted">This is a simplified demo summary, not an accounting statement.</p>`)}
        ${panel("Recent expenses", expenses.length ? table(["Expense", "Category", "Date", "Amount", "Action"], expenses.map(e => row([esc(e.name || e.description), esc(e.category || "General"), esc(UI.date(e.date || e.createdAt)), money(e.amount)], button("Delete", "delete-expense", "secondary", `data-id="${esc(e.id)}"`))).join("")) : empty("No expenses recorded", "Add an expense to start tracking operating costs."))}
      </div>`);
  }

  function renderReviews() {
    const rows = records();
    const tableRows = rows.map(r => row([
      `<div class="font-medium">${esc(r.productName || r.product || "Product review")}</div><div class="mt-1 text-xs text-muted">${esc(r.customerName || r.name || "Customer")}</div>`,
      `<span class="text-gold">${"★".repeat(Math.max(0, Math.min(5, Number(r.rating) || 0)))}</span><span class="ml-1 text-xs text-muted">${esc(r.rating || 0)}/5</span>`,
      `<p class="max-w-sm whitespace-normal">${esc(r.comment || r.text || "")}</p>`,
      badge(r.status || "Pending"), esc(UI.date(r.createdAt || r.date))
    ], `<div class="flex justify-end gap-2">${button("Approve", "review-status", "secondary", `data-id="${esc(r.id)}" data-status="Approved"`)}${button("Hide", "review-status", "secondary", `data-id="${esc(r.id)}" data-status="Hidden"`)}${button("Reply", "reply-review", "secondary", `data-id="${esc(r.id)}"`)}</div>`)).join("");
    pageShell(`${header(configs.reviews)}<div class="space-y-4">${toolbar("Search review or product…")}${filterTabs(["All", "Pending", "Approved", "Hidden"])}
      ${panel("Customer feedback", rows.length ? table(["Product / reviewer", "Rating", "Review", "Status", "Date", "Actions"], tableRows) : empty("No reviews yet", "Customer reviews will appear here when submitted."))}</div>`);
  }

  function renderNotifications() {
    const rows = records().slice().reverse();
    pageShell(`${header(configs.notifications)}<div class="space-y-4">
      <div class="flex flex-wrap gap-2">${button("Mark all as read", "read-all", "primary")}${button("Clear search", "clear-search")}</div>
      ${panel("Your updates", rows.length ? `<div class="divide-y divide-espresso/10">${rows.map(n => `<div class="flex gap-3 py-4 first:pt-0 last:pb-0">
        <span class="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${n.read ? "bg-cream" : "bg-clay/10 text-clay"}">${UI.icon(n.icon || "bell", 18)}</span>
        <div class="min-w-0 flex-1"><div class="flex flex-wrap items-start justify-between gap-2"><p class="font-semibold">${esc(n.title || "Store update")}</p>${n.read ? `<span class="text-xs text-muted">Read</span>` : `<span class="rounded-full bg-warning-bg px-2 py-1 text-xs text-warning">New</span>`}</div>
        <p class="mt-1 text-sm text-muted">${esc(n.message || n.body || "")}</p><p class="mt-2 text-xs text-muted">${esc(UI.relativeDate(n.createdAt || n.date))}</p></div>
        ${button(n.read ? "Read" : "Mark read", "read-notification", "secondary", `data-id="${esc(n.id)}"`)}
      </div>`).join("")}</div>` : empty("You're all caught up", "New store activity will show up here."))}
    </div>`);
  }

  function renderHelp() {
    const shortcuts = [
      ["⌘ / Ctrl + K", "Open global search and command palette"],
      ["Esc", "Close the active modal or drawer"],
      ["G then D", "Dashboard (when supported by your browser setup)"],
      ["+", "Open quick-add from the mobile navigation"]
    ];
    const faqs = [
      ["How do I add a product?", "Open Products, choose Add product, fill in the product details, then save as draft or publish."],
      ["How do I correct stock?", "Open Inventory, select Adjust, enter the quantity change and reason. The adjustment is saved to stock movement history."],
      ["Can I preview another role?", "Use the profile menu's Preview as role option. Preview mode is for demonstration; permissions are still checked by the page controller."],
      ["Where is my data saved?", "This is a front-end demo. Data is stored in this browser's localStorage and is not synced to a server."],
      ["How do I export data?", "Use Export CSV on supported list pages. The file is generated in your browser."]
    ];
    pageShell(`${header(configs.help)}
      <div class="grid gap-4 xl:grid-cols-2">
        ${panel("Keyboard shortcuts", `<div class="space-y-3">${shortcuts.map(([k, d]) => `<div class="flex items-center justify-between gap-4 border-b border-espresso/10 pb-3 last:border-0"><p class="text-sm">${esc(d)}</p><kbd class="rounded-lg border border-espresso/10 bg-cream px-2.5 py-1.5 text-xs font-semibold">${esc(k)}</kbd></div>`).join("")}</div>`)}
        ${panel("Frequently asked questions", `<div class="space-y-4">${faqs.map(([q, a]) => `<details class="group border-b border-espresso/10 pb-4 last:border-0"><summary class="cursor-pointer list-none font-semibold">${esc(q)} <span class="float-right text-clay">＋</span></summary><p class="mt-2 text-sm leading-6 text-muted">${esc(a)}</p></details>`).join("")}</div>`)}
        ${panel("Need a hand?", `<p class="text-sm leading-6 text-muted">Aurelle Studio is a browser-only demonstration. Use the profile menu to switch demo roles, and reset demo data from Settings if you want to start over.</p><p class="mt-4 text-sm font-semibold">Aurelle Studio · Made for thoughtful retail</p>`)}
      </div>`);
  }

  function renderSettings() {
    if (!isAdmin()) return renderNoAccess();
    const s = Store.get("settings") || {};
    const coupons = list("coupons");
    const tab = new URLSearchParams(location.search).get("section") || "store";
    pageShell(`${header(configs.settings)}
      <div class="mb-4 flex gap-2 overflow-x-auto pb-1">${["store", "coupons", "shipping", "payments", "notifications", "danger"].map(t => `<a href="settings.html?section=${t}" class="filter-tab whitespace-nowrap ${tab === t ? "active" : ""}">${t[0].toUpperCase() + t.slice(1)}</a>`).join("")}</div>
      ${tab === "coupons" ? panel("Coupons & discounts", `${button("Create coupon", "create-coupon", "primary")}<div class="mt-4">${coupons.length ? table(["Code", "Type", "Value", "Usage", "Expiry", "Status", "Action"], coupons.map(c => row([`<strong>${esc(c.code)}</strong>`, esc(c.type), esc(c.value), esc(c.usageCount || 0), esc(c.expiry || "No expiry"), badge(c.active === false ? "Disabled" : "Active")], button("Delete", "delete-coupon", "secondary", `data-id="${esc(c.id)}"`))).join("")) : empty("No coupons yet", "Create a discount code for your customers.")}</div>`) :
      tab === "shipping" ? panel("Shipping & tax", `<form id="settings-form" class="grid gap-4 sm:grid-cols-2">${field("Standard shipping rate", "shippingRate", s.shippingRate ?? 0, "number", 'min="0" step="0.01"')}${field("Free shipping threshold", "freeShippingThreshold", s.freeShippingThreshold ?? 100, "number", 'min="0" step="0.01"')}${field("Tax rate (%)", "taxRate", s.taxRate ?? 0, "number", 'min="0" max="100" step="0.01"')}<div class="sm:col-span-2"><button class="btn-primary" type="submit">Save shipping settings</button></div></form>`) :
      tab === "payments" ? panel("Payment methods", `<form id="settings-form" class="space-y-4">${["Card", "Bank transfer", "Cash", "Mobile money"].map(m => `<label class="flex items-center justify-between rounded-xl border border-espresso/10 p-4"><span class="font-medium">${m}</span><input type="checkbox" name="payment-${m}" ${s.payments?.[m] !== false ? "checked" : ""} class="h-4 w-4 accent-clay"/></label>`).join("")}<button class="btn-primary" type="submit">Save payment settings</button></form>`) :
      tab === "notifications" ? panel("Notification preferences", `<form id="settings-form" class="space-y-4">${["emailNotifications", "inAppNotifications", "lowStockAlerts", "orderAlerts"].map(k => `<label class="flex items-center justify-between rounded-xl border border-espresso/10 p-4"><span class="font-medium">${esc(k.replace(/([A-Z])/g, " $1"))}</span><input type="checkbox" name="${k}" ${s[k] !== false ? "checked" : ""} class="h-4 w-4 accent-clay"/></label>`).join("")}<button class="btn-primary" type="submit">Save preferences</button></form>`) :
      tab === "danger" ? panel("Danger zone", `<p class="text-sm text-muted">Reset demo data to its original sample state. This replaces local demo changes in this browser.</p><div class="mt-4">${button("Reset demo data", "reset-demo", "primary")}</div>`) :
      panel("Store profile", `<form id="settings-form" class="grid gap-4 sm:grid-cols-2">${field("Store name", "storeName", s.storeName || "Aurelle Studio")}${field("Contact email", "contactEmail", s.contactEmail || "hello@aurelle.demo", "email")}${field("Phone", "phone", s.phone || "")}${field("Currency code", "currency", s.currency || "USD")}${field("Timezone", "timezone", s.timezone || "Africa/Lagos")}${field("Announcement bar", "announcement", s.announcement || "")}<div class="sm:col-span-2">${textarea("Hero headline", "heroHeadline", s.heroHeadline || "Pieces to treasure. Made to be lived in.")}</div><div class="sm:col-span-2"><button class="btn-primary" type="submit">Save store settings</button></div></form>`)}
    `);
  }

  function renderProfile() {
    const staff = Auth.currentStaff() || {};
    const key = "aurelle.profile.preferences";
    const prefs = JSON.parse(localStorage.getItem(key) || "{}");
    pageShell(`${header(configs.profile)}
      <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        ${panel("Personal details", `<form id="profile-form" class="space-y-4">${field("Full name", "name", staff.name || "")}${field("Email address", "email", staff.email || "", "email")}${field("Phone", "phone", staff.phone || "")}${textarea("Short bio", "bio", staff.bio || "")}<button class="btn-primary" type="submit">Save profile</button></form>`)}
        <div class="space-y-4">
          ${panel("Preferences", `<form id="prefs-form" class="space-y-4">
            <label class="flex items-center justify-between gap-3"><span class="text-sm">Email notifications</span><input name="email" type="checkbox" ${prefs.email !== false ? "checked" : ""} class="h-4 w-4 accent-clay"/></label>
            <label class="flex items-center justify-between gap-3"><span class="text-sm">In-app notifications</span><input name="inApp" type="checkbox" ${prefs.inApp !== false ? "checked" : ""} class="h-4 w-4 accent-clay"/></label>
            <label class="block space-y-1.5"><span class="field-label">Appearance</span><select name="theme" class="field-input w-full"><option value="light" ${prefs.theme !== "dark" ? "selected" : ""}>Warm light</option><option value="dark" ${prefs.theme === "dark" ? "selected" : ""}>Dark (preference only)</option></select></label>
            <button class="btn-primary" type="submit">Save preferences</button></form>`)}
          ${panel("Account security", `<p class="text-sm text-muted">For this front-end demo, authentication is simulated locally. Don't use a real password.</p><div class="mt-4">${button("Sign out", "logout", "secondary")}</div>`)}
        </div>
      </div>`);
  }

  function renderNotFound() {
    pageShell(`<div class="flex min-h-[65vh] flex-col items-center justify-center px-5 text-center">
      <span class="font-display text-8xl text-clay">404</span><h1 class="mt-3 font-display text-3xl text-espresso">This page wandered off.</h1>
      <p class="mt-2 max-w-md text-sm text-muted">The page may have moved, or the link may be incorrect.</p>
      <div class="mt-6 flex gap-2">${button("Back to dashboard", "dashboard", "primary")}${button("Go back", "back")}</div>
    </div>`);
  }

  function renderNoAccess() {
    pageShell(`<div class="flex min-h-[65vh] flex-col items-center justify-center px-5 text-center">
      <span class="flex h-16 w-16 items-center justify-center rounded-full bg-cream text-espresso">${UI.icon("shield-alert", 30)}</span>
      <h1 class="mt-4 font-display text-3xl text-espresso">You don't have access to this.</h1>
      <p class="mt-2 max-w-md text-sm text-muted">Your current demo role doesn't have permission to open this section. Switch roles from your profile menu or return to a page available to you.</p>
      <div class="mt-6 flex gap-2">${button("Back to dashboard", "dashboard", "primary")}${button("Go back", "back")}</div>
    </div>`);
  }

  function render() {
    if (page === "404") return renderNotFound();
    if (page === "no-access") return renderNoAccess();
    const c = configs[page];
    if (!c) return renderNotFound();
    if (c.feature && !can(c.feature, "view")) return renderNoAccess();
    ({
      orders: renderOrders,
      customers: renderCustomers,
      users: renderUsers,
      inventory: renderInventory,
      sales: renderSales,
      settings: renderSettings,
      profile: renderProfile,
      reviews: renderReviews,
      notifications: renderNotifications,
      help: renderHelp
    }[page] || renderNotFound)();
  }

  function openCreate() {
    if (page === "orders") return createOrder();
    if (page === "users") return createUser();
    if (page === "sales") return createExpense();
    UI.toast("Use the relevant page action to add a record.", "info");
  }

  function createOrder() {
    const products = list("products").filter(p => p.status !== "Archived");
    const customers = list("customers");
    const productOptions = products.map(p => ({ value: p.id, label: `${p.name} — ${money(p.price)}` }));
    editRecord("orders", {}, r => [
      field("Customer name", "customerName", ""),
      field("Customer email", "email", "", "email"),
      selectField("Product", "productId", productOptions, productOptions[0]?.value || ""),
      field("Quantity", "quantity", "1", "number", 'min="1" required'),
      selectField("Payment method", "paymentMethod", ["Cash", "Card", "Bank transfer", "Mobile money"], "Cash")
    ], "Create order", (data) => {
      const p = byId("products", data.productId);
      const quantity = Math.max(1, Number(data.quantity) || 1);
      if (p && Number(p.stock) < quantity) return UI.toast("Not enough stock available", "error");
      const total = (Number(p?.price) || 0) * quantity;
      Store.create("orders", { id: id(), orderNumber: `AU-${Date.now().toString().slice(-6)}`, customerName: data.customerName || "Walk-in customer", email: data.email, items: p ? [{ productId: p.id, name: p.name, price: p.price, quantity }] : [], total, subtotal: total, paymentMethod: data.paymentMethod, status: "Pending", createdAt: new Date().toISOString(), staffId: Auth.currentStaff()?.id });
      if (p) Store.update("products", p.id, { stock: Math.max(0, Number(p.stock || 0) - quantity) });
      UI.toast("Order created");
      render();
    });
  }

  function createUser() {
    editRecord("staff", {}, r => [
      field("Full name", "name", "", "text", "required"),
      field("Email address", "email", "", "email", "required"),
      field("Phone", "phone", ""),
      selectField("Role", "role", ["Admin", "Cashier", "Sales Attendant"], "Sales Attendant"),
      selectField("Status", "status", ["Active", "Invited", "Suspended"], "Active"),
      `<label class="block space-y-1.5"><span class="field-label">Temporary password</span><div class="flex gap-2"><input class="field-input min-w-0 flex-1" name="password" id="temp-password" value="Aurelle-${Math.random().toString(36).slice(2, 8)}!" required/><button type="button" class="btn-secondary" data-action="generate-password">Generate</button><button type="button" class="btn-secondary" data-action="copy-password">Copy</button></div></label>`
    ], "Add team member", data => {
      const current = Auth.currentStaff();
      if (list("staff").some(u => u.email?.toLowerCase() === data.email.toLowerCase())) return UI.toast("That email is already in use", "error");
      Store.create("staff", { id: id(), ...data, createdAt: new Date().toISOString(), lastActive: null, mustChangePassword: true });
      Auth.logActivity?.(`Created staff account for ${data.name}`);
      UI.toast("Team member added");
      render();
    });
  }

  function createExpense() {
    editRecord("expenses", {}, r => [
      field("Expense name", "name", "", "text", "required"),
      selectField("Category", "category", ["Supplies", "Shipping", "Marketing", "Rent", "Utilities", "Payroll", "Other"], "Other"),
      field("Amount", "amount", "", "number", 'min="0.01" step="0.01" required'),
      field("Date", "date", today(), "date", "required"),
      textarea("Note", "note", "")
    ], "Add expense", data => {
      Store.create("expenses", { id: id(), ...data, amount: Number(data.amount), createdAt: new Date().toISOString() });
      UI.toast("Expense added");
      render();
    });
  }

  function createCoupon() {
    editRecord("coupons", {}, r => [
      field("Coupon code", "code", `AURELLE${Math.floor(10 + Math.random() * 90)}`, "text", "required"),
      selectField("Discount type", "type", ["Percentage", "Fixed amount", "Free shipping"], "Percentage"),
      field("Value", "value", "15", "number", 'min="0" step="0.01" required'),
      field("Usage limit", "usageLimit", "100", "number", 'min="1"'),
      field("Expiry date", "expiry", "", "date"),
      selectField("Status", "active", [{ value: "true", label: "Active" }, { value: "false", label: "Disabled" }], "true")
    ], "Create coupon", data => {
      Store.create("coupons", { id: id(), ...data, value: Number(data.value), usageLimit: Number(data.usageLimit), active: data.active === "true", usageCount: 0, createdAt: new Date().toISOString() });
      UI.toast("Coupon created");
      render();
    });
  }

  function act(action, el) {
    const recordId = el.dataset.id;
    const record = configs[page]?.key ? byId(configs[page].key, recordId) : null;
    switch (action) {
      case "create": return openCreate();
      case "detail": return record && page === "orders" ? orderDetail(record) : null;
      case "customer-detail": {
        if (!record) return;
        const orders = list("orders").filter(o => o.customerId === record.id || o.email === record.email || o.customerName === record.name);
        return showDetail(record.name || "Customer", `<div class="flex items-center gap-3">${avatar(record.name)}<div><p class="font-semibold">${esc(record.email || "")}</p><p class="text-sm text-muted">${esc(record.phone || "No phone")}</p></div></div><h3 class="mb-3 mt-6 font-semibold">Order history</h3>${orders.length ? orders.map(o => `<div class="flex justify-between border-b border-espresso/10 py-3 text-sm"><span>#${esc(o.orderNumber || o.id)} · ${esc(UI.date(o.createdAt || o.date))}</span><strong>${money(o.total || o.amount)}</strong></div>`).join("") : `<p class="text-sm text-muted">No linked orders were found.</p>`}${textarea("Customer notes", "customerNotes", record.notes || "")}<button class="btn-primary mt-3" data-action="save-customer-notes" data-id="${esc(record.id)}">Save notes</button>`);
      }
      case "save-customer-notes": {
        const note = $("textarea[name=customerNotes]")?.value || "";
        Store.update("customers", recordId, { notes: note });
        UI.toast("Customer notes saved");
        return;
      }
      case "edit-user": {
        if (!isAdmin() || !record) return;
        if (record.id === Auth.currentStaff()?.id) UI.toast("Edit your own details from My profile.", "info");
        return editRecord("staff", record, u => [
          field("Full name", "name", u.name, "text", "required"),
          field("Email", "email", u.email, "email", "required"),
          field("Phone", "phone", u.phone || ""),
          selectField("Role", "role", ["Admin", "Cashier", "Sales Attendant"], u.role),
          selectField("Status", "status", ["Active", "Suspended", "Invited"], u.status || "Active")
        ], "Edit team member", data => {
          if (record.id === Auth.currentStaff()?.id && (data.role !== record.role || data.status !== "Active")) return UI.toast("You can't demote or suspend your own account.", "error");
          const admins = list("staff").filter(u => String(u.role).toLowerCase() === "admin" && u.status !== "Suspended");
          if (String(record.role).toLowerCase() === "admin" && (data.role !== record.role || data.status === "Suspended") && admins.length <= 1) return UI.toast("Keep at least one active admin.", "error");
          Store.update("staff", record.id, data);
          UI.toast("Team member updated");
          render();
        });
      }
      case "delete-user":
        if (record) {
          if (record.id === Auth.currentStaff()?.id) return UI.toast("You can't delete your own account.", "error");
          if (String(record.role).toLowerCase() === "admin" && list("staff").filter(u => String(u.role).toLowerCase() === "admin" && u.status !== "Suspended").length <= 1) return UI.toast("You can't delete the last active admin.", "error");
          return confirmDelete("staff", record, "this team member", true);
        }
        break;
      case "adjust-stock": {
        const product = byId("products", el.dataset.id);
        if (!product) return;
        const current = Number(product.stock) || 0;
        UI.openModal({ title: "Adjust stock", content: `<form id="stock-form" class="space-y-4">
          <p class="text-sm text-muted">${esc(product.name)} · Current stock: <strong>${current}</strong></p>
          ${field("New on-hand quantity", "stock", current, "number", 'min="0" step="1" required')}
          ${selectField("Reason", "reason", ["Restock", "Damaged", "Returned", "Correction"], "Restock")}
          ${textarea("Note", "note", "")}
          <div class="flex justify-end gap-2">${button("Cancel", "close-modal")}<button class="btn-primary" type="submit">Save adjustment</button></div>
        </form>` });
        $("#stock-form")?.addEventListener("submit", e => {
          e.preventDefault();
          const f = e.currentTarget;
          const next = Math.max(0, Number(val(f, "stock")) || 0);
          const change = next - current;
          Store.update("products", product.id, { stock: next, updatedAt: new Date().toISOString() });
          Store.create("stockMovements", { id: id(), productId: product.id, productName: product.name, change, previousStock: current, newStock: next, reason: val(f, "reason"), note: val(f, "note"), createdAt: new Date().toISOString(), staffId: Auth.currentStaff()?.id });
          UI.closeOverlay?.($(".modal-overlay"));
          UI.toast("Stock adjustment recorded");
          render();
        });
        break;
      }
      case "set-order-status": {
        const o = byId("orders", recordId);
        if (!o) return;
        if (el.dataset.status === "Refunded" && !isAdmin() && Auth.currentRole() !== "cashier") return UI.toast("You can't refund this order.", "error");
        Store.update("orders", o.id, { status: el.dataset.status, updatedAt: new Date().toISOString() });
        UI.toast(`Order marked ${el.dataset.status.toLowerCase()}`);
        render();
        break;
      }
      case "print-order": {
        const o = byId("orders", recordId);
        if (!o) return;
        const w = window.open("", "_blank", "width=720,height=800");
        if (!w) return UI.toast("Allow pop-ups to print the invoice.", "error");
        w.document.write(`<title>Invoice ${esc(o.orderNumber || o.id)}</title><style>body{font:14px Arial;padding:40px;color:#2A1F1A}h1{font-family:Georgia}table{width:100%;border-collapse:collapse;margin-top:24px}td{padding:12px;border-bottom:1px solid #ddd}.total{text-align:right;font-size:20px;margin-top:24px}</style><h1>Aurelle Studio</h1><p>Invoice #${esc(o.orderNumber || o.id)}</p><p>${esc(o.customerName || "Customer")} · ${esc(UI.date(o.createdAt || o.date))}</p><table>${(o.items || []).map(i => `<tr><td>${esc(i.name)}</td><td>${esc(i.quantity || 1)} × ${money(i.price)}</td><td>${money((i.quantity || 1) * (i.price || 0))}</td></tr>`).join("")}</table><p class="total">Total: <strong>${money(o.total || o.amount)}</strong></p>`);
        w.document.close(); w.focus(); w.print();
        break;
      }
      case "add-expense": return createExpense();
      case "create-coupon": return createCoupon();
      case "review-status": {
        const r = byId("reviews", recordId);
        if (!r) return;
        Store.update("reviews", r.id, { status: el.dataset.status, moderatedAt: new Date().toISOString() });
        UI.toast(`Review ${el.dataset.status.toLowerCase()}`);
        render();
        break;
      }
      case "reply-review": {
        const r = byId("reviews", recordId);
        if (!r) return;
        return editRecord("reviews", r, x => [textarea("Reply to review", "reply", x.reply || "")], "Reply to review", data => {
          Store.update("reviews", r.id, { reply: data.reply, repliedAt: new Date().toISOString() });
          UI.toast("Reply saved");
          render();
        });
      }
      case "read-notification": {
        const n = byId("notifications", recordId);
        if (n) Store.update("notifications", n.id, { read: true });
        return render();
      }
      case "read-all":
        list("notifications").forEach(n => Store.update("notifications", n.id, { read: true }));
        UI.toast("All notifications marked as read");
        return render();
      case "delete-expense": {
        const e = byId("expenses", recordId);
        if (e) return confirmDelete("expenses", e, "this expense");
        break;
      }
      case "delete-coupon": {
        const c = byId("coupons", recordId);
        if (c) return confirmDelete("coupons", c, "this coupon");
        break;
      }
      case "export": return exportRows(records(), `${page}-${today()}.csv`);
      case "generate-password": {
        const input = $("#temp-password");
        if (input) input.value = `Aurelle-${Math.random().toString(36).slice(2, 9)}!`;
        break;
      }
      case "copy-password": {
        const input = $("#temp-password");
        if (input) navigator.clipboard?.writeText(input.value).then(() => UI.toast("Password copied")).catch(() => UI.toast("Select and copy the password manually", "info"));
        break;
      }
      case "reset-demo":
        return UI.confirm({ title: "Reset demo data?", message: "This replaces local demo changes in this browser.", confirmText: "Reset demo data", onConfirm: () => { Store.reset(); UI.toast("Demo data reset"); render(); } });
      case "logout": Auth.logout(); location.href = "login.html"; break;
      case "dashboard": location.href = "dashboard.html"; break;
      case "back": history.length > 1 ? history.back() : location.href = "dashboard.html"; break;
      case "close-modal": UI.closeOverlay?.($(".modal-overlay")); break;
      case "clear-search": query = ""; render(); break;
    }
  }

  document.addEventListener("click", e => {
    const actionEl = e.target.closest("[data-action]");
    if (actionEl) { e.preventDefault(); act(actionEl.dataset.action, actionEl); return; }
    const filter = e.target.closest("[data-filter]");
    if (filter) { activeFilter = filter.dataset.filter; render(); }
  });

  document.addEventListener("input", e => {
    if (e.target.id === "page-search") {
      const pos = e.target.selectionStart;
      query = e.target.value;
      render();
      const next = $("#page-search");
      if (next) { next.focus(); next.setSelectionRange(pos, pos); }
    }
  });

  document.addEventListener("submit", e => {
    if (e.target.id === "settings-form") {
      e.preventDefault();
      const f = e.target;
      const data = Object.fromEntries(new FormData(f).entries());
      const next = { ...(Store.get("settings") || {}) };
      if (location.search.includes("section=payments")) {
        next.payments = Object.fromEntries(["Card", "Bank transfer", "Cash", "Mobile money"].map(m => [m, f.elements[`payment-${m}`]?.checked ?? true]));
      } else if (location.search.includes("section=notifications")) {
        ["emailNotifications", "inAppNotifications", "lowStockAlerts", "orderAlerts"].forEach(k => next[k] = !!f.elements[k]?.checked);
      } else Object.assign(next, data);
      Store.set("settings", next);
      UI.toast("Settings saved");
      render();
    }
    if (e.target.id === "profile-form") {
      e.preventDefault();
      const f = e.target;
      const data = Object.fromEntries(new FormData(f).entries());
      const staff = Auth.currentStaff();
      if (staff) Store.update("staff", staff.id, data);
      UI.toast("Profile updated");
      render();
    }
    if (e.target.id === "prefs-form") {
      e.preventDefault();
      const f = e.target;
      localStorage.setItem("aurelle.profile.preferences", JSON.stringify({ email: !!f.elements.email.checked, inApp: !!f.elements.inApp.checked, theme: f.elements.theme.value }));
      UI.toast("Preferences saved");
    }
  });

  // Ensure a shared shell exists before the controller paints its page.
  const start = () => {
    if (window.AurelleLayout?.mount) AurelleLayout.mount();
    render();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
