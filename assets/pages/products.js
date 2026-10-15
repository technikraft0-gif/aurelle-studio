/* Aurelle Studio · Products
 * Uses the shared Store, Auth, UI, and AurelleLayout modules.
 */
(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const state = {
    status: "all",
    search: "",
    category: "",
    stock: "",
    sort: "updated",
    page: 1,
    pageSize: 10,
    view: window.matchMedia("(max-width: 767px)").matches ? "grid" : "list",
    selected: new Set()
  };

  const canEdit = () => Auth.can("products", "edit") || Auth.can("products", "manage");
  const canDelete = () => Auth.can("products", "delete") || Auth.can("products", "manage");

  function products() {
    return Store.list("products") || [];
  }

  function categories() {
    return Store.list("categories") || [];
  }

  function stockOf(product) {
    if (Number.isFinite(Number(product.stock))) return Number(product.stock);
    if (Array.isArray(product.variants)) {
      return product.variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0);
    }
    return 0;
  }

  function categoryName(product) {
    const match = categories().find(c =>
      c.id === product.categoryId || c.name === product.category
    );
    return match?.name || product.category || "Uncategorised";
  }

  function productImage(product) {
    return product.images?.[0] || product.image ||
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80";
  }

  function safe(value) {
    return UI.escapeHTML(value ?? "");
  }

  function statusBadge(status) {
    return UI.statusBadge(status || "Draft");
  }

  function filteredProducts() {
    let result = products().filter(product => {
      const text = [
        product.name, product.sku, product.slug,
        ...(Array.isArray(product.tags) ? product.tags : [])
      ].join(" ").toLowerCase();

      const matchesSearch = !state.search || text.includes(state.search.toLowerCase());
      const matchesStatus = state.status === "all" ||
        (product.status || "Draft").toLowerCase() === state.status.toLowerCase();
      const matchesCategory = !state.category ||
        categoryName(product) === state.category;
      const stock = stockOf(product);
      const matchesStock = !state.stock ||
        (state.stock === "out" && stock <= 0) ||
        (state.stock === "low" && stock > 0 && stock <= Number(product.reorderPoint || 5)) ||
        (state.stock === "in" && stock > Number(product.reorderPoint || 5));

      return matchesSearch && matchesStatus && matchesCategory && matchesStock;
    });

    result.sort((a, b) => {
      if (state.sort === "name") return String(a.name).localeCompare(String(b.name));
      if (state.sort === "price-high") return Number(b.price || 0) - Number(a.price || 0);
      if (state.sort === "price-low") return Number(a.price || 0) - Number(b.price || 0);
      if (state.sort === "stock") return stockOf(a) - stockOf(b);
      return new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0);
    });
    return result;
  }

  function renderStats() {
    const all = products();
    const published = all.filter(p => p.status === "Published").length;
    const low = all.filter(p => stockOf(p) > 0 && stockOf(p) <= Number(p.reorderPoint || 5)).length;
    const out = all.filter(p => stockOf(p) <= 0).length;
    const stats = [
      ["Total products", all.length, "Across your catalogue"],
      ["Published", published, "Visible on storefront"],
      ["Low stock", low, "Worth replenishing"],
      ["Out of stock", out, "Unavailable items"]
    ];

    $("#product-stats").innerHTML = stats.map(([label, value, hint]) => `
      <article class="rounded-2xl border border-espresso/10 bg-white p-4 sm:p-5">
        <p class="text-sm text-espresso/60">${safe(label)}</p>
        <p class="mt-2 font-display text-3xl font-semibold tabular-nums">${value}</p>
        <p class="mt-1 text-xs text-espresso/50">${safe(hint)}</p>
      </article>
    `).join("");

    const counts = {
      all: all.length,
      Published: all.filter(p => p.status === "Published").length,
      Draft: all.filter(p => p.status === "Draft").length,
      Archived: all.filter(p => p.status === "Archived").length
    };

    $$("#product-tabs [data-status]").forEach(button => {
      const key = button.dataset.status;
      button.textContent = `${key === "all" ? "All" : key} (${counts[key] || 0})`;
      button.classList.toggle("is-active", state.status === key);
      button.setAttribute("aria-selected", String(state.status === key));
    });
  }

  function renderCategoryOptions() {
    const select = $("#category-filter");
    const current = state.category;
    select.innerHTML = `<option value="">All categories</option>` +
      categories().map(category =>
        `<option value="${safe(category.name)}">${safe(category.name)}</option>`
      ).join("");
    select.value = current;
  }

  function renderProductCard(product) {
    const stock = stockOf(product);
    const low = stock > 0 && stock <= Number(product.reorderPoint || 5);
    const out = stock <= 0;
    const selected = state.selected.has(product.id);

    return `
      <article class="product-card group overflow-hidden rounded-2xl border border-espresso/10 bg-white">
        <div class="relative aspect-[4/3] overflow-hidden bg-cream">
          <img src="${safe(productImage(product))}" alt="${safe(product.name)}"
            class="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/600x450/F7F2EA/2A1F1A?text=Aurelle';">
          <label class="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-sm">
            <input class="product-check h-4 w-4 accent-clay" type="checkbox"
              value="${safe(product.id)}" ${selected ? "checked" : ""}
              aria-label="Select ${safe(product.name)}">
          </label>
          <div class="absolute right-3 top-3">${statusBadge(product.status || "Draft")}</div>
        </div>
        <div class="p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h3 class="truncate font-semibold">${safe(product.name || "Untitled product")}</h3>
              <p class="mt-1 text-xs text-espresso/50">${safe(product.sku || "SKU not assigned")} · ${safe(categoryName(product))}</p>
            </div>
            <p class="shrink-0 font-semibold tabular-nums">${UI.money(product.price || 0)}</p>
          </div>
          <div class="mt-4 flex items-center justify-between border-t border-espresso/10 pt-3">
            <span class="text-sm ${out ? "text-danger" : low ? "text-warning" : "text-espresso/65"}">
              ${out ? "Out of stock" : low ? "Low stock" : "In stock"} · ${stock} units
            </span>
            <div class="flex items-center gap-1">
              ${canEdit() ? `<a class="icon-button" href="product-form.html?id=${encodeURIComponent(product.id)}" aria-label="Edit ${safe(product.name)}" title="Edit">✎</a>` : ""}
              <button class="icon-button product-menu" data-id="${safe(product.id)}"
                type="button" aria-label="Actions for ${safe(product.name)}" title="More actions">•••</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderProductRow(product) {
    const stock = stockOf(product);
    const low = stock > 0 && stock <= Number(product.reorderPoint || 5);
    const out = stock <= 0;
    return `
      <tr class="border-b border-espresso/10 last:border-0">
        <td class="px-4 py-3">
          <input class="product-check h-4 w-4 accent-clay" type="checkbox"
            value="${safe(product.id)}" ${state.selected.has(product.id) ? "checked" : ""}
            aria-label="Select ${safe(product.name)}">
        </td>
        <td class="px-4 py-3">
          <div class="flex min-w-[220px] items-center gap-3">
            <img src="${safe(productImage(product))}" alt="" loading="lazy"
              class="h-12 w-12 rounded-xl bg-cream object-cover"
              onerror="this.onerror=null;this.src='https://placehold.co/100x100/F7F2EA/2A1F1A?text=A';">
            <div class="min-w-0">
              <a class="block truncate font-semibold hover:text-clay"
                href="product-form.html?id=${encodeURIComponent(product.id)}">${safe(product.name)}</a>
              <p class="mt-1 text-xs text-espresso/50">${safe(product.sku || "No SKU")}</p>
            </div>
          </div>
        </td>
        <td class="px-4 py-3 text-sm">${safe(categoryName(product))}</td>
        <td class="px-4 py-3 text-sm font-semibold tabular-nums">${UI.money(product.price || 0)}</td>
        <td class="px-4 py-3">
          <span class="text-sm ${out ? "text-danger" : low ? "text-warning" : ""}">${stock} units</span>
          ${low ? `<span class="mt-1 block text-xs text-warning">Low stock</span>` : ""}
          ${out ? `<span class="mt-1 block text-xs text-danger">Restock needed</span>` : ""}
        </td>
        <td class="px-4 py-3">${statusBadge(product.status || "Draft")}</td>
        <td class="px-4 py-3 text-sm text-espresso/55">${product.updatedAt ? UI.date(product.updatedAt) : "—"}</td>
        <td class="px-4 py-3 text-right">
          <button class="icon-button product-menu" data-id="${safe(product.id)}" type="button"
            aria-label="Actions for ${safe(product.name)}">•••</button>
        </td>
      </tr>
    `;
  }

  function render() {
    const filtered = filteredProducts();
    const totalPages = Math.max(1, Math.ceil(filtered.length / state.pageSize));
    state.page = Math.min(state.page, totalPages);
    const start = (state.page - 1) * state.pageSize;
    const pageItems = filtered.slice(start, start + state.pageSize);
    const host = $("#product-results");

    if (!pageItems.length) {
      host.innerHTML = `
        <div class="px-6 py-16 text-center">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream text-2xl">◇</div>
          <h2 class="mt-4 font-display text-2xl font-semibold">Nothing in this view yet</h2>
          <p class="mx-auto mt-2 max-w-sm text-sm leading-6 text-espresso/60">
            Try another search or filter, or add a new piece to your collection.
          </p>
          <a href="product-form.html" class="btn-primary mt-5">Add a product</a>
        </div>`;
    } else if (state.view === "grid") {
      host.innerHTML = `<div class="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">${pageItems.map(renderProductCard).join("")}</div>`;
    } else {
      host.innerHTML = `
        <div class="hidden md:block">
          <div class="table-scroll">
            <table class="data-table w-full text-left">
              <thead><tr>
                <th class="w-12 px-4 py-3"><input id="select-visible" type="checkbox" class="h-4 w-4 accent-clay" aria-label="Select visible products"></th>
                <th class="px-4 py-3">Product</th><th class="px-4 py-3">Category</th>
                <th class="px-4 py-3">Price</th><th class="px-4 py-3">Stock</th>
                <th class="px-4 py-3">Status</th><th class="px-4 py-3">Updated</th>
                <th class="px-4 py-3 text-right">Actions</th>
              </tr></thead>
              <tbody>${pageItems.map(renderProductRow).join("")}</tbody>
            </table>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-3 p-4 md:hidden">
          ${pageItems.map(renderProductCard).join("")}
        </div>`;
    }

    $("#product-count").textContent = filtered.length
      ? `Showing ${start + 1}–${Math.min(start + state.pageSize, filtered.length)} of ${filtered.length} products`
      : "0 products";
    $("#page-number").textContent = `${state.page} / ${totalPages}`;
    $("#prev-page").disabled = state.page <= 1;
    $("#next-page").disabled = state.page >= totalPages;
    $("#bulk-bar").classList.toggle("hidden", state.selected.size === 0);
    $("#bulk-count").textContent = `${state.selected.size} selected`;

    const selectVisible = $("#select-visible");
    if (selectVisible) {
      selectVisible.checked = pageItems.length > 0 && pageItems.every(p => state.selected.has(p.id));
      selectVisible.indeterminate = pageItems.some(p => state.selected.has(p.id)) && !selectVisible.checked;
    }
    renderStats();
  }

  async function confirmDelete(product) {
    const accepted = await UI.confirm({
      title: "Delete this product?",
      message: `“${product.name}” will be removed from the catalogue. This action can be undone only if your app's undo flow supports it.`,
      confirmText: "Delete product",
      danger: true
    });
    if (!accepted) return;
    Store.remove("products", product.id);
    state.selected.delete(product.id);
    UI.toast("Product deleted.", "success");
    render();
  }

  function duplicate(product) {
    const copy = {
      ...product,
      id: Store.makeId("prd"),
      name: `${product.name} (copy)`,
      slug: `${product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-copy`,
      sku: `${product.sku || "AUR"}-COPY`,
      status: "Draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    Store.create("products", copy);
    UI.toast("Product duplicated as a draft.");
    render();
  }

  function openActions(button) {
    const product = products().find(p => p.id === button.dataset.id);
    if (!product) return;
    const items = [
      ...(canEdit() ? [{ label: "Edit product", onClick: () => location.href = `product-form.html?id=${encodeURIComponent(product.id)}` }] : []),
      { label: "Duplicate", onClick: () => duplicate(product) },
      { label: product.status === "Published" ? "Move to draft" : "Publish", onClick: () => {
        if (!canEdit()) return UI.toast("You don't have access to edit products.", "error");
        Store.update("products", product.id, {
          status: product.status === "Published" ? "Draft" : "Published",
          updatedAt: new Date().toISOString()
        });
        UI.toast(product.status === "Published" ? "Product moved to drafts." : "Product published.");
        render();
      }},
      ...(canDelete() ? [{ label: "Delete", danger: true, onClick: () => confirmDelete(product) }] : [])
    ];
    UI.dropdown(button, items);
  }

  function bulkUpdate(status) {
    if (!canEdit()) return UI.toast("You don't have access to edit products.", "error");
    const ids = [...state.selected];
    ids.forEach(id => Store.update("products", id, { status, updatedAt: new Date().toISOString() }));
    state.selected.clear();
    UI.toast(`${ids.length} product${ids.length === 1 ? "" : "s"} updated.`);
    render();
  }

  async function bulkDelete() {
    if (!canDelete()) return UI.toast("You don't have access to delete products.", "error");
    const ids = [...state.selected];
    const accepted = await UI.confirm({
      title: `Delete ${ids.length} products?`,
      message: "Selected products will be removed from your catalogue.",
      confirmText: "Delete selected",
      danger: true
    });
    if (!accepted) return;
    ids.forEach(id => Store.remove("products", id));
    state.selected.clear();
    UI.toast(`${ids.length} products deleted.`);
    render();
  }

  function bind() {
    $("#product-search").addEventListener("input", e => {
      state.search = e.target.value.trim();
      state.page = 1;
      render();
    });
    $("#category-filter").addEventListener("change", e => {
      state.category = e.target.value; state.page = 1; render();
    });
    $("#stock-filter").addEventListener("change", e => {
      state.stock = e.target.value; state.page = 1; render();
    });
    $("#product-sort").addEventListener("change", e => {
      state.sort = e.target.value; render();
    });
    $("#product-tabs").addEventListener("click", e => {
      const button = e.target.closest("[data-status]");
      if (!button) return;
      state.status = button.dataset.status; state.page = 1; render();
    });
    $("#view-grid").addEventListener("click", () => { state.view = "grid"; render(); });
    $("#view-list").addEventListener("click", () => { state.view = "list"; render(); });
    $("#page-size").addEventListener("change", e => {
      state.pageSize = Number(e.target.value); state.page = 1; render();
    });
    $("#prev-page").addEventListener("click", () => { state.page--; render(); });
    $("#next-page").addEventListener("click", () => { state.page++; render(); });
    $("#product-results").addEventListener("change", e => {
      if (e.target.matches(".product-check")) {
        if (e.target.checked) state.selected.add(e.target.value);
        else state.selected.delete(e.target.value);
        render();
      }
      if (e.target.matches("#select-visible")) {
        filteredProducts().slice((state.page - 1) * state.pageSize, state.page * state.pageSize)
          .forEach(p => e.target.checked ? state.selected.add(p.id) : state.selected.delete(p.id));
        render();
      }
    });
    $("#product-results").addEventListener("click", e => {
      const button = e.target.closest(".product-menu");
      if (button) openActions(button);
    });
    $("#bulk-publish").addEventListener("click", () => bulkUpdate("Published"));
    $("#bulk-draft").addEventListener("click", () => bulkUpdate("Draft"));
    $("#bulk-delete").addEventListener("click", bulkDelete);
    $("#bulk-clear").addEventListener("click", () => { state.selected.clear(); render(); });
    $("#export-products").addEventListener("click", () => {
      const rows = filteredProducts().map(p => ({
        name: p.name, sku: p.sku, category: categoryName(p),
        price: p.price, stock: stockOf(p), status: p.status
      }));
      UI.csvDownload("aurelle-products.csv", rows);
    });
    window.addEventListener("aurelle:store-change", render);
  }

  function init() {
    if (window.AurelleLayout?.mount) AurelleLayout.mount();
    if (Auth.guardPage && !Auth.guardPage("products")) return;
    renderCategoryOptions();
    bind();
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();