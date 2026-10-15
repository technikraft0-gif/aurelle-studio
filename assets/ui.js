/* Aurelle Studio — shared interaction utilities.
   Includes SVG icons, formatting, toast, modal, drawer, bottom sheet,
   dropdown, CSV export, and command palette. */

(function () {
  "use strict";

  const ICONS = {
    dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    package: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 8 9 5 9-5"/><path d="M3 8v9l9 5 9-5V8"/><path d="M12 13v9"/>',
    shopping: '<path d="M6 7h12l1 14H5L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    inventory: '<path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z"/><path d="M4.5 7.8 12 12l7.5-4.2"/><path d="M12 12v9"/><path d="m8 5.3 8 4.5"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 14 4-4 4 3 6-7"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 16 9 5 9-5"/>',
    star: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.6-.9l-1.7.7-1.4-2.4L7.5 15a7 7 0 0 1 0-1.9l-1.4-1.2 1.4-2.4 1.7.7a8 8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.6.9l1.7-.7 1.4 2.4-1.4 1.2a7 7 0 0 1-.1 1.9Z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    arrowUpRight: '<path d="M7 17 17 7M7 7h10v10"/>',
    arrowDownRight: '<path d="M7 7 17 17M7 17h10V7"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    close: '<path d="m18 6-12 12M6 6l12 12"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    alert: '<path d="M12 3 2.8 19h18.4L12 3Z"/><path d="M12 9v4M12 16h.01"/>',
    logout: '<path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4.1 1.9c-1.1.9-1.6 1.3-1.6 2.6M12 17h.01"/>',
    filter: '<path d="M4 7h16M7 12h10M10 17h4"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5"/><path d="M4 17v4h16v-4"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    edit: '<path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
    arrowLeft: '<path d="m15 18-6-6 6-6M9 12h12"/>',
    refresh: '<path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M5.5 9a7 7 0 0 1 12-2L20 12M4 12l2.5 5a7 7 0 0 0 12-2"/>',
    wallet: '<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 8h18M16 14h2"/>',
    truck: '<path d="M3 5h11v12H3zM14 9h4l3 4v4h-7"/><circle cx="7" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    sparkles: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"/><path d="m19 14 1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14Z"/>'
  };

  function icon(name, size = 20, extraClass = "") {
    const content = ICONS[name] || ICONS.sparkles;
    return `<svg aria-hidden="true" class="${extraClass}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${content}</svg>`;
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function money(value, currency) {
    const configured = currency || Store.get("settings", {}).currency || "NGN";
    try {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: configured,
        maximumFractionDigits: 0
      }).format(Number(value || 0));
    } catch (_) {
      return `₦${Math.round(Number(value || 0)).toLocaleString("en-NG")}`;
    }
  }

  function number(value) {
    return new Intl.NumberFormat("en-NG").format(Number(value || 0));
  }

  function date(value, options) {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return new Intl.DateTimeFormat("en-NG", options || {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(parsed);
  }

  function relativeDate(value) {
    if (!value) return "Never";
    const difference = Date.now() - new Date(value).getTime();
    if (!Number.isFinite(difference)) return "—";

    const minutes = Math.floor(difference / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;

    return date(value, { day: "numeric", month: "short" });
  }

  function initials(name) {
    return String(name || "?")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0] || "")
      .join("")
      .toUpperCase();
  }

  function statusClass(status) {
    const value = String(status || "").toLowerCase();
    if (["published", "delivered", "active", "paid", "approved", "success"].includes(value)) return "status-success";
    if (["pending", "processing", "draft", "invited", "low stock"].includes(value)) return "status-warning";
    if (["cancelled", "refunded", "suspended", "archived", "out of stock"].includes(value)) return "status-danger";
    if (["shipped", "in transit"].includes(value)) return "status-clay";
    return "status-info";
  }

  function statusBadge(status) {
    return `<span class="status ${statusClass(status)}">${escapeHTML(status || "Unknown")}</span>`;
  }

  function toast(message, type = "success", options = {}) {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      container.setAttribute("aria-live", "polite");
      container.setAttribute("aria-atomic", "false");
      document.body.appendChild(container);
    }

    const toastEl = document.createElement("div");
    toastEl.className = "toast";
    const symbols = { success: "✓", error: "!", info: "i", warning: "!" };
    const backgrounds = {
      success: "#E3EEE5",
      error: "#F6DFDB",
      info: "#ECE6DE",
      warning: "#F6EBCF"
    };
    const colors = {
      success: "#365E40",
      error: "#8E382F",
      info: "#5E5047",
      warning: "#785719"
    };

    toastEl.innerHTML = `
      <span class="toast-icon" style="background:${backgrounds[type] || backgrounds.success};color:${colors[type] || colors.success}">${symbols[type] || "✓"}</span>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold">${escapeHTML(message)}</p>
        ${options.undo ? `<button type="button" class="mt-2 text-xs font-bold text-clay underline" data-toast-undo>Undo</button>` : ""}
      </div>
      <button type="button" class="icon-btn !h-7 !w-7" aria-label="Dismiss notification">${icon("close", 15)}</button>`;

    const dismiss = () => toastEl.remove();
    toastEl.querySelector("button[aria-label]")?.addEventListener("click", dismiss);

    if (options.undo && typeof options.undo === "function") {
      toastEl.querySelector("[data-toast-undo]")?.addEventListener("click", () => {
        options.undo();
        dismiss();
      });
    }

    container.appendChild(toastEl);
    window.setTimeout(dismiss, options.duration || 4200);
    return { dismiss };
  }

  function delay(ms = 380) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function closeOverlay(element) {
    if (!element) return;
    element.remove();
    document.body.style.overflow = "";
  }

  function overlayKeyHandler(event) {
    if (event.key === "Escape") {
      const overlay = document.querySelector("[data-aurelle-overlay]");
      if (overlay) closeOverlay(overlay);
    }
  }

  function openModal({ title = "", content = "", footer = "", onClose, width = "520px" } = {}) {
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.dataset.aurelleOverlay = "true";
    backdrop.setAttribute("role", "presentation");
    backdrop.innerHTML = `
      <section class="modal-panel" role="dialog" aria-modal="true" aria-label="${escapeHTML(title)}" style="width:min(${width},100%)">
        <header class="flex items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
          <h2 class="font-display text-2xl font-semibold">${escapeHTML(title)}</h2>
          <button type="button" class="icon-btn" data-overlay-close aria-label="Close dialog">${icon("close")}</button>
        </header>
        <div class="p-5 sm:p-6">${content}</div>
        ${footer ? `<footer class="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-4 sm:px-6">${footer}</footer>` : ""}
      </section>`;

    document.body.appendChild(backdrop);
    document.body.style.overflow = "hidden";

    const close = () => {
      closeOverlay(backdrop);
      document.removeEventListener("keydown", overlayKeyHandler);
      if (typeof onClose === "function") onClose();
    };

    backdrop.querySelectorAll("[data-overlay-close]").forEach((button) => {
      button.addEventListener("click", close);
    });

    backdrop.addEventListener("mousedown", (event) => {
      if (event.target === backdrop) close();
    });

    document.addEventListener("keydown", overlayKeyHandler);
    backdrop.querySelector("input, button, select, textarea")?.focus();

    return { element: backdrop, close };
  }

  function confirm({ title = "Are you sure?", message = "This action cannot be undone.", confirmText = "Confirm", danger = true, requireText = "" } = {}) {
    return new Promise((resolve) => {
      const confirmId = `confirm-${Math.random().toString(36).slice(2, 9)}`;
      const content = `
        <p class="text-sm leading-6 text-espresso-soft">${escapeHTML(message)}</p>
        ${requireText ? `
          <label class="mt-5 block">
            <span class="field-label">Type <strong>${escapeHTML(requireText)}</strong> to confirm</span>
            <input id="${confirmId}" class="field" autocomplete="off" />
          </label>` : ""}`;

      const footer = `
        <button type="button" class="btn btn-secondary" data-cancel>Cancel</button>
        <button type="button" class="btn ${danger ? "bg-danger text-white hover:opacity-90" : "btn-primary"}" data-confirm>${escapeHTML(confirmText)}</button>`;

      const modal = openModal({ title, content, footer });
      const action = modal.element.querySelector("[data-confirm]");
      const input = modal.element.querySelector(`#${confirmId}`);

      if (requireText) {
        action.disabled = true;
        input.addEventListener("input", () => {
          action.disabled = input.value !== requireText;
        });
      }

      modal.element.querySelector("[data-cancel]").addEventListener("click", () => {
        modal.close();
        resolve(false);
      });

      action.addEventListener("click", () => {
        modal.close();
        resolve(true);
      });
    });
  }

  function openDrawer({ title = "", content = "", footer = "", onClose } = {}) {
    const backdrop = document.createElement("div");
    backdrop.className = "sheet-backdrop";
    backdrop.dataset.aurelleOverlay = "true";
    backdrop.style.padding = "0";
    backdrop.style.justifyContent = "flex-end";
    backdrop.innerHTML = `
      <aside class="drawer-panel" role="dialog" aria-modal="true" aria-label="${escapeHTML(title)}">
        <header class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-white px-5 py-4">
          <h2 class="font-display text-2xl font-semibold">${escapeHTML(title)}</h2>
          <button type="button" class="icon-btn" data-overlay-close aria-label="Close panel">${icon("close")}</button>
        </header>
        <div class="p-5">${content}</div>
        ${footer ? `<footer class="sticky bottom-0 border-t border-line bg-white p-4">${footer}</footer>` : ""}
      </aside>`;

    document.body.appendChild(backdrop);
    document.body.style.overflow = "hidden";

    const close = () => {
      closeOverlay(backdrop);
      document.removeEventListener("keydown", overlayKeyHandler);
      if (typeof onClose === "function") onClose();
    };

    backdrop.querySelector("[data-overlay-close]").addEventListener("click", close);
    backdrop.addEventListener("mousedown", (event) => {
      if (event.target === backdrop) close();
    });
    document.addEventListener("keydown", overlayKeyHandler);

    return { element: backdrop, close };
  }

  function openSheet({ title = "", content = "", footer = "" } = {}) {
    const backdrop = document.createElement("div");
    backdrop.className = "sheet-backdrop";
    backdrop.dataset.aurelleOverlay = "true";
    backdrop.innerHTML = `
      <section class="mobile-sheet" role="dialog" aria-modal="true" aria-label="${escapeHTML(title)}">
        <div class="sheet-handle"></div>
        <header class="mb-4 flex items-center justify-between gap-3">
          <h2 class="font-display text-2xl font-semibold">${escapeHTML(title)}</h2>
          <button type="button" class="icon-btn" data-overlay-close aria-label="Close sheet">${icon("close")}</button>
        </header>
        <div>${content}</div>
        ${footer ? `<footer class="mt-5 border-t border-line pt-4">${footer}</footer>` : ""}
      </section>`;

    document.body.appendChild(backdrop);
    document.body.style.overflow = "hidden";

    const close = () => {
      closeOverlay(backdrop);
      document.removeEventListener("keydown", overlayKeyHandler);
    };

    backdrop.querySelector("[data-overlay-close]").addEventListener("click", close);
    backdrop.addEventListener("mousedown", (event) => {
      if (event.target === backdrop) close();
    });
    document.addEventListener("keydown", overlayKeyHandler);

    return { element: backdrop, close };
  }

  function dropdown(anchor, items) {
    document.querySelectorAll("[data-aurelle-dropdown]").forEach((el) => el.remove());

    const menu = document.createElement("div");
    menu.className = "dropdown-panel";
    menu.dataset.aurelleDropdown = "true";
    menu.setAttribute("role", "menu");

    menu.innerHTML = items.map((item, index) => {
      if (item.divider) return '<div class="my-1 border-t border-line"></div>';

      return `
        <button type="button" role="menuitem" class="dropdown-item ${item.danger ? "text-danger" : ""}" data-menu-index="${index}" ${item.disabled ? "disabled" : ""}>
          ${item.icon ? icon(item.icon, 17) : ""}
          <span>${escapeHTML(item.label)}</span>
          ${item.hint ? `<span class="ml-auto text-[10px] text-espresso-soft">${escapeHTML(item.hint)}</span>` : ""}
        </button>`;
    }).join("");

    const wrapper = anchor.closest("[data-dropdown-wrap]") || anchor.parentElement;
    if (getComputedStyle(wrapper).position === "static") wrapper.style.position = "relative";
    wrapper.appendChild(menu);

    menu.querySelectorAll("[data-menu-index]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = items[Number(button.dataset.menuIndex)];
        menu.remove();
        if (item && typeof item.action === "function") item.action();
      });
    });

    const outside = (event) => {
      if (!menu.contains(event.target) && !anchor.contains(event.target)) {
        menu.remove();
        document.removeEventListener("pointerdown", outside);
      }
    };

    window.setTimeout(() => document.addEventListener("pointerdown", outside), 0);
    return menu;
  }

  function csvDownload(filename, rows) {
    const list = Array.isArray(rows) ? rows : [];
    if (!list.length) {
      toast("There is no data to export.", "info");
      return;
    }

    const columns = [...new Set(list.flatMap((row) => Object.keys(row)))];
    const quote = (value) => {
      const str = value == null ? "" : String(value);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const csv = [
      columns.map(quote).join(","),
      ...list.map((row) => columns.map((column) => quote(row[column])).join(","))
    ].join("\r\n");

    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast("Your CSV export is ready.", "success");
  }

  function openCommandPalette() {
    document.querySelector("[data-command-overlay]")?.remove();

    const overlay = document.createElement("div");
    overlay.className = "command-backdrop";
    overlay.dataset.commandOverlay = "true";
    overlay.innerHTML = `
      <section class="command-panel" role="dialog" aria-modal="true" aria-label="Search Aurelle">
        <div class="flex items-center gap-3 border-b border-line px-4">
          ${icon("search", 20, "text-espresso-soft")}
          <input type="search" class="min-h-[58px] flex-1 border-0 bg-transparent text-base outline-none" placeholder="Search products, orders, people..." aria-label="Search products, orders and people" data-command-input />
          <kbd class="rounded-md border border-line bg-ivory px-2 py-1 text-[10px] text-espresso-soft">ESC</kbd>
        </div>
        <div class="max-h-[55vh] overflow-y-auto p-2" data-command-results>
          <p class="px-3 py-5 text-sm text-espresso-soft">Start typing to search your store.</p>
        </div>
        <div class="border-t border-line px-4 py-3 text-[10px] text-espresso-soft">Search across products, orders and customers</div>
      </section>`;

    document.body.appendChild(overlay);
    const input = overlay.querySelector("[data-command-input]");
    const results = overlay.querySelector("[data-command-results]");
    input.focus();

    const navigate = (href) => {
      overlay.remove();
      window.location.href = href;
    };

    function runSearch() {
      const query = input.value.trim().toLowerCase();
      if (!query) {
        results.innerHTML = '<p class="px-3 py-5 text-sm text-espresso-soft">Start typing to search your store.</p>';
        return;
      }

      const found = [];

      if (Auth.can("products")) {
        Store.list("products", (p) => `${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(query))
          .slice(0, 5)
          .forEach((p) => found.push({
            title: p.name,
            subtitle: `${p.sku} · ${p.category}`,
            type: "Product",
            href: `product-form.html?id=${encodeURIComponent(p.id)}`
          }));
      }

      if (Auth.can("orders")) {
        Store.list("orders", (o) => `${o.id} ${o.customerName} ${o.status}`.toLowerCase().includes(query))
          .slice(0, 5)
          .forEach((o) => found.push({
            title: o.id,
            subtitle: `${o.customerName} · ${money(o.total)}`,
            type: "Order",
            href: `orders.html?id=${encodeURIComponent(o.id)}`
          }));
      }

      if (Auth.can("customers")) {
        Store.list("customers", (c) => `${c.name} ${c.email}`.toLowerCase().includes(query))
          .slice(0, 5)
          .forEach((c) => found.push({
            title: c.name,
            subtitle: c.email,
            type: "Customer",
            href: `customers.html?id=${encodeURIComponent(c.id)}`
          }));
      }

      if (!found.length) {
        results.innerHTML = '<div class="empty-state"><div class="font-display text-xl">No matches found</div><p class="mt-2 text-sm text-espresso-soft">Try another name, SKU or order number.</p></div>';
        return;
      }

      results.innerHTML = found.map((item, index) => `
        <button class="command-result" type="button" data-result="${index}">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cream">${icon(item.type === "Product" ? "package" : item.type === "Order" ? "shopping" : "user", 18)}</span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-semibold">${escapeHTML(item.title)}</span>
            <span class="block truncate text-xs text-espresso-soft">${escapeHTML(item.subtitle)}</span>
          </span>
          <span class="command-type">${escapeHTML(item.type)}</span>
        </button>`).join("");

      results.querySelectorAll("[data-result]").forEach((button) => {
        button.addEventListener("click", () => navigate(found[Number(button.dataset.result)].href));
      });
    }

    input.addEventListener("input", runSearch);
    overlay.addEventListener("mousedown", (event) => {
      if (event.target === overlay) overlay.remove();
    });
    overlay.addEventListener("keydown", (event) => {
      if (event.key === "Escape") overlay.remove();
      if (event.key === "ArrowDown") {
        event.preventDefault();
        results.querySelector("button")?.focus();
      }
    });
    results.addEventListener("keydown", (event) => {
      const buttons = [...results.querySelectorAll("button")];
      const index = buttons.indexOf(document.activeElement);
      if (event.key === "ArrowDown") {
        event.preventDefault();
        buttons[Math.min(index + 1, buttons.length - 1)]?.focus();
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (index <= 0) input.focus();
        else buttons[index - 1]?.focus();
      }
      if (event.key === "Escape") overlay.remove();
    });
  }

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openCommandPalette();
    }
  });

  window.UI = {
    icon,
    escapeHTML,
    money,
    number,
    date,
    relativeDate,
    initials,
    statusClass,
    statusBadge,
    toast,
    delay,
    confirm,
    openModal,
    openDrawer,
    openSheet,
    dropdown,
    csvDownload,
    openCommandPalette
  };
})();