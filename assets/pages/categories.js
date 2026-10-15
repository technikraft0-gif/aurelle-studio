/* Aurelle Studio · Categories and collections */
(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const state = { tab: "categories", categorySearch: "", draggedId: null };
  const safe = value => UI.escapeHTML(value ?? "");
  const canManage = () =>
    Auth.can("categories", "edit") ||
    Auth.can("categories", "manage") ||
    Auth.can("products", "manage");

  const categoryRecords = () => Store.list("categories") || [];
  const collectionRecords = () => Store.list("collections") || [];
  const productRecords = () => Store.list("products") || [];

  function slugify(value) {
    return String(value || "").toLowerCase().trim()
      .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function productsForCategory(category) {
    return productRecords().filter(product =>
      product.categoryId === category.id || product.category === category.name
    ).length;
  }

  function productsForCollection(collection) {
    const ids = collection.productIds || [];
    return productRecords().filter(product => ids.includes(product.id));
  }

  function setTab(tab) {
    state.tab = tab;
    $("#category-view").classList.toggle("hidden", tab !== "categories");
    $("#collection-view").classList.toggle("hidden", tab !== "collections");
    $("#add-category").classList.toggle("hidden", tab !== "categories");
    $("#tab-categories").classList.toggle("is-active", tab === "categories");
    $("#tab-collections").classList.toggle("is-active", tab === "collections");
    $("#tab-categories").setAttribute("aria-selected", String(tab === "categories"));
    $("#tab-collections").setAttribute("aria-selected", String(tab === "collections"));
    render();
  }

  function renderCategoryStats() {
    const categories = categoryRecords();
    const assigned = categories.reduce((sum, category) => sum + productsForCategory(category), 0);
    const uncategorised = productRecords().filter(product =>
      !product.category && !product.categoryId
    ).length;

    $("#category-stats").innerHTML = [
      ["Categories", categories.length, "Organised product groups"],
      ["Assigned products", assigned, "Products linked to a category"],
      ["Uncategorised", uncategorised, "Products to organise"]
    ].map(([label, value, hint]) => `
      <article class="rounded-2xl border border-espresso/10 bg-white p-4 sm:p-5">
        <p class="text-sm text-espresso/60">${safe(label)}</p>
        <p class="mt-2 font-display text-3xl font-semibold tabular-nums">${value}</p>
        <p class="mt-1 text-xs text-espresso/50">${safe(hint)}</p>
      </article>
    `).join("");
  }

  function renderCategories() {
    const query = state.categorySearch.toLowerCase();
    const categories = categoryRecords()
      .filter(category => String(category.name || "").toLowerCase().includes(query))
      .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));

    if (!categories.length) {
      $("#category-list").innerHTML = `
        <div class="px-6 py-14 text-center">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream text-2xl">◇</div>
          <h3 class="mt-4 font-display text-2xl font-semibold">No categories found</h3>
          <p class="mt-2 text-sm text-espresso/60">Create a category to organise your products.</p>
          <button type="button" class="btn-primary mt-5" id="empty-add-category">Add category</button>
        </div>`;
      $("#empty-add-category").addEventListener("click", () => openCategoryEditor());
      renderCategoryStats();
      return;
    }

    $("#category-list").innerHTML = categories.map(category => `
      <article class="category-row flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
        draggable="true" data-category-id="${safe(category.id)}">
        <button type="button" class="drag-handle hidden h-10 w-10 shrink-0 cursor-grab items-center justify-center rounded-xl bg-cream text-espresso/55 sm:flex"
          aria-label="Drag to reorder ${safe(category.name)}" title="Drag to reorder">⠿</button>
        <div class="flex min-w-0 flex-1 items-center gap-3">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cream font-display text-xl font-semibold">
            ${safe((category.name || "?").slice(0, 1).toUpperCase())}
          </div>
          <div class="min-w-0">
            <h3 class="truncate font-semibold">${safe(category.name)}</h3>
            <p class="mt-1 truncate text-xs text-espresso/50">/${safe(category.slug || slugify(category.name))}</p>
            ${category.description ? `<p class="mt-1 line-clamp-1 text-sm text-espresso/60">${safe(category.description)}</p>` : ""}
          </div>
        </div>
        <div class="flex items-center justify-between gap-4 sm:justify-end">
          <div class="text-left sm:text-right">
            <p class="font-semibold tabular-nums">${productsForCategory(category)}</p>
            <p class="text-xs text-espresso/50">products</p>
          </div>
          <span class="rounded-full px-3 py-1 text-xs font-semibold ${category.active === false ? "bg-info-bg text-info" : "bg-success-bg text-success"}">
            ${category.active === false ? "Hidden" : "Active"}
          </span>
          <button type="button" class="icon-button category-edit" data-id="${safe(category.id)}" aria-label="Edit ${safe(category.name)}" title="Edit category">✎</button>
          <button type="button" class="icon-button category-delete" data-id="${safe(category.id)}" aria-label="Delete ${safe(category.name)}" title="Delete category">×</button>
        </div>
      </article>
    `).join("");

    renderCategoryStats();
  }

  function renderCollectionStats() {
    const collections = collectionRecords();
    const active = collections.filter(collection => collection.active !== false).length;
    const featured = collections.filter(collection => collection.featured).length;
    $("#collection-stats").innerHTML = [
      ["Collections", collections.length, "Curated product stories"],
      ["Active", active, "Currently available"],
      ["Featured", featured, "Highlighted collections"]
    ].map(([label, value, hint]) => `
      <article class="rounded-2xl border border-espresso/10 bg-white p-4 sm:p-5">
        <p class="text-sm text-espresso/60">${safe(label)}</p>
        <p class="mt-2 font-display text-3xl font-semibold tabular-nums">${value}</p>
        <p class="mt-1 text-xs text-espresso/50">${safe(hint)}</p>
      </article>
    `).join("");
  }

  function renderCollections() {
    const collections = collectionRecords();

    if (!collections.length) {
      $("#collection-list").innerHTML = `
        <div class="rounded-2xl border border-dashed border-espresso/20 p-8 text-center sm:col-span-2 xl:col-span-3">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream text-2xl">✳</div>
          <h3 class="mt-4 font-display text-2xl font-semibold">Start a collection</h3>
          <p class="mx-auto mt-2 max-w-sm text-sm leading-6 text-espresso/60">
            Bring together pieces for a seasonal edit, occasion, or signature look.
          </p>
          <button id="empty-add-collection" type="button" class="btn-primary mt-5">Create collection</button>
        </div>`;
      $("#empty-add-collection").addEventListener("click", () => openCollectionEditor());
      renderCollectionStats();
      return;
    }

    $("#collection-list").innerHTML = collections.map(collection => {
      const assigned = productsForCollection(collection);
      const cover = collection.image || assigned[0]?.images?.[0] || assigned[0]?.image ||
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80";
      return `
        <article class="overflow-hidden rounded-2xl border border-espresso/10 bg-white">
          <div class="relative aspect-[16/9] bg-cream">
            <img src="${safe(cover)}" alt="${safe(collection.name)} cover"
              class="h-full w-full object-cover" loading="lazy"
              onerror="this.onerror=null;this.src='https://placehold.co/600x338/F7F2EA/2A1F1A?text=Aurelle+Collection';">
            <span class="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold">
              ${collection.active === false ? "Hidden" : "Active"}
            </span>
            ${collection.featured ? `<span class="absolute right-3 top-3 rounded-full bg-espresso px-3 py-1 text-xs font-semibold text-ivory">Featured</span>` : ""}
          </div>
          <div class="p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h3 class="font-display text-2xl font-semibold">${safe(collection.name)}</h3>
                <p class="mt-1 text-xs text-espresso/50">/${safe(collection.slug || slugify(collection.name))}</p>
              </div>
              <span class="rounded-full bg-cream px-3 py-1 text-xs font-semibold tabular-nums">${assigned.length} items</span>
            </div>
            <p class="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-espresso/60">${safe(collection.description || "A curated edit from Aurelle Studio.")}</p>
            <div class="mt-4 flex gap-2 border-t border-espresso/10 pt-3">
              <button type="button" class="btn-secondary flex-1 collection-edit" data-id="${safe(collection.id)}">Edit collection</button>
              <button type="button" class="icon-button collection-delete" data-id="${safe(collection.id)}" aria-label="Delete ${safe(collection.name)}" title="Delete">×</button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    renderCollectionStats();
  }

  function render() {
    if (state.tab === "categories") renderCategories();
    else renderCollections();
  }

  function openEditor({ title, initial = {}, fields, onSave }) {
    const existing = $("#category-editor-overlay");
    existing?.remove();

    const overlay = document.createElement("div");
    overlay.id = "category-editor-overlay";
    overlay.className = "fixed inset-0 z-[100] flex items-end justify-center bg-espresso/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4";
    overlay.innerHTML = `
      <section role="dialog" aria-modal="true" aria-labelledby="editor-title"
        class="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl sm:max-w-xl sm:rounded-2xl sm:p-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 id="editor-title" class="font-display text-3xl font-semibold">${safe(title)}</h2>
            <p class="mt-1 text-sm text-espresso/60">Keep your catalogue clear and consistent.</p>
          </div>
          <button type="button" id="editor-close" class="icon-button" aria-label="Close dialog">×</button>
        </div>
        <form id="category-editor-form" class="mt-6 space-y-4" novalidate>
          ${fields}
          <div class="flex justify-end gap-2 border-t border-espresso/10 pt-4">
            <button type="button" id="editor-cancel" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary">Save changes</button>
          </div>
        </form>
      </section>`;
    document.body.appendChild(overlay);

    Object.entries(initial).forEach(([key, value]) => {
      const field = overlay.querySelector(`[name="${key}"]`);
      if (!field) return;
      if (field.type === "checkbox") field.checked = Boolean(value);
      else field.value = value ?? "";
    });

    const close = () => overlay.remove();
    $("#editor-close", overlay).addEventListener("click", close);
    $("#editor-cancel", overlay).addEventListener("click", close);
    overlay.addEventListener("click", event => {
      if (event.target === overlay) close();
    });
    document.addEventListener("keydown", function escape(event) {
      if (event.key === "Escape" && document.body.contains(overlay)) {
        close();
        document.removeEventListener("keydown", escape);
      }
    });

    const firstInput = $("input:not([type=checkbox]), textarea", overlay);
    firstInput?.focus();

    $("#category-editor-form", overlay).addEventListener("submit", async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const submit = $("button[type=submit]", form);
      const formData = new FormData(form);
      const values = Object.fromEntries(formData.entries());
      form.querySelectorAll('input[type="checkbox"]').forEach(input => {
        values[input.name] = input.checked;
      });

      if (!String(values.name || "").trim()) {
        const name = form.querySelector('[name="name"]');
        name?.setCustomValidity("Enter a name.");
        name?.reportValidity();
        name?.addEventListener("input", () => name.setCustomValidity(""), { once: true });
        return;
      }

      submit.disabled = true;
      submit.textContent = "Saving…";
      try {
        await UI.delay(350);
        await onSave(values);
        close();
      } catch (error) {
        console.error(error);
        UI.toast("Could not save changes.", "error");
      } finally {
        if (document.body.contains(submit)) {
          submit.disabled = false;
          submit.textContent = "Save changes";
        }
      }
    });
  }

  function openCategoryEditor(category = null) {
    if (!canManage()) {
      UI.toast("You don't have access to manage categories.", "error");
      return;
    }

    const fields = `
      <label class="block">
        <span class="field-label">Category name *</span>
        <input class="field-input" name="name" required maxlength="80" placeholder="e.g. Dresses">
      </label>
      <label class="block">
        <span class="field-label">Description</span>
        <textarea class="field-input resize-y" name="description" rows="3" placeholder="A short description of this category"></textarea>
      </label>
      <label class="block">
        <span class="field-label">Slug</span>
        <input class="field-input" name="slug" maxlength="100" placeholder="auto-generated-from-name">
      </label>
      <label class="flex min-h-11 items-center gap-3">
        <input class="h-4 w-4 accent-clay" name="active" type="checkbox" checked>
        <span class="text-sm font-medium">Visible and active</span>
      </label>`;

    openEditor({
      title: category ? "Edit category" : "Add category",
      initial: category || { active: true },
      fields,
      onSave: values => {
        const record = {
          ...(category || {}),
          id: category?.id || Store.makeId("cat"),
          name: values.name.trim(),
          description: values.description.trim(),
          slug: values.slug.trim() || slugify(values.name),
          active: Boolean(values.active),
          sortOrder: category?.sortOrder ?? categoryRecords().length,
          updatedAt: new Date().toISOString()
        };
        if (category) Store.update("categories", category.id, record);
        else Store.create("categories", record);
        UI.toast(category ? "Category updated." : "Category created.");
        render();
      }
    });
  }

  function openCollectionEditor(collection = null) {
    if (!canManage()) {
      UI.toast("You don't have access to manage collections.", "error");
      return;
    }

    const availableProducts = productRecords();
    const selected = new Set(collection?.productIds || []);
    const fields = `
      <label class="block">
        <span class="field-label">Collection name *</span>
        <input class="field-input" name="name" required maxlength="100" placeholder="e.g. The Autumn Edit">
      </label>
      <label class="block">
        <span class="field-label">Description</span>
        <textarea class="field-input resize-y" name="description" rows="3" placeholder="Tell the story behind this edit…"></textarea>
      </label>
      <label class="block">
        <span class="field-label">Slug</span>
        <input class="field-input" name="slug" maxlength="120" placeholder="auto-generated-from-name">
      </label>
      <label class="block">
        <span class="field-label">Cover image URL (optional)</span>
        <input class="field-input" name="image" type="url" placeholder="https://…">
      </label>
      <fieldset>
        <legend class="field-label">Assign products</legend>
        <div class="mt-2 max-h-48 space-y-2 overflow-y-auto rounded-xl border border-espresso/10 p-3">
          ${availableProducts.length ? availableProducts.map(product => `
            <label class="flex min-h-11 items-center gap-3">
              <input class="h-4 w-4 accent-clay" type="checkbox" name="productIds" value="${safe(product.id)}" ${selected.has(product.id) ? "checked" : ""}>
              <span class="min-w-0 flex-1 truncate text-sm">${safe(product.name)}</span>
              <span class="text-xs text-espresso/50">${UI.money(product.price || 0)}</span>
            </label>
          `).join("") : `<p class="text-sm text-espresso/55">Add products before assigning them to a collection.</p>`}
        </div>
      </fieldset>
      <label class="flex min-h-11 items-center gap-3">
        <input class="h-4 w-4 accent-clay" name="active" type="checkbox" checked>
        <span class="text-sm font-medium">Collection is active</span>
      </label>
      <label class="flex min-h-11 items-center gap-3">
        <input class="h-4 w-4 accent-clay" name="featured" type="checkbox">
        <span class="text-sm font-medium">Feature this collection</span>
      </label>`;

    openEditor({
      title: collection ? "Edit collection" : "New collection",
      initial: collection || { active: true, featured: false },
      fields,
      onSave: values => {
        const productIds = $$('input[name="productIds"]:checked', $("#category-editor-overlay"))
          .map(input => input.value);
        const record = {
          ...(collection || {}),
          id: collection?.id || Store.makeId("col"),
          name: values.name.trim(),
          description: values.description.trim(),
          slug: values.slug.trim() || slugify(values.name),
          image: values.image.trim(),
          productIds,
          active: Boolean(values.active),
          featured: Boolean(values.featured),
          updatedAt: new Date().toISOString()
        };
        if (collection) Store.update("collections", collection.id, record);
        else Store.create("collections", record);
        UI.toast(collection ? "Collection updated." : "Collection created.");
        render();
      }
    });
  }

  async function deleteCategory(category) {
    const assignedCount = productsForCategory(category);
    const message = assignedCount
      ? `${assignedCount} product(s) currently use this category. They will remain in your catalogue, but may need to be reassigned.`
      : "This category will be removed from your catalogue.";

    const accepted = await UI.confirm({
      title: `Delete “${category.name}”?`,
      message,
      confirmText: "Delete category",
      danger: true
    });
    if (!accepted) return;

    Store.remove("categories", category.id);
    UI.toast("Category deleted.");
    render();
  }

  async function deleteCollection(collection) {
    const accepted = await UI.confirm({
      title: `Delete “${collection.name}”?`,
      message: "Products in this collection will not be deleted.",
      confirmText: "Delete collection",
      danger: true
    });
    if (!accepted) return;

    Store.remove("collections", collection.id);
    UI.toast("Collection deleted.");
    render();
  }

  function reorderCategories(sourceId, targetId) {
    if (!sourceId || !targetId || sourceId === targetId) return;
    const list = categoryRecords().sort((a, b) =>
      Number(a.sortOrder || 0) - Number(b.sortOrder || 0)
    );
    const from = list.findIndex(category => category.id === sourceId);
    const to = list.findIndex(category => category.id === targetId);
    if (from < 0 || to < 0) return;

    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    list.forEach((category, index) => {
      Store.update("categories", category.id, {
        sortOrder: index,
        updatedAt: new Date().toISOString()
      });
    });
    UI.toast("Category order updated.");
    render();
  }

  function bind() {
    $("#tab-categories").addEventListener("click", () => setTab("categories"));
    $("#tab-collections").addEventListener("click", () => setTab("collections"));
    $("#add-category").addEventListener("click", () => openCategoryEditor());
    $("#add-collection").addEventListener("click", () => openCollectionEditor());
    $("#category-search").addEventListener("input", event => {
      state.categorySearch = event.target.value.trim();
      renderCategories();
    });

    $("#category-list").addEventListener("click", event => {
      const edit = event.target.closest(".category-edit");
      const remove = event.target.closest(".category-delete");
      if (edit) {
        const record = categoryRecords().find(category => category.id === edit.dataset.id);
        if (record) openCategoryEditor(record);
      }
      if (remove) {
        const record = categoryRecords().find(category => category.id === remove.dataset.id);
        if (record) deleteCategory(record);
      }
    });

    $("#collection-list").addEventListener("click", event => {
      const edit = event.target.closest(".collection-edit");
      const remove = event.target.closest(".collection-delete");
      if (edit) {
        const record = collectionRecords().find(collection => collection.id === edit.dataset.id);
        if (record) openCollectionEditor(record);
      }
      if (remove) {
        const record = collectionRecords().find(collection => collection.id === remove.dataset.id);
        if (record) deleteCollection(record);
      }
    });

    $("#category-list").addEventListener("dragstart", event => {
      const row = event.target.closest("[data-category-id]");
      if (!row) return;
      state.draggedId = row.dataset.categoryId;
      row.classList.add("opacity-50");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", state.draggedId);
    });
    $("#category-list").addEventListener("dragend", event => {
      event.target.closest("[data-category-id]")?.classList.remove("opacity-50");
      state.draggedId = null;
    });
    $("#category-list").addEventListener("dragover", event => {
      if (event.target.closest("[data-category-id]")) event.preventDefault();
    });
    $("#category-list").addEventListener("drop", event => {
      event.preventDefault();
      const target = event.target.closest("[data-category-id]");
      if (!target) return;
      const sourceId = state.draggedId || event.dataTransfer.getData("text/plain");
      reorderCategories(sourceId, target.dataset.categoryId);
    });

    window.addEventListener("aurelle:store-change", render);
  }

  function init() {
    AurelleLayout?.mount?.();
    if (Auth.guardPage && !Auth.guardPage("categories")) return;
    bind();
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();