/* Aurelle Studio — demo authentication and role guards.
   This is a front-end demo, not production security. */

(function () {
  "use strict";

  const SESSION_KEY = "aurelle.session";
  const PREVIEW_KEY = "aurelle.preview-role";

  const ROLE_DEFAULTS = {
    Admin: {
      dashboard: true,
      products: true,
      orders: true,
      customers: true,
      users: true,
      inventory: true,
      sales: true,
      categories: true,
      reviews: true,
      notifications: true,
      settings: true,
      profile: true,
      help: true
    },
    Cashier: {
      dashboard: true,
      products: false,
      orders: true,
      customers: false,
      users: false,
      inventory: true,
      sales: true,
      categories: false,
      reviews: false,
      notifications: true,
      settings: false,
      profile: true,
      help: true
    },
    "Sales Attendant": {
      dashboard: true,
      products: true,
      orders: true,
      customers: true,
      users: false,
      inventory: false,
      sales: false,
      categories: false,
      reviews: false,
      notifications: true,
      settings: false,
      profile: true,
      help: true
    }
  };

  const ROUTES = {
    "dashboard.html": "dashboard",
    "products.html": "products",
    "product-form.html": "products",
    "orders.html": "orders",
    "customers.html": "customers",
    "users.html": "users",
    "inventory.html": "inventory",
    "sales.html": "sales",
    "categories.html": "categories",
    "reviews.html": "reviews",
    "notifications.html": "notifications",
    "settings.html": "settings",
    "profile.html": "profile",
    "help.html": "help"
  };

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch (_) {
      return null;
    }
  }

  function saveSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function getStaffByEmail(email) {
    const normalized = String(email || "").trim().toLowerCase();
    return Store.list("staff").find(
      (person) => String(person.email).toLowerCase() === normalized
    );
  }

  function login(email, password, remember = true) {
    const staff = getStaffByEmail(email);

    if (!staff || staff.password !== password) {
      return {
        ok: false,
        message: "The email or password you entered isn't correct."
      };
    }

    if (staff.status !== "Active") {
      return {
        ok: false,
        message: "This account isn't active. Please contact an administrator."
      };
    }

    const session = {
      staffId: staff.id,
      email: staff.email,
      signedInAt: new Date().toISOString(),
      remember: Boolean(remember)
    };

    saveSession(session);
    localStorage.removeItem(PREVIEW_KEY);

    Store.update("staff", staff.id, {
      lastActiveAt: new Date().toISOString()
    });

    logActivity(staff, "Signed in", "Admin panel");
    return { ok: true, staff: publicStaff(staff) };
  }

  function publicStaff(staff) {
    if (!staff) return null;
    const safe = { ...staff };
    delete safe.password;
    return safe;
  }

  function currentStaff() {
    const session = getSession();
    if (!session) return null;

    const staff = Store.list("staff").find((person) => person.id === session.staffId);
    if (!staff || staff.status !== "Active") return null;

    return publicStaff(staff);
  }

  function currentRole() {
    const staff = currentStaff();
    if (!staff) return null;

    const preview = localStorage.getItem(PREVIEW_KEY);
    return staff.role === "Admin" && preview ? preview : staff.role;
  }

  function permissionsFor(role) {
    const baseline = ROLE_DEFAULTS[role] || {};
    const stored = Store.get("rolePermissions", null);

    if (!stored || !stored[role]) return { ...baseline };
    return { ...baseline, ...stored[role] };
  }

  function can(permission) {
    const role = currentRole();
    if (!role) return false;

    const permissions = permissionsFor(role);
    return Boolean(permissions[permission]);
  }

  function setPreviewRole(role) {
    const staff = currentStaff();
    if (!staff || staff.role !== "Admin") {
      return { ok: false, message: "Only an admin can preview other roles." };
    }

    if (!ROLE_DEFAULTS[role]) {
      return { ok: false, message: "That role is not recognised." };
    }

    if (role === staff.role) {
      localStorage.removeItem(PREVIEW_KEY);
    } else {
      localStorage.setItem(PREVIEW_KEY, role);
    }

    window.dispatchEvent(new CustomEvent("aurelle:role-change", {
      detail: { role: currentRole() }
    }));

    return { ok: true, role: currentRole() };
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(PREVIEW_KEY);
    window.location.href = "login.html";
  }

  function logActivity(staff, action, target) {
    try {
      Store.create("activity", {
        actorId: staff.id,
        actorName: staff.name,
        action,
        target: target || "",
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.warn("Activity log could not be saved.", error);
    }
  }

  function guardPage() {
    const file = window.location.pathname.split("/").pop() || "dashboard.html";

    if (file === "login.html") {
      if (currentStaff()) window.location.replace("dashboard.html");
      return true;
    }

    const staff = currentStaff();
    if (!staff) {
      window.location.replace("login.html");
      return false;
    }

    const permission = ROUTES[file];
    if (permission && !can(permission)) {
      window.location.replace(`404.html?reason=access&from=${encodeURIComponent(file)}`);
      return false;
    }

    return true;
  }

  window.Auth = {
    login,
    logout,
    getSession,
    currentStaff,
    currentRole,
    can,
    permissionsFor,
    setPreviewRole,
    guardPage,
    logActivity,
    roles: Object.keys(ROLE_DEFAULTS),
    roleDefaults: ROLE_DEFAULTS,
    routes: ROUTES
  };
})();