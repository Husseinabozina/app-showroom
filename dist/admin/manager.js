import {
  REPOSITORY,
  SITE,
  clone,
  newProject,
  slugify,
  validateCatalog,
  GitHubClient,
  kinds,
  statuses,
  sources,
  engagements,
  bytesBase64,
} from "./core.js?v=01e75bb944";
const $ = (s) => document.querySelector(s),
  esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
let catalog = [],
  baseline = [],
  catalogSha = "",
  client = null,
  selected = -1,
  uploads = new Map(),
  publishedPreviews = new Map(),
  busy = false,
  publishedSha = "",
  pollTimer = null;
const imageURL = (src) =>
  uploads.get("dist/" + src)?.preview ||
  publishedPreviews.get("dist/" + src)?.preview ||
  new URL("../" + src, location.href).href;
const changed = (p) => {
  const saved = baseline.find((b) => b.slug === p.slug);
  return (
    !saved ||
    JSON.stringify({ ...newProject(p.order), ...p }) !==
      JSON.stringify({ ...newProject(saved.order), ...saved })
  );
};
const manualSlugs = new WeakSet();
const changes = () => catalog.filter(changed);
function showMessage(text, error = false) {
  $("#message").hidden = false;
  $("#message").textContent = text;
  $("#message").classList.toggle("error", error);
}
function countChanges() {
  const count = changes().length;
  $("#change-count").textContent = count
    ? `${count} مشاريع بها تغييرات${uploads.size ? ` · ${uploads.size} صور جديدة` : ""}`
    : "لا توجد تغييرات";
  $("#publish").disabled = busy || !count;
  $("#add-project").disabled = busy;
  $("#disconnect").disabled = busy;
  $("#connect-open").disabled = busy;
  $(".project-list-panel").inert = busy;
  $("#editor-panel").inert = busy;
}
function renderList() {
  const q = $("#search-catalog").value.trim().toLowerCase();
  $("#catalog-count").textContent = catalog.length;
  $("#project-list").replaceChildren();
  catalog.forEach((p, i) => {
    if (
      q &&
      ![p.name, p.slug, ...(p.aliases || [])]
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
      return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "project-item" + (selected === i ? " active" : "");
    b.setAttribute("aria-pressed", String(selected === i));
    const image = p.screens?.[0];
    b.innerHTML = `${image ? `<img src="${esc(imageURL(image.src))}" alt="" loading="lazy">` : '<span class="item-no-image" aria-hidden="true">＋</span>'}<span><strong>${esc(p.name || "مشروع جديد")}${changed(p) ? '<i class="change-dot" aria-label="تغييرات غير منشورة"></i>' : ""}</strong><small>${p.visible ? "ظاهر" : "مسودة مخفية"}${p.featured ? " · Featured" : ""} · ترتيب ${p.order}</small></span>`;
    b.addEventListener("click", () => selectProject(i));
    $("#project-list").append(b);
  });
  countChanges();
}
function field(
  key,
  label,
  { type = "text", wide = false, help = "", direction = "auto", rows = 3 } = {},
) {
  const p = catalog[selected],
    value = Array.isArray(p[key]) ? p[key].join("\n") : (p[key] ?? "");
  return `<label class="field ${wide ? "wide" : ""}">${label}${type === "textarea" ? `<textarea name="${key}" dir="${direction}" rows="${rows}">${esc(value)}</textarea>` : `<input name="${key}" type="${type}" value="${esc(value)}" dir="${direction}" ${type === "number" ? 'min="0" step="1"' : ""} ${key === "slug" && baseline.some((b) => b.slug === p.slug) ? "readonly" : ""}>`}${help ? `<small>${help}</small>` : ""}</label>`;
}
function select(key, label, values) {
  const p = catalog[selected];
  return `<label class="field">${label}<select name="${key}">${values.map((value) => `<option value="${esc(value)}" ${p[key] === value ? "selected" : ""}>${esc(value)}</option>`).join("")}</select></label>`;
}
function section(title, html, button = "") {
  return `<section class="form-section"><div class="section-title"><h3>${title}</h3>${button}</div>${html}</section>`;
}
function selectProject(i) {
  if (busy) return;
  selected = i;
  const p = catalog[i];
  for (const [key, val] of Object.entries(newProject(p.order)))
    if (p[key] === undefined) p[key] = clone(val);
  renderList();
  renderEditor();
  if (matchMedia("(max-width: 750px)").matches)
    $("#editor-panel").scrollIntoView({ behavior: "smooth", block: "start" });
}
function renderEditor() {
  if (selected < 0) return;
  const p = catalog[selected];
  $("#editor-panel").innerHTML =
    `<div class="editor-top"><div><h2>${esc(p.name || "مشروع جديد")}</h2><small>${p.visible ? "يظهر للزوار بعد الحفظ والنشر" : "مسودة مخفية عن الزوار"}</small></div><div>${baseline.some((b) => b.slug === p.slug) ? '<button type="button" id="revert-project">استعادة المحفوظ</button>' : '<button type="button" id="remove-new">إلغاء المشروع الجديد</button>'}</div></div><form id="project-form" novalidate>${section("المنتج والعرض", `<div class="toggles"><label><input name="visible" type="checkbox" ${p.visible ? "checked" : ""}>ظاهر في المعرض</label><label><input name="featured" type="checkbox" ${p.featured ? "checked" : ""}>Featured</label></div><div class="field-grid">${field("name", "اسم المشروع")}${field("slug", "رابط المشروع", { direction: "ltr", help: "حروف إنجليزية صغيرة؛ يثبت بعد أول نشر." })}${field("category", "المجال", { help: "مثل Commerce أو Healthcare." })}${field("order", "ترتيب العرض", { type: "number" })}${select("status", "حالة المنتج", statuses)}${select("source", "إتاحة كود التطبيق", sources)}${select("engagement", "نوع العمل", engagements)}${field("verifiedAt", "تاريخ مراجعة المعلومات", { type: "date" })}${field("headline", "عنوان قصة المشروع", { wide: true })}${field("teaser", "الوصف القصير في المعرض", { type: "textarea", wide: true, rows: 2 })}${field("summary", "ما هو المنتج؟", { type: "textarea", wide: true })}${field("color", "لون مساحة العرض", { type: "color" })}${field("ink", "لون النص", { type: "color" })}</div>`)}${section("دورك وحدود المسؤولية", `<div class="field-grid">${field("role", "مسمى دورك", { wide: true })}${field("roleDetail", "تفاصيل دورك الشخصي", { type: "textarea", wide: true })}${field("contributions", "ما الذي بنيته أو ساهمت فيه؟", { type: "textarea", wide: true, rows: 5, help: "كل مساهمة في سطر مستقل." })}${field("boundary", "حدود المسؤولية وحالة النسخة", { type: "textarea", wide: true, help: "اذكر ما هو تجريبي، وما الذي نفذه فريق آخر، وأي حدود مهمة." })}</div>`)}${section("تدفقات المنتج", '<div id="flows-rows"></div>', '<button type="button" data-add="flows">＋ إضافة تدفق</button>')}${section("التحديات والقرارات الهندسية", '<div id="engineering-rows"></div>', '<button type="button" data-add="engineering">＋ إضافة نقطة</button>')}${section("الصور", `<div id="screens-rows"></div><label class="upload-zone">＋ ارفع صور المشروع من جهازك<small class="helper" style="display:block">PNG أو JPEG أو WebP؛ تُجهّز الصور للعرض تلقائيًا. ترتيب الصور هو ترتيب المعرض.</small><input type="file" id="upload-images" accept="image/png,image/jpeg,image/webp" multiple></label><p class="helper" id="upload-progress"></p>`)}${section("الفيديو", `<div class="field-grid"><label class="field wide">رابط فيديو MP4<textarea name="video-src" dir="ltr" rows="2" placeholder="https://…">${esc(p.video?.src || "")}</textarea><small>ارفع الفيديو على استضافتك أو استخدم رابط الملف المباشر. اتركه فارغًا إن لم يتوفر فيديو.</small></label><label class="field wide">وصف الفيديو<textarea name="video-caption" rows="2" dir="auto">${esc(p.video?.caption || "")}</textarea></label></div>`)}${section("الروابط والأدلة", `<div id="links-rows"></div><div class="field-grid">${field("evidence", "روابط مصادر المعلومات", { type: "textarea", wide: true, direction: "ltr", help: "رابط HTTPS في كل سطر. مطلوب للمشروع الظاهر؛ يمكنك استخدام رابط المتجر أو العرض أو الريبو." })}${field("aliases", "الأسماء البديلة وأسماء الريبو", { type: "textarea", wide: true, rows: 2, help: "اسم واحد في كل سطر؛ تُستخدم في البحث." })}</div>`, '<button type="button" data-add="links">＋ إضافة رابط</button>')}${section("معاينة بطاقة المشروع", '<div id="card-preview"></div>')}<div class="editor-foot"><button type="button" id="stage-project" class="primary">مراجعة وحفظ في المسودة</button><span>التغييرات لا تظهر للزوار حتى تضغط حفظ ونشر.</span></div></form>`;
  renderRows();
  renderPreview();
  $("#project-form").addEventListener("submit", (e) => e.preventDefault());
  $("#project-form").addEventListener("input", (e) => updateField(e.target));
  $("#project-form").addEventListener("change", (e) => {
    if (e.target.id === "upload-images") uploadImages(e.target.files);
    else updateField(e.target);
  });
  $("#project-form").addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) {
      const key = add.dataset.add;
      p[key].push(
        key === "links" ? { label: "", url: "", kind: "proof" } : ["", ""],
      );
      renderRows();
      renderList();
    }
    const action = e.target.closest("[data-row-action]");
    if (action) {
      const key = action.dataset.group,
        index = Number(action.dataset.index),
        arr = p[key];
      if (action.dataset.rowAction === "remove") {
        const item = arr.splice(index, 1)[0];
        if (key === "screens") discardUpload(item.src);
      } else {
        const j = index + (action.dataset.rowAction === "up" ? -1 : 1);
        if (j >= 0 && j < arr.length)
          [arr[index], arr[j]] = [arr[j], arr[index]];
      }
      renderRows();
      renderList();
      renderPreview();
    }
  });
  $("#stage-project").addEventListener("click", () => {
    const errors = validateCatalog([p], uploads);
    showMessage(
      errors.length
        ? errors.join("\n")
        : "المشروع جاهز في المسودة. اضغط «حفظ ونشر التغييرات» لإرساله للموقع.",
      !!errors.length,
    );
  });
  $("#revert-project")?.addEventListener("click", () => {
    if (
      !confirm(
        "استعادة هذا المشروع من آخر نسخة محمّلة؟ سيتم إلغاء تعديلاتك غير المنشورة عليه.",
      )
    )
      return;
    for (const s of p.screens) discardUpload(s.src);
    catalog[selected] = clone(baseline.find((b) => b.slug === p.slug));
    selectProject(selected);
  });
  $("#remove-new")?.addEventListener("click", () => {
    if (!confirm("إلغاء المشروع الجديد من المسودة؟")) return;
    for (const s of p.screens) discardUpload(s.src);
    catalog.splice(selected, 1);
    selected = -1;
    renderList();
    $("#editor-panel").innerHTML =
      '<div class="editor-empty"><h2>اختر مشروعًا آخر</h2></div>';
  });
}
function updateField(input) {
  if (!input.name && !input.dataset.group) return;
  const p = catalog[selected];
  if (input.dataset.group) {
    const row = p[input.dataset.group][Number(input.dataset.index)];
    row[input.dataset.key] = input.value;
  } else if (input.name.startsWith("video-")) {
    const src = $('[name="video-src"]').value.trim(),
      caption = $('[name="video-caption"]').value.trim();
    if (src || caption) p.video = { src, caption };
    else delete p.video;
  } else {
    if (input.name === "slug") manualSlugs.add(p);
    p[input.name] =
      input.type === "checkbox"
        ? input.checked
        : input.name === "order"
          ? Number(input.value)
          : ["contributions", "aliases", "evidence"].includes(input.name)
            ? input.value
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean)
            : input.value;
    if (
      input.name === "name" &&
      !baseline.some((b) => b.slug === p.slug) &&
      !manualSlugs.has(p)
    ) {
      p.slug = slugify(input.value);
      $('[name="slug"]').value = p.slug;
    }
    if (input.name === "visible" && !p.visible) {
      p.featured = false;
      $('[name="featured"]').checked = false;
    }
    if (input.name === "featured" && p.featured) {
      p.visible = true;
      $('[name="visible"]').checked = true;
    }
  }
  $(".editor-top h2").textContent = p.name || "مشروع جديد";
  renderList();
  renderPreview();
}
const tools = (group, index) =>
  `<div class="row-tools"><button type="button" data-group="${group}" data-index="${index}" data-row-action="up" aria-label="تحريك العنصر ${index + 1} لأعلى">↑</button><button type="button" data-group="${group}" data-index="${index}" data-row-action="down" aria-label="تحريك العنصر ${index + 1} لأسفل">↓</button><button type="button" data-group="${group}" data-index="${index}" data-row-action="remove">إزالة</button></div>`;
function rowInput(
  group,
  index,
  key,
  label,
  value,
  { textarea = false, ltr = false } = {},
) {
  const attrs = `data-group="${group}" data-index="${index}" data-key="${key}" dir="${ltr ? "ltr" : "auto"}"`;
  return `<label class="field">${label}${textarea ? `<textarea ${attrs} rows="3">${esc(value)}</textarea>` : `<input ${attrs} value="${esc(value)}">`}</label>`;
}
function renderRows() {
  const p = catalog[selected];
  for (const group of ["flows", "engineering"])
    $(`#${group}-rows`).innerHTML = p[group]
      .map(
        (row, i) =>
          `<div class="list-row"><div class="row-head"><span>النقطة ${i + 1}</span>${tools(group, i)}</div><div class="field-grid">${rowInput(group, i, "0", "العنوان", row[0])}${rowInput(group, i, "1", "الوصف", row[1], { textarea: true })}</div></div>`,
      )
      .join("");
  $("#links-rows").innerHTML = p.links
    .map(
      (l, i) =>
        `<div class="list-row"><div class="row-head"><span>الرابط ${i + 1}</span>${tools("links", i)}</div><div class="field-grid">${rowInput("links", i, "label", "اسم الرابط", l.label)}<label class="field">نوع الرابط<select data-group="links" data-index="${i}" data-key="kind">${Object.entries(
          kinds,
        )
          .map(
            ([k, v]) =>
              `<option value="${k}" ${l.kind === k ? "selected" : ""}>${v}</option>`,
          )
          .join(
            "",
          )}</select></label><div class="wide">${rowInput("links", i, "url", "الرابط", l.url, { ltr: true })}</div></div></div>`,
    )
    .join("");
  $("#screens-rows").innerHTML = p.screens
    .map(
      (s, i) =>
        `<div class="list-row"><div class="row-head"><span>الصورة ${i + 1}${uploads.has("dist/" + s.src) ? " · جديدة" : ""}</span>${tools("screens", i)}</div><div class="screen-edit"><img src="${esc(imageURL(s.src))}" alt="${esc(s.alt)}"><div class="screen-fields">${rowInput("screens", i, "caption", "عنوان الصورة", s.caption)}${rowInput("screens", i, "alt", "وصف الصورة لقارئ الشاشة", s.alt)}</div></div></div>`,
    )
    .join("");
}
function renderPreview() {
  const p = catalog[selected];
  if (!p) return;
  const color = /^#[\da-f]{6}$/i.test(p.color) ? p.color : "#e2e8cf",
    ink = /^#[\da-f]{6}$/i.test(p.ink) ? p.ink : "#19251f";
  $("#card-preview").innerHTML =
    `<div class="preview-card" style="background:${color};color:${ink}"><div><h3 dir="auto">${esc(p.name || "اسم المشروع")}</h3><p dir="auto">${esc(p.teaser || "وصف المشروع القصير سيظهر هنا.")}</p><div class="preview-tags"><span>${esc(p.status)}</span><span>${esc(p.source)}</span></div></div>${p.screens[0] ? `<img src="${esc(imageURL(p.screens[0].src))}" alt="${esc(p.screens[0].alt)}">` : ""}</div>`;
}
function discardUpload(src) {
  const item = uploads.get("dist/" + src);
  if (item) {
    URL.revokeObjectURL(item.preview);
    uploads.delete("dist/" + src);
  }
}
async function prepareImage(file) {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
    throw new Error("الصيغ المقبولة PNG أو JPEG أو WebP.");
  if (file.size > 25 * 1024 * 1024)
    throw new Error("الصورة الأصلية تتجاوز 25 ميجابايت.");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 900 / bitmap.width, 1800 / bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.88),
  );
  if (!blob) throw new Error("تعذر تجهيز الصورة.");
  return {
    bytes: new Uint8Array(await blob.arrayBuffer()),
    preview: URL.createObjectURL(blob),
  };
}
async function uploadImages(files) {
  const p = catalog[selected];
  if (!p.slug || !/^[a-z][a-z0-9-]{0,69}$/.test(p.slug)) {
    showMessage("اكتب رابط المشروع بحروف إنجليزية قبل رفع الصور.", true);
    return;
  }
  busy = true;
  countChanges();
  $("#upload-images").disabled = true;
  try {
    if (p.screens.length + files.length > 30)
      throw new Error("الحد الأقصى 30 صورة لكل مشروع.");
    for (const file of files) {
      $("#upload-progress").textContent = `تجهيز ${file.name}…`;
      const prepared = await prepareImage(file);
      const src = `assets/${p.slug}/screen-${crypto.randomUUID()}.webp`;
      uploads.set("dist/" + src, prepared);
      const caption = file.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ");
      p.screens.push({ src, caption, alt: `${p.name} — ${caption}` });
    }
    $("#upload-progress").textContent =
      "الصور جاهزة في المسودة. ستُرفع عند الحفظ والنشر.";
    renderRows();
    renderPreview();
    renderList();
  } catch (e) {
    showMessage(e.message, true);
  } finally {
    busy = false;
    countChanges();
    $("#upload-images").disabled = false;
    $("#upload-images").value = "";
  }
}
$("#search-catalog").addEventListener("input", renderList);
$("#add-project").addEventListener("click", () => {
  catalog.push(
    newProject(Math.max(0, ...catalog.map((p) => p.order || 0)) + 1),
  );
  selectProject(catalog.length - 1);
  $("#editor-panel").scrollIntoView({ behavior: "smooth", block: "start" });
});
$("#connect-open").addEventListener("click", () =>
  $("#connect-dialog").showModal(),
);
$("#connect-close").addEventListener("click", () =>
  $("#connect-dialog").close(),
);
$("#connect-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  $("#connect-error").hidden = true;
  $("#connect-submit").disabled = true;
  const token = $("#github-token").value.trim();
  $("#github-token").value = "";
  const candidate = new GitHubClient(token);
  try {
    const remote = await candidate.connect();
    if (changes().length) {
      if (
        (catalogSha && catalogSha !== remote.catalogSha) ||
        (!catalogSha &&
          JSON.stringify(baseline) !== JSON.stringify(remote.catalog))
      )
        throw new Error(
          "آخر نسخة في GitHub تختلف عن مسودتك. نزّل المسودة أولًا ثم أعد تحميل الصفحة واتصل قبل استيرادها.",
        );
    } else {
      catalog = clone(remote.catalog);
      baseline = clone(remote.catalog);
      selected = -1;
    }
    catalogSha = remote.catalogSha;
    client?.disconnect();
    client = candidate;
    $("#connection-state").textContent = `متصل: ${remote.login}`;
    $("#connect-open").hidden = true;
    $("#disconnect").hidden = false;
    $("#connect-dialog").close();
    renderList();
    if (selected >= 0) renderEditor();
    showMessage("تم الاتصال. تقدر تحفظ وتنشر تغييراتك من الموقع.");
  } catch (e) {
    candidate.disconnect();
    $("#connect-error").hidden = false;
    $("#connect-error").textContent = e.message;
  } finally {
    $("#connect-submit").disabled = false;
  }
});
$("#disconnect").addEventListener("click", () => {
  client?.disconnect();
  client = null;
  $("#connect-open").hidden = false;
  $("#disconnect").hidden = true;
  $("#connection-state").textContent = "الاتصال مغلق";
  clearTimeout(pollTimer);
  showMessage(
    "تم قطع الاتصال. مسودتك تظل في الصفحة حتى تقفلها أو تعيد تحميلها.",
  );
});
$("#publish").addEventListener("click", () => {
  if (!client) {
    $("#connect-dialog").showModal();
    return;
  }
  const errors = validateCatalog(catalog, uploads);
  if (errors.length) {
    showMessage(errors.join("\n"), true);
    $("#message").scrollIntoView({ behavior: "smooth" });
    return;
  }
  $("#publish-summary").innerHTML =
    changes()
      .map(
        (p) =>
          `<div class="summary-row"><b>${esc(p.name)}</b><small>${p.visible ? "ظاهر" : "مخفي"}${p.featured ? " · Featured" : ""} · ترتيب ${p.order}</small></div>`,
      )
      .join("") + `<p>${uploads.size} صور جديدة ستُرفع.</p>`;
  $("#publish-dialog").showModal();
});
for (const id of ["publish-close", "publish-cancel"])
  $("#" + id).addEventListener("click", () => $("#publish-dialog").close());
$("#publish-confirm").addEventListener("click", async () => {
  if (busy || !client) return;
  busy = true;
  const snapshot = clone(catalog),
    files = new Map(uploads);
  $("#publish-confirm").disabled = true;
  $("#publish-close").disabled = true;
  $("#publish-cancel").disabled = true;
  $("#publish-dialog").addEventListener("cancel", preventCancel);
  $("#project-form")
    ?.querySelectorAll("input,textarea,select,button")
    .forEach((e) => (e.disabled = true));
  countChanges();
  try {
    const result = await client.publish(
      snapshot,
      files,
      catalogSha,
      showMessage,
    );
    publishedSha = result.sha;
    catalog = clone(snapshot);
    baseline = clone(snapshot);
    try {
      const loaded = await client.load();
      catalogSha = loaded.catalogSha;
    } catch {
      catalogSha = "";
      client.disconnect();
      client = null;
      $("#connect-open").hidden = false;
      $("#disconnect").hidden = true;
      $("#connection-state").textContent = "أعد الاتصال لمتابعة التعديل";
    }
    for (const [path, item] of uploads) publishedPreviews.set(path, item);
    uploads = new Map();
    $("#publish-dialog").close();
    $("#publish-result").hidden = false;
    $("#commit-link").href = result.url;
    $("#deployment-text").textContent =
      "تم حفظ التغييرات. جارٍ انتظار نشر الموقع…";
    showMessage("المشاريع والصور اتسجلت في GitHub. بننتظر اكتمال نشر الموقع.");
    renderList();
    if (selected >= 0) renderEditor();
    watchDeployment();
  } catch (e) {
    $("#publish-dialog").close();
    showMessage(e.message, true);
  } finally {
    busy = false;
    $("#publish-confirm").disabled = false;
    $("#publish-close").disabled = false;
    $("#publish-cancel").disabled = false;
    $("#publish-dialog").removeEventListener("cancel", preventCancel);
    $("#project-form")
      ?.querySelectorAll("input,textarea,select,button")
      .forEach((e) => (e.disabled = false));
    if (
      $('[name="slug"]') &&
      baseline.some((b) => b.slug === catalog[selected]?.slug)
    )
      $('[name="slug"]').readOnly = true;
    countChanges();
  }
});
function preventCancel(e) {
  e.preventDefault();
}
async function watchDeployment(attempt = 0) {
  clearTimeout(pollTimer);
  if (!publishedSha) return;
  try {
    const publicClient = new GitHubClient("");
    const data = await publicClient.request(
      `repos/${REPOSITORY}/actions/workflows/pages.yml/runs?head_sha=${publishedSha}&per_page=5`,
    );
    const run = data.workflow_runs[0];
    if (run) {
      $("#workflow-link").href = run.html_url;
      if (run.status === "completed") {
        if (run.conclusion === "success") {
          $("#deployment-text").textContent =
            "اكتمل النشر. مشاريعك متاحة الآن على الموقع.";
          for (const item of publishedPreviews.values())
            URL.revokeObjectURL(item.preview);
          publishedPreviews.clear();
          renderList();
          if (selected >= 0) renderEditor();
        } else
          $("#deployment-text").textContent =
            "التغييرات محفوظة، لكن نشر الموقع لم يكتمل. افتح متابعة النشر لمعرفة السبب.";
        return;
      }
      $("#deployment-text").textContent =
        "تم الحفظ. جارٍ بناء الموقع ونشر التغييرات…";
    }
    if (attempt < 30)
      pollTimer = setTimeout(() => watchDeployment(attempt + 1), 12000);
    else
      $("#deployment-text").textContent =
        "التغييرات محفوظة. النشر لم ينتهِ بعد؛ تابع حالته من الرابط أو اضغط تحديث حالة النشر.";
  } catch {
    $("#deployment-text").textContent =
      "التغييرات محفوظة. افتح متابعة النشر للتحقق من اكتماله.";
  }
}
$("#check-deployment").addEventListener("click", () => watchDeployment());
$("#export-draft").addEventListener("click", () => {
  const data = {
    version: 1,
    catalog,
    catalogSha,
    baseline,
    uploads: [...uploads].map(([path, item]) => ({
      path,
      base64: bytesBase64(item.bytes),
    })),
  };
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "showroom-draft.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
$("#import-draft").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (file.size > 28 * 1024 * 1024) throw new Error("ملف المسودة كبير جدًا.");
    const data = JSON.parse(await file.text());
    if (data.version !== 1 || !Array.isArray(data.catalog))
      throw new Error("صيغة المسودة غير صالحة.");
    if (
      changes().length &&
      !confirm("استبدال التعديلات غير المنشورة في الصفحة بالمسودة المستوردة؟")
    )
      return;
    if (
      (catalogSha && data.catalogSha && catalogSha !== data.catalogSha) ||
      (!data.catalogSha &&
        JSON.stringify(data.baseline) !== JSON.stringify(baseline))
    )
      throw new Error(
        "هذه المسودة مبنية على نسخة قديمة من الكتالوج. دمجها يحتاج مراجعة؛ لم يتم استبدال بياناتك.",
      );
    const imported = new Map();
    for (const item of data.uploads || []) {
      const bytes = Uint8Array.from(atob(item.base64), (c) => c.charCodeAt(0));
      imported.set(item.path, {
        bytes,
        preview: URL.createObjectURL(new Blob([bytes], { type: "image/webp" })),
      });
    }
    const errors = validateCatalog(data.catalog, imported);
    if (errors.length) {
      for (const item of imported.values()) URL.revokeObjectURL(item.preview);
      throw new Error(errors.join("\n"));
    }
    for (const s of uploads.values()) URL.revokeObjectURL(s.preview);
    uploads = imported;
    catalog = clone(data.catalog);
    selected = -1;
    $("#editor-panel").innerHTML =
      "<h2>اختر مشروعًا لمراجعة المسودة المستوردة</h2>";
    renderList();
    showMessage("تم استيراد المسودة. راجع المشاريع ثم احفظ وانشر.");
  } catch (e) {
    showMessage(e.message, true);
  } finally {
    event.target.value = "";
  }
});
window.addEventListener("beforeunload", (event) => {
  if (changes().length) {
    event.preventDefault();
    event.returnValue = "";
  }
});
async function init() {
  busy = true;
  countChanges();
  try {
    const loaded = await new GitHubClient("").load();
    catalog = clone(loaded.catalog);
    baseline = clone(catalog);
    catalogSha = loaded.catalogSha;
  } catch {
    try {
      const r = await fetch("./catalog.json", { cache: "no-store" });
      catalog = await r.json();
      baseline = clone(catalog);
      showMessage(
        "الكتالوج المحفوظ محمّل. اتصل بـ GitHub قبل النشر لمراجعة آخر نسخة.",
      );
    } catch {
      showMessage(
        "تعذر تحميل الكتالوج. أعد تحميل الصفحة عند توفر الاتصال.",
        true,
      );
    }
  }
  busy = false;
  renderList();
}
init();
