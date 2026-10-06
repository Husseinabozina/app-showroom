export const REPOSITORY = "Husseinabozina/app-showroom";
export const SITE = "https://husseinabozina.github.io/app-showroom/";
export const CATALOG_PATH = "content/projects.json";
export const statuses = [
  "Engineering showcase",
  "Published",
  "Product demo",
  "APK available",
  "In development",
];
export const sources = ["Public source", "Private source"];
export const engagements = [
  "Independent project",
  "Client work",
  "Company work",
  "Project showcase",
  "Engineering showcase",
];
export const kinds = {
  proof: "دليل / عرض",
  source: "كود التطبيق",
  presentation: "ريبو العرض فقط",
  store: "متجر",
  apk: "تحميل APK",
};
export const clone = (value) => structuredClone(value);
export function slugify(value) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
}
export function newProject(order = 1) {
  return {
    slug: "",
    name: "",
    category: "",
    order,
    featured: false,
    visible: false,
    status: "Engineering showcase",
    source: "Private source",
    engagement: "Independent project",
    color: "#e2e8cf",
    ink: "#19251f",
    headline: "",
    summary: "",
    teaser: "",
    role: "",
    roleDetail: "",
    contributions: [],
    flows: [],
    engineering: [],
    boundary: "",
    screens: [],
    links: [],
    evidence: [],
    aliases: [],
    verifiedAt: new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Cairo",
    }).format(new Date()),
  };
}
export function isHttps(value) {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && !u.username && !u.password;
  } catch {
    return false;
  }
}
export function validateCatalog(catalog, uploads = new Map()) {
  const errors = [],
    seen = new Set();
  if (!Array.isArray(catalog) || catalog.length > 200)
    return ["الكتالوج يجب أن يحتوي على 200 مشروع بحد أقصى."];
  for (const p of catalog) {
    if (!p || typeof p !== "object" || Array.isArray(p)) {
      errors.push("بيانات مشروع غير صالحة.");
      continue;
    }
    const name = p.name || p.slug || "مشروع جديد";
    const error = (msg) => errors.push(`${name}: ${msg}`);
    if (!/^[a-z][a-z0-9-]{0,69}$/.test(p.slug || ""))
      error("رابط المشروع يحتاج حروفًا إنجليزية صغيرة وأرقامًا وشرطة فقط.");
    if (seen.has(p.slug)) error("رابط المشروع مستخدم بالفعل.");
    seen.add(p.slug);
    if (!p.name?.trim()) error("اسم المشروع مطلوب.");
    if (p.featured && !p.visible) error("المشروع المميز يجب أن يكون ظاهرًا.");
    if (!Number.isFinite(p.order) || p.order < 0)
      error("الترتيب يجب أن يكون رقمًا موجبًا أو صفرًا.");
    if (typeof p.visible !== "boolean" || typeof p.featured !== "boolean")
      error("حالة الظهور والتمييز غير صالحة.");
    for (const key of [
      "screens",
      "links",
      "flows",
      "engineering",
      "contributions",
      "evidence",
      "aliases",
    ])
      if (p[key] !== undefined && !Array.isArray(p[key]))
        error("قائمة " + key + " غير صالحة.");
    if (
      [
        "screens",
        "links",
        "flows",
        "engineering",
        "contributions",
        "evidence",
        "aliases",
      ].some((key) => p[key] !== undefined && !Array.isArray(p[key]))
    )
      continue;
    for (const key of ["contributions", "evidence", "aliases"])
      if ((p[key] || []).some((s) => typeof s !== "string"))
        error("نصوص القائمة غير صالحة.");
    if (
      ["contributions", "evidence", "aliases"].some((key) =>
        (p[key] || []).some((s) => typeof s !== "string"),
      )
    )
      continue;
    if (!p.visible) continue;
    const required = {
      category: "المجال",
      headline: "عنوان القصة",
      summary: "وصف المنتج",
      teaser: "وصف المعرض",
      role: "دورك",
      roleDetail: "تفاصيل دورك",
      boundary: "حدود المسؤولية وحالة المنتج",
      verifiedAt: "تاريخ المراجعة",
    };
    for (const [field, label] of Object.entries(required))
      if (typeof p[field] !== "string" || !p[field].trim())
        error(`${label} مطلوب قبل إظهار المشروع.`);
    if (!statuses.includes(p.status)) error("حالة المشروع غير صالحة.");
    if (!sources.includes(p.source)) error("نوع الكود غير صالح.");
    if (!engagements.includes(p.engagement)) error("نوع العمل غير صالح.");
    for (const key of ["color", "ink"])
      if (!/^#[\da-f]{6}$/i.test(p[key] || ""))
        error("لون العرض يجب أن يكون لونًا صالحًا.");
    if (!p.contributions?.filter((s) => s.trim()).length)
      error("اذكر مساهمة شخصية واحدة على الأقل.");
    if (!p.evidence?.length) error("أضف رابط دليل واحدًا على الأقل.");
    for (const url of p.evidence || [])
      if (!isHttps(url)) error("روابط الأدلة يجب أن تبدأ بـ https://.");
    for (const link of p.links || []) {
      if (!link.label?.trim() || !isHttps(link.url) || !kinds[link.kind])
        error("أكمل اسم الرابط ونوعه ورابط HTTPS صالح.");
      if (p.source === "Private source" && link.kind === "source")
        error(
          "الكود الخاص لا يمكن عرضه كرابط كود تطبيق عام؛ اختر ريبو العرض فقط.",
        );
    }
    if (p.featured && (p.screens?.length || 0) < 2)
      error("المشروع المميز يحتاج صورتين على الأقل.");
    for (const s of p.screens || []) {
      if (
        !/^assets\/[a-zA-Z0-9_/-]+\.(webp|png|jpe?g)$/.test(s.src || "") ||
        s.src.includes("..")
      )
        error("مسار الصورة غير صالح.");
      if (!s.caption?.trim() || !s.alt?.trim())
        error("كل صورة تحتاج عنوانًا ووصفًا.");
    }
    if (p.video && (!isHttps(p.video.src) || !p.video.caption?.trim()))
      error("الفيديو يحتاج رابط HTTPS ووصفًا.");
    for (const group of ["flows", "engineering"])
      for (const pair of p[group] || [])
        if (
          !Array.isArray(pair) ||
          pair.length !== 2 ||
          !pair.every((s) => typeof s === "string" && s.trim())
        )
          error("أكمل عنوان ووصف كل نقطة في التدفقات والتقنيات.");
    for (const arr of ["screens", "links", "flows", "engineering"])
      if ((p[arr]?.length || 0) > 30) error("عدد العناصر في القسم تجاوز 30.");
  }
  if (JSON.stringify(catalog).length > 900000)
    errors.push("حجم الكتالوج تجاوز الحد المسموح.");
  let total = 0;
  for (const [path, file] of uploads) {
    if (
      !/^dist\/assets\/[a-zA-Z0-9_/-]+\.webp$/.test(path) ||
      path.includes("..")
    )
      errors.push("مسار رفع غير صالح.");
    total += file.bytes.length;
    if (file.bytes.length > 4 * 1024 * 1024)
      errors.push("حجم الصورة يتجاوز 4 ميجابايت.");
  }
  if (total > 16 * 1024 * 1024)
    errors.push(
      "الصور المرفوعة في عملية واحدة يجب أن تكون أقل من 16 ميجابايت.",
    );
  return [...new Set(errors)];
}
export function bytesBase64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192)
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
}
export function decodeContent(encoded) {
  return new TextDecoder().decode(
    Uint8Array.from(atob(encoded.replace(/\s/g, "")), (c) => c.charCodeAt(0)),
  );
}
export class GitHubClient {
  #token;
  #fetch;
  constructor(token, transport = fetch) {
    this.#token = token;
    this.#fetch = transport;
  }
  disconnect() {
    this.#token = "";
  }
  async request(path, { method = "GET", body } = {}) {
    const headers = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (this.#token) headers.Authorization = `Bearer ${this.#token}`;
    if (body) headers["Content-Type"] = "application/json";
    const response = await this.#fetch(`https://api.github.com/${path}`, {
      method,
      headers,
      cache: "no-store",
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) {
      const err = new Error(
        response.status === 401
          ? "مفتاح الاتصال غير صالح أو انتهت صلاحيته."
          : response.status === 403
            ? "لا توجد صلاحية كافية، أو تم الوصول لحد طلبات GitHub. تأكد من صلاحية Contents: Read and write."
            : response.status === 409 || response.status === 422
              ? "التحديث تعارض مع تغيير آخر في GitHub. أعد الاتصال لتحميل آخر نسخة."
              : `تعذر الاتصال بـ GitHub (${response.status}). حاول مرة أخرى.`,
      );
      err.status = response.status;
      throw err;
    }
    return response.json();
  }
  async connect() {
    const user = await this.request("user");
    if (user.login.toLowerCase() !== "husseinabozina")
      throw new Error("الإدارة مخصصة لحساب Husseinabozina.");
    const repo = await this.request(`repos/${REPOSITORY}`);
    if (!repo.permissions?.push)
      throw new Error("الحساب ليس لديه صلاحية تعديل الريبو.");
    return { ...(await this.load()), login: user.login };
  }
  async load() {
    const ref = await this.request(`repos/${REPOSITORY}/git/ref/heads/main`);
    const head = await this.request(
      `repos/${REPOSITORY}/git/commits/${ref.object.sha}`,
    );
    const content = await this.request(
      `repos/${REPOSITORY}/contents/${CATALOG_PATH}?ref=${ref.object.sha}`,
    );
    return {
      headSha: head.sha,
      treeSha: head.tree.sha,
      catalogSha: content.sha,
      catalog: JSON.parse(decodeContent(content.content)),
    };
  }
  async publish(catalog, uploads, expectedCatalogSha, onProgress = () => {}) {
    const errors = validateCatalog(catalog, uploads);
    if (errors.length) throw new Error(errors.join("\n"));
    onProgress("مراجعة آخر نسخة في GitHub…");
    const latest = await this.load();
    if (latest.catalogSha !== expectedCatalogSha)
      throw new Error(
        "الكتالوج اتغير من جهاز أو جلسة أخرى. صدّر مسودتك ثم أعد الاتصال لتحميل النسخة الجديدة؛ لم يتم استبدال أي تعديل.",
      );
    const tree = [
      {
        path: CATALOG_PATH,
        mode: "100644",
        type: "blob",
        content: JSON.stringify(catalog, null, 2) + "\n",
      },
    ];
    let index = 0;
    for (const [path, file] of uploads) {
      onProgress(`رفع الصورة ${++index} من ${uploads.size}…`);
      const blob = await this.request(`repos/${REPOSITORY}/git/blobs`, {
        method: "POST",
        body: { content: bytesBase64(file.bytes), encoding: "base64" },
      });
      tree.push({ path, mode: "100644", type: "blob", sha: blob.sha });
    }
    onProgress("حفظ المشاريع والصور معًا…");
    const nextTree = await this.request(`repos/${REPOSITORY}/git/trees`, {
      method: "POST",
      body: { base_tree: latest.treeSha, tree },
    });
    const commit = await this.request(`repos/${REPOSITORY}/git/commits`, {
      method: "POST",
      body: {
        message: "content: update projects from website manager",
        tree: nextTree.sha,
        parents: [latest.headSha],
      },
    });
    onProgress("إرسال التحديث للنشر…");
    await this.request(`repos/${REPOSITORY}/git/refs/heads/main`, {
      method: "PATCH",
      body: { sha: commit.sha, force: false },
    });
    return {
      sha: commit.sha,
      url:
        commit.html_url ||
        `https://github.com/${REPOSITORY}/commit/${commit.sha}`,
    };
  }
}
