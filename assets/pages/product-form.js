/* Aurelle Studio · Product editor */
(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const params = new URLSearchParams(location.search);
  const productId = params.get("id");
  const editing = Boolean(productId);
  const MAX_IMAGES = 6;
  const MAX_BYTES = 3 * 1024 * 1024;

  let original = null;
  let images = [];
  let dirty = false;
  let manuallyEditedSlug = false;

  const slugify = value => String(value || "")
    .toLowerCase().trim().normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const safe = value => UI.escapeHTML(value ?? "");

  function getStock(product) {
    if (Number.isFinite(Number(product?.stock))) return Number(product.stock);
    return (product?.variants || []).reduce((sum, variant) => sum + Number(variant.stock || 0), 0);
  }

  function allProducts() {
    return Store.list("products") || [];
  }

  function loadCategories() {
    const select = $("#product-category");
    const categories = Store.list("categories") || [];
    select.innerHTML = `<option value="">Choose a category</option>` +
      categories.map(c => `<option value="${safe(c.name)}">${safe(c.name)}</option>`).join("");
  }

  function setField(id, value) {
    const field = $("#" + id);
    if (field) field.value = value ?? "";
  }

  function checkedValues(selector) {
    return $$(selector + " input:checked").map(input => input.value);
  }

  function setCheckedValues(selector, values = []) {
    const selected = new Set(values);
    $$(selector + " input[type=checkbox]").forEach(input => {
      input.checked = selected.has(input.value);
    });
  }

  function markDirty() {
    dirty = true;
    $("#form-status").textContent = "Unsaved changes";
  }

  function setSaved() {
    dirty = false;
    $("#form-status").textContent = "All changes saved";
  }

  function fillForm(product) {
    setField("product-name", product.name);
    setField("product-slug", product.slug);
    setField("product-description", product.description);
    setField("product-price", product.price);
    setField("product-compare", product.compareAtPrice);
    setField("product-sku", product.sku);
    setField("product-category", product.category);
    setField("product-tags", (product.tags || []).join(", "));
    setField("product-stock", getStock(product));
    setField("product-reorder", product.reorderPoint ?? 5);
    setField("product-material", product.material);
    setField("product-weight", product.weight);
    setField("product-care", product.care);
    setField("product-status", product.status || "Draft");
    setField("product-schedule", product.scheduledAt ? product.scheduledAt.slice(0, 16) : "");
    setCheckedValues("#size-options", product.sizes || []);
    setCheckedValues("#color-options", product.colors || []);
    images = [...(product.images || (product.image ? [product.image] : []))];
    renderImages();
    updatePreview();
    $("#meta-created").textContent = product.createdAt ? UI.date(product.createdAt) : "—";
    $("#meta-updated").textContent = product.updatedAt ? UI.date(product.updatedAt) : "—";
  }

  function updatePreview() {
    const name = $("#product-name").value.trim() || "Your product name";
    const description = $("#product-description").value.trim() || "Your product description will appear here.";
    const category = $("#product-category").value || "New collection";
    const price = Number($("#product-price").value || 0);

    $("#preview-name").textContent = name;
    $("#preview-description").textContent = description;
    $("#preview-category").textContent = category;
    $("#preview-price").textContent = UI.money(price);
    $("#preview-image").src = images[0] ||
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=500&q=80";

    const status = $("#product-status").value;
    $("#visibility-note").textContent = status === "Published"
      ? "Published products can appear on your storefront."
      : status === "Archived"
        ? "Archived products are hidden from normal storefront browsing."
        : "Drafts are visible only to your team.";
  }

  function renderImages() {
    $("#image-preview-list").innerHTML = images.map((src, index) => `
      <article class="relative overflow-hidden rounded-xl border border-espresso/10 bg-cream"
        draggable="true" data-image-index="${index}">
        <img src="${safe(src)}" alt="Product image ${index + 1}" class="aspect-[4/5] w-full object-cover">
        <div class="flex items-center justify-between gap-2 p-2">
          <button type="button" class="text-xs font-semibold ${index === 0 ? "text-clay" : "text-espresso/60"}" data-cover="${index}">
            ${index === 0 ? "Cover image" : "Set as cover"}
          </button>
          <button type="button" class="text-xs font-semibold text-danger" data-remove-image="${index}" aria-label="Remove image ${index + 1}">Remove</button>
        </div>
        <span class="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[10px] font-semibold">${index + 1}/${MAX_IMAGES}</span>
      </article>
    `).join("");

    updatePreview();
  }

  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
      reader.readAsDataURL(file);
    });
  }

  async function addFiles(fileList) {
    const files = [...fileList];
    $("#image-error").textContent = "";

    for (const file of files) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        $("#image-error").textContent = `${file.name}: use JPG, PNG, or WebP.`;
        continue;
      }
      if (file.size > MAX_BYTES) {
        $("#image-error").textContent = `${file.name}: the maximum file size is 3 MB.`;
        continue;
      }
      if (images.length >= MAX_IMAGES) {
        $("#image-error").textContent = `You can add up to ${MAX_IMAGES} images.`;
        break;
      }
      try {
        images.push(await readFile(file));
      } catch (error) {
        $("#image-error").textContent = error.message;
      }
    }
    renderImages();
    markDirty();
  }

  function validate() {
    let valid = true;
    $$("[data-error]").forEach(el => el.textContent = "");

    if (!$("#product-name").value.trim()) {
      $('[data-error="name"]').textContent = "Enter a product name.";
      valid = false;
    }
    const price = Number($("#product-price").value);
    if ($("#product-price").value === "" || !Number.isFinite(price) || price < 0) {
      $('[data-error="price"]').textContent = "Enter a valid price.";
      valid = false;
    }
    if (!$("#product-sku").value.trim()) {
      $("#product-sku").value = suggestSku();
    }
    return valid;
  }

  function suggestSku() {
    const stem = slugify($("#product-name").value).replace(/-/g, "").slice(0, 5).toUpperCase() || "AUR";
    const suffix = String(Date.now()).slice(-5);
    return `AUR-${stem}-${suffix}`;
  }

  function collect(statusOverride) {
    const name = $("#product-name").value.trim();
    const now = new Date().toISOString();
    const stock = Math.max(0, Number($("#product-stock").value || 0));
    return {
      ...(original || {}),
      id: original?.id || Store.makeId("prd"),
      name,
      slug: $("#product-slug").value.trim() || slugify(name),
      description: $("#product-description").value.trim(),
      price: Number($("#product-price").value || 0),
      compareAtPrice: $("#product-compare").value === "" ? null : Number($("#product-compare").value),
      sku: $("#product-sku").value.trim() || suggestSku(),
      category: $("#product-category").value,
      tags: $("#product-tags").value.split(",").map(tag => tag.trim()).filter(Boolean),
      sizes: checkedValues("#size-options"),
      colors: checkedValues("#color-options"),
      stock,
      reorderPoint: Math.max(0, Number($("#product-reorder").value || 0)),
      material: $("#product-material").value.trim(),
      weight: $("#product-weight").value === "" ? null : Number($("#product-weight").value),
      care: $("#product-care").value.trim(),
      images: [...images],
      image: images[0] || "",
      status: statusOverride || $("#product-status").value,
      scheduledAt: $("#product-schedule").value
        ? new Date($("#product-schedule").value).toISOString()
        : null,
      createdAt: original?.createdAt || now,
      updatedAt: now
    };
  }

  async function save(statusOverride) {
    if (!Auth.can("products", "edit") && !Auth.can("products", "manage")) {
      UI.toast("You don't have access to edit products.", "error");
      return false;
    }
    if (!validate()) {
      UI.toast("Please fix the highlighted fields.", "error");
      return false;
    }

    const button = statusOverride === "Draft" ? $("#save-draft") : $("#publish-product");
    const previousLabel = button.textContent;
    button.disabled = true;
    button.textContent = "Saving…";

    try {
      await UI.delay(380);
      const record = collect(statusOverride);
      if (original) {
        Store.update("products", original.id, record);
      } else {
        Store.create("products", record);
        original = record;
        history.replaceState(null, "", `product-form.html?id=${encodeURIComponent(record.id)}`);
      }
      fillForm(record);
      setSaved();
      $("#form-title").textContent = "Edit product";
      $("#delete-product").classList.remove("hidden");
      UI.toast(record.status === "Published" ? "Product published." : "Product saved.");
      return true;
    } catch (error) {
      console.error(error);
      UI.toast("Could not save the product. Please try again.", "error");
      return false;
    } finally {
      button.disabled = false;
      button.textContent = previousLabel;
    }
  }

  async function deleteCurrent() {
    if (!original) return;
    if (!Auth.can("products", "delete") && !Auth.can("products", "manage")) {
      UI.toast("You don't have access to delete products.", "error");
      return;
    }
    const accepted = await UI.confirm({
      title: "Delete this product?",
      message: `This removes “${original.name}” from the catalogue.`,
      confirmText: "Delete product",
      danger: true
    });
    if (!accepted) return;
    Store.remove("products", original.id);
    UI.toast("Product deleted.");
    location.href = "products.html";
  }

  async function duplicateCurrent() {
    if (!original) {
      UI.toast("Save this product before duplicating it.", "info");
      return;
    }
    const copy = {
      ...original,
      id: Store.makeId("prd"),
      name: `${original.name} (copy)`,
      slug: `${original.slug}-copy`,
      sku: `${original.sku}-COPY`,
      status: "Draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    Store.create("products", copy);
    UI.toast("Duplicate created as a draft.");
    location.href = `product-form.html?id=${encodeURIComponent(copy.id)}`;
  }

  function bind() {
    $("#product-form").addEventListener("input", event => {
      if (event.target.id === "product-name" && !manuallyEditedSlug) {
        $("#product-slug").value = slugify(event.target.value);
      }
      updatePreview();
      markDirty();
    });

    $("#product-slug").addEventListener("input", () => {
      manuallyEditedSlug = true;
    });

    $("#product-status").addEventListener("change", updatePreview);
    $("#product-category").addEventListener("change", updatePreview);
    $("#product-images").addEventListener("change", async event => {
      await addFiles(event.target.files);
      event.target.value = "";
    });

    const dropzone = $("#image-dropzone");
    ["dragenter", "dragover"].forEach(name => dropzone.addEventListener(name, event => {
      event.preventDefault();
      dropzone.classList.add("border-clay", "bg-cream");
    }));
    ["dragleave", "drop"].forEach(name => dropzone.addEventListener(name, event => {
      event.preventDefault();
      dropzone.classList.remove("border-clay", "bg-cream");
    }));
    dropzone.addEventListener("drop", event => addFiles(event.dataTransfer.files));

    $("#image-preview-list").addEventListener("click", event => {
      const cover = event.target.closest("[data-cover]");
      const remove = event.target.closest("[data-remove-image]");
      if (cover) {
        const index = Number(cover.dataset.cover);
        images.unshift(images.splice(index, 1)[0]);
        renderImages();
        markDirty();
      }
      if (remove) {
        images.splice(Number(remove.dataset.removeImage), 1);
        renderImages();
        markDirty();
      }
    });

    let dragIndex = null;
    $("#image-preview-list").addEventListener("dragstart", event => {
      const card = event.target.closest("[data-image-index]");
      if (!card) return;
      dragIndex = Number(card.dataset.imageIndex);
      event.dataTransfer.effectAllowed = "move";
    });
    $("#image-preview-list").addEventListener("dragover", event => event.preventDefault());
    $("#image-preview-list").addEventListener("drop", event => {
      event.preventDefault();
      const card = event.target.closest("[data-image-index]");
      if (!card || dragIndex === null) return;
      const targetIndex = Number(card.dataset.imageIndex);
      const [moved] = images.splice(dragIndex, 1);
      images.splice(targetIndex, 0, moved);
      dragIndex = null;
      renderImages();
      markDirty();
    });

    $("#save-draft").addEventListener("click", () => save("Draft"));
    $("#product-form").addEventListener("submit", async event => {
      event.preventDefault();
      await save("Published");
    });
    $("#delete-product").addEventListener("click", deleteCurrent);
    $("#duplicate-product").addEventListener("click", duplicateCurrent);

    window.addEventListener("beforeunload", event => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    });
  }

  function init() {
    AurelleLayout?.mount?.();
    if (Auth.guardPage && !Auth.guardPage("products")) return;
    loadCategories();

    if (editing) {
      original = allProducts().find(product => String(product.id) === String(productId));
      if (!original) {
        UI.toast("That product could not be found.", "error");
        location.replace("products.html");
        return;
      }
      fillForm(original);
      $("#form-title").textContent = "Edit product";
      $("#publish-product").textContent = original.status === "Published" ? "Update product" : "Publish";
      $("#delete-product").classList.remove("hidden");
      setSaved();
    } else {
      setField("product-sku", suggestSku());
      setSaved();
    }

    bind();
    updatePreview();
  }

  document.addEventListener("DOMContentLoaded", init);
})();