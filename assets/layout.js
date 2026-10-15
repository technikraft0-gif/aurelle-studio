/* Aurelle Studio — shared application shell.
   Each authenticated page provides:
     <div id="app-sidebar"></div>
     <div id="app-topbar"></div>
     <main id="app-content"></main>
     <div id="app-mobile-nav"></div>

   Set window.AURELLE_PAGE before loading this script. */

(function () {
  "use strict";

  const PAGE = window.AURELLE_PAGE || {
    key: "dashboard",
    title: "Dashboard",
    subtitle: "A considered view of your store."
  };

  const NAV_GROUPS = [
    {
      label: "Overview",
      items: [
        { key: "dashboard", label: "Dashboard", href: "dashboard.html", icon: "dashboard" }
      ]
    },
    {
      label: "Store",
      items: [
        { key: "products", label: "Products", href: "products.html", icon: "package" },
        { key: "categories", label: "Categories", href: "categories.html", icon: "layers" },
        { key: "orders", label: "Orders", href: "orders.html", icon: "shopping", count: () => Store.list("orders", (o) => o.status === "Pending").length },
        { key: "customers", label: "Customers", href: "customers.html", icon: "users" },
        { key: "inventory", label: "Inventory", href: "inventory.html", icon: "inventory" }
      ]
    },
    {
      label: "Business",
      items: [
        { key: "sales", label: "Sales & finance", href: "sales.html", icon: "chart" },
        { key: "reviews", label: "Reviews", href: "reviews.html", icon: "star" }
      ]
    },
    {
      label: "Manage",
      items: [
        { key: "users", label: "Team & access", href: "users.html", icon: "users" },
        { key: "notifications", label: "Notifications", href: "notifications.html", icon: "bell", count: () => Store.list("notifications", (n) => !n.read).length },
        { key: "settings", label: "Settings", href: "settings.html", icon: "settings" },
        { key: "help", label: "Help & shortcuts", href: "help.html", icon: "help" }
      ]
    }
  ];

  const MOBILE_TABS = [
    { key: "dashboard", label: "Home", href: "dashboard.html", icon: "dashboard" },
    { key: "products", label: "Products", href: "products.html", icon: "package" },
    { key: "orders", label: "Orders", href: "orders.html", icon: "shopping" },
    { key: "more", label: "More", href: "#more", icon: "more" }
  ];

  function allowed(item) {
    return Auth.can(item.key);
  }

  function renderSidebar() {
    const root = document.getElementById("app-sidebar");
    if (!root) return;

    const staff = Auth.currentStaff();
    const role = Auth.currentRole();

    root.innerHTML = `
      <aside class="sidebar" id="aurelle-sidebar" aria-label="Main navigation">
        <div class="flex min-h-[76px] items-center gap-3 border-b border-line px-4">
          <div class="brand-mark flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-espresso font-display text-xl font-semibold text-ivory">A</div>
          <div class="brand-copy min-w-0">
            <div class="font-display text-[22px] font-semibold leading-none tracking-tight">Aurelle</div>
            <div class="mt-1 text-[9px] font-bold uppercase tracking-[.2em] text-espresso-soft">Studio admin</div>
          </div>
          <button type="button" class="icon-btn ml-auto hidden xl:inline-flex" id="sidebar-collapse" aria-label="Collapse sidebar">${UI.icon("menu", 18)}</button>
        </div>

        <div class="sidebar-content py-2">
          ${NAV_GROUPS.map((group) => {
            const items = group.items.filter(allowed);
            if (!items.length) return "";
            return `
              <div class="nav-section-label">${UI.escapeHTML(group.label)}</div>
              ${items.map((item) => {
                const active = PAGE.key === item.key;
                const count = item.count ? item.count() : 0;
                return `
                  <a class="nav-link ${active ? "active" : ""}" href="${item.href}" ${active ? 'aria-current="page"' : ""} title="${UI.escapeHTML(item.label)}">
                    ${UI.icon(item.icon, 19)}
                    <span class="nav-label">${UI.escapeHTML(item.label)}</span>
                    ${count > 0 ? `<span class="nav-count nav-label">${count}</span>` : ""}
                  </a>`;
              }).join("")}`;
          }).join("")}
        </div>

        <div class="border-t border-line p-3">
          <button type="button" id="sidebar-profile" class="sidebar-user flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-white/60" aria-label="Open profile menu">
            <span class="avatar">${UI.escapeHTML(UI.initials(staff?.name))}</span>
            <span class="sidebar-user-copy min-w-0 flex-1">
              <span class="block truncate text-xs font-bold">${UI.escapeHTML(staff?.name || "Team member")}</span>
              <span class="mt-1 block truncate text-[10px] text-espresso-soft">${UI.escapeHTML(role || "")}</span>
            </span>
            ${UI.icon("more", 18)}
          </button>
        </div>
      </aside>
      <button type="button" id="sidebar-mobile-backdrop" class="fixed inset-0 z-30 hidden bg-espresso/30 lg:hidden" aria-label="Close navigation"></button>`;

    const sidebar = root.querySelector("#aurelle-sidebar");
    const collapse = root.querySelector("#sidebar-collapse");

    if (localStorage.getItem("aurelle.sidebar-collapsed") === "true") {
      sidebar.classList.add("collapsed");
      document.querySelector(".main-area")?.classList.add("rail");
    }

    collapse?.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      document.querySelector(".main-area")?.classList.toggle("rail");
      localStorage.setItem("aurelle.sidebar-collapsed", sidebar.classList.contains("collapsed") ? "true" : "false");
    });

    root.querySelector("#sidebar-profile")?.addEventListener("click", (event) => {
      const button = event.currentTarget;
      const items = [
        { label: "My profile", icon: "user", action: () => window.location.href = "profile.html" }
      ];

      if (staff?.role === "Admin") {
        items.push(
          { label: "Preview as role", icon: "users", action: () => openRolePreview() },
          { divider: true },
          { label: `Current preview: ${role}`, icon: "eye", action: () => openRolePreview() }
        );
      }

      items.push(
        { divider: true },
        { label: "Sign out", icon: "logout", danger: true, action: () => Auth.logout() }
      );

      UI.dropdown(button, items);
    });

    root.querySelector("#sidebar-mobile-backdrop")?.addEventListener("click", closeMobileSidebar);
  }

  function renderTopbar() {
    const root = document.getElementById("app-topbar");
    if (!root) return;

    const staff = Auth.currentStaff();
    const unread = Store.list("notifications", (n) => !n.read).length;

    root.innerHTML = `
      <header class="topbar">
        <div class="flex min-w-0 items-center gap-3">
          <button type="button" class="icon-btn lg:hidden" id="mobile-menu-button" aria-label="Open navigation">${UI.icon("menu")}</button>
          <div class="min-w-0">
            <div class="hidden items-center gap-2 text-[10px] text-espresso-soft sm:flex">
              <span>Aurelle Studio</span>${UI.icon("chevronRight", 12)}<span>${UI.escapeHTML(PAGE.title)}</span>
            </div>
            <h1 class="truncate font-display text-2xl font-semibold leading-tight sm:mt-1 sm:text-[28px]">${UI.escapeHTML(PAGE.title)}</h1>
          </div>
        </div>

        <div class="flex flex-shrink-0 items-center gap-1 sm:gap-2">
          <button type="button" id="global-search-button" class="icon-btn" aria-label="Search" title="Search (Ctrl/⌘ K)">${UI.icon("search")}</button>
          <button type="button" id="notifications-button" class="icon-btn relative" aria-label="Notifications">
            ${UI.icon("bell")}
            ${unread ? `<span class="absolute right-1 top-1 h-2 w-2 rounded-full border-2 border-ivory bg-clay"></span>` : ""}
          </button>
          <button type="button" id="topbar-profile-button" class="ml-1 flex items-center gap-2 rounded-full p-1 hover:bg-white/70" aria-label="Open account menu">
            <span class="avatar !h-9 !w-9">${UI.escapeHTML(UI.initials(staff?.name))}</span>
            <span class="hidden max-w-[125px] text-left sm:block">
              <span class="block truncate text-xs font-bold">${UI.escapeHTML(staff?.name || "")}</span>
              <span class="block truncate text-[10px] text-espresso-soft">${UI.escapeHTML(Auth.currentRole() || "")}</span>
            </span>
            <span class="hidden sm:inline">${UI.icon("chevronDown", 15)}</span>
          </button>
        </div>
      </header>`;

    root.querySelector("#global-search-button")?.addEventListener("click", UI.openCommandPalette);
    root.querySelector("#mobile-menu-button")?.addEventListener("click", openMobileSidebar);
    root.querySelector("#notifications-button")?.addEventListener("click", (event) => {
      UI.dropdown(event.currentTarget, [
        {
          label: unread ? `${unread} unread notifications` : "All caught up",
          icon: "bell",
          action: () => window.location.href = "notifications.html"
        },
        {
          label: "View all notifications",
          icon: "arrowUpRight",
          action: () => window.location.href = "notifications.html"
        }
      ]);
    });

    root.querySelector("#topbar-profile-button")?.addEventListener("click", (event) => {
      const staffNow = Auth.currentStaff();
      const roleNow = Auth.currentRole();
      const items = [
        { label: "My profile", icon: "user", action: () => window.location.href = "profile.html" }
      ];

      if (staffNow?.role === "Admin") {
        items.push({ label: `Preview as role (${roleNow})`, icon: "eye", action: () => openRolePreview() });
      }

      items.push(
        { divider: true },
        { label: "Sign out", icon: "logout", danger: true, action: () => Auth.logout() }
      );

      UI.dropdown(event.currentTarget, items);
    });
  }

  function renderMobileNav() {
    const root = document.getElementById("app-mobile-nav");
    if (!root) return;

    const tabs = MOBILE_TABS.map((tab) => {
      if (tab.key === "more") {
        return `<button type="button" class="mobile-tab" id="mobile-more-button">${UI.icon("more", 20)}<span>More</span></button>`;
      }

      if (!Auth.can(tab.key)) return "";

      return `<a href="${tab.href}" class="mobile-tab ${PAGE.key === tab.key ? "active" : ""}" ${PAGE.key === tab.key ? 'aria-current="page"' : ""}>${UI.icon(tab.icon, 20)}<span>${UI.escapeHTML(tab.label)}</span></a>`;
    }).join("");

    root.innerHTML = `
      <nav class="mobile-bottom-nav no-print" aria-label="Mobile navigation">
        ${tabs}
        <button type="button" class="mobile-add-button" id="mobile-add-button" aria-label="Quick add">${UI.icon("plus", 22)}</button>
      </nav>`;

    root.querySelector("#mobile-add-button")?.addEventListener("click", openQuickAdd);
    root.querySelector("#mobile-more-button")?.addEventListener("click", openMoreSheet);
  }

  function openQuickAdd() {
    const actions = [];

    if (Auth.can("products")) {
      actions.push({
        title: "Add product",
        description: "Create a product listing",
        icon: "package",
        href: "product-form.html"
      });
    }

    if (Auth.can("orders")) {
      actions.push({
        title: "New order",
        description: "Create a customer order",
        icon: "shopping",
        href: "orders.html?create=1"
      });
    }

    if (Auth.can("users")) {
      actions.push({
        title: "Add team member",
        description: "Invite or create a staff account",
        icon: "users",
        href: "users.html?create=1"
      });
    }

    if (!actions.length) {
      UI.toast("There are no quick actions available for this role.", "info");
      return;
    }

    const content = actions.map((action) => `
      <a href="${action.href}" class="flex min-h-[68px] items-center gap-3 rounded-xl p-3 hover:bg-ivory">
        <span class="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cream text-clay">${UI.icon(action.icon, 21)}</span>
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-bold">${UI.escapeHTML(action.title)}</span>
          <span class="mt-1 block text-xs text-espresso-soft">${UI.escapeHTML(action.description)}</span>
        </span>
        ${UI.icon("chevronRight", 17)}
      </a>`).join("");

    UI.openSheet({ title: "Quick add", content });
  }

  function openMoreSheet() {
    const pages = NAV_GROUPS.flatMap((group) => group.items).filter(allowed);
    const content = pages.map((item) => `
      <a href="${item.href}" class="flex min-h-[50px] items-center gap-3 rounded-xl px-3 hover:bg-ivory">
        ${UI.icon(item.icon, 19, "text-espresso-soft")}
        <span class="flex-1 text-sm font-semibold">${UI.escapeHTML(item.label)}</span>
        ${UI.icon("chevronRight", 16, "text-espresso-soft")}
      </a>`).join("");

    UI.openSheet({ title: "More pages", content });
  }

  function openRolePreview() {
    const staff = Auth.currentStaff();
    if (staff?.role !== "Admin") {
      UI.toast("Only admins can preview roles.", "error");
      return;
    }

    const current = Auth.currentRole();
    const content = `
      <p class="mb-4 text-sm leading-6 text-espresso-soft">Preview the panel as another role. This changes visible navigation and permission checks for this browser session; it does not change staff account records.</p>
      <div class="space-y-2">
        ${Auth.roles.map((role) => `
          <label class="flex min-h-[60px] cursor-pointer items-center gap-3 rounded-xl border border-line p-3 hover:bg-ivory">
            <input type="radio" name="preview-role" value="${UI.escapeHTML(role)}" ${role === current ? "checked" : ""} class="accent-clay" />
            <span class="flex-1">
              <span class="block text-sm font-bold">${UI.escapeHTML(role)}</span>
              <span class="mt-1 block text-xs text-espresso-soft">${role === "Admin" ? "Full access to every section." : role === "Cashier" ? "Orders, own sales, and view-only inventory." : "Products and stock editing, orders, and customer viewing."}</span>
            </span>
            ${role === current ? '<span class="status status-success">Active</span>' : ""}
          </label>`).join("")}
      </div>
      <p class="mt-4 rounded-xl bg-cream/70 p-3 text-xs leading-5 text-espresso-soft">For a true account change, sign out and sign in with that role’s demo account.</p>`;

    const footer = `
      <button type="button" class="btn btn-secondary" data-role-cancel>Cancel</button>
      <button type="button" class="btn btn-primary" data-role-apply>Apply preview</button>`;

    const modal = UI.openModal({ title: "Preview as role", content, footer });

    modal.element.querySelector("[data-role-cancel]").addEventListener("click", modal.close);
    modal.element.querySelector("[data-role-apply]").addEventListener("click", () => {
      const selected = modal.element.querySelector('input[name="preview-role"]:checked')?.value;
      if (!selected) return;

      const result = Auth.setPreviewRole(selected);
      if (!result.ok) {
        UI.toast(result.message, "error");
        return;
      }

      modal.close();
      UI.toast(`Previewing as ${selected}.`, "success");
      window.setTimeout(() => window.location.reload(), 220);
    });
  }

  function openMobileSidebar() {
    const sidebar = document.getElementById("aurelle-sidebar");
    const backdrop = document.getElementById("sidebar-mobile-backdrop");
    sidebar?.classList.add("mobile-open");
    backdrop?.classList.remove("hidden");
  }

  function closeMobileSidebar() {
    document.getElementById("aurelle-sidebar")?.classList.remove("mobile-open");
    document.getElementById("sidebar-mobile-backdrop")?.classList.add("hidden");
  }

  function mount() {
    if (!Auth.guardPage()) return;

    renderSidebar();
    renderTopbar();
    renderMobileNav();

    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");
      if (link && window.innerWidth < 1024) closeMobileSidebar();
    });

    window.addEventListener("aurelle:role-change", () => window.location.reload());
  }

  window.AurelleLayout = {
    mount,
    openQuickAdd,
    openMoreSheet,
    openRolePreview,
    closeMobileSidebar,
    navGroups: NAV_GROUPS
  };

  document.addEventListener("DOMContentLoaded", mount);
})();