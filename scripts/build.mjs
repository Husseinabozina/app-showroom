import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
const assetVersion = (file) =>
  createHash("sha256")
    .update(readFileSync("dist/" + file))
    .digest("hex")
    .slice(0, 10);
const cssVersion = assetVersion("styles.css"),
  jsVersion = assetVersion("app.js");
const all = JSON.parse(readFileSync("content/projects.json", "utf8"));
mkdirSync("dist/admin", { recursive: true });
writeFileSync("dist/admin/catalog.json", JSON.stringify(all, null, 2) + "\n");
for (const file of ["manager.js", "index.html"]) {
  const source = readFileSync(`dist/admin/${file}`, "utf8");
  writeFileSync(
    `dist/admin/${file}`,
    source.replace(
      /(?:manager\.css|manager\.js|core\.js)(?:\?v=[a-f0-9]+)?/g,
      (match) => {
        const name = match.split("?")[0];
        return `${name}?v=${assetVersion(`admin/${name}`)}`;
      },
    ),
  );
}

const projects = all.filter((p) => p.visible).sort((a, b) => a.order - b.order);
const featured = projects.filter((p) => p.featured);
const e = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const n = (i) => String(i).padStart(2, "0");
const tags = (p) =>
  `<div class="tags"><span>${e(p.status)}</span><span>${e(p.source)}</span>${p.implementation ? `<span>${e(p.implementation)}</span>` : ""}${p.engagement === "Client work" ? "<span>Client work</span>" : ""}</div>`;
const ext = (l) =>
  `<a class="resource-link" href="${e(l.url)}" target="_blank" rel="noopener noreferrer">${e(l.label)}<span class="sr-only"> (opens in a new tab)</span></a>`;
function reviewDate(value) {
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-US", {
        dateStyle: "long",
        timeZone: "UTC",
      }).format(date);
}
function shell(title, description, body, base = "./") {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#19251f"><title>${e(title)} — Hussein Abozina</title><meta name="description" content="${e(description)}"><meta property="og:title" content="${e(title)} — Hussein Abozina"><meta property="og:description" content="${e(description)}"><meta property="og:type" content="website"><link rel="icon" href="${base}favicon.svg"><link rel="stylesheet" href="${base}styles.css?v=${cssVersion}"><script src="${base}app.js?v=${jsVersion}" defer></script></head><body><a class="skip" href="#main">Skip to content</a><header class="header"><a class="identity" href="${base}"><span class="monogram">ha.</span><span>Hussein Abozina<span class="identity-sub">MOBILE SOFTWARE ENGINEER</span></span></a><nav aria-label="Main navigation"><a href="${base}#selected">Selected work <sup>${n(featured.length)}</sup></a><a href="${base}#collection">Collection</a><a class="contact-link" href="mailto:abozina50@gmail.com">Let’s talk</a></nav></header><main id="main">${body}</main><footer><span>© 2026 Hussein Abozina<br>Flutter · Swift · Kotlin</span><div><a href="${base}#collection">All projects</a><a href="https://github.com/Husseinabozina" target="_blank" rel="noopener noreferrer">GitHub</a><a href="mailto:abozina50@gmail.com">Email</a><a href="${base}admin/">إدارة المشاريع</a></div></footer></body></html>`;
}
function feature(p, i) {
  const display =
    p.slug === "overdeal"
      ? [p.screens[0], p.screens[2] || p.screens[1]]
      : [p.screens[1], p.screens[0]];
  return `<a class="feature feature-${p.slug} ${p.mediaKind ? "store-art" : ""}" href="./projects/${p.slug}/" style="--project-color:${p.color};--project-ink:${p.ink}"><div class="feature-copy"><span class="eyebrow">${n(i + 1)} / ${e(p.category.toUpperCase())}</span><h3>${e(p.name)}</h3><p>${e(p.teaser)}</p>${tags(p)}<span class="view-project">Explore project <span aria-hidden="true">＋</span></span></div><div class="stage"><span class="stage-word" aria-hidden="true">${e(p.name)}</span>${display.map((s, j) => `<img class="screen ${j ? "screen-front" : "screen-back"}" src="./${s.src}" alt="${e(s.alt)}" width="${p.slug === "overdeal" ? 270 : 220}" height="480" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}>`).join("")}</div></a>`;
}
function tile(p) {
  return `<a class="project-tile" href="./projects/${p.slug}/" data-project data-category="${e(p.category)}" data-status="${e(p.status)}" data-source="${e(p.source)}" data-implementation="${e(p.implementation || "")}" data-search="${e([p.name, p.category, p.status, p.source, p.engagement, p.implementation || "", ...p.aliases].join(" ").toLowerCase())}" style="--project-color:${p.color};--project-ink:${p.ink}"><div class="tile-art ${p.mediaKind ? "store-art" : ""}">${p.screens.length ? `<span class="tile-word" aria-hidden="true">${e(p.name)}</span><img src="./${p.screens[0].src}" alt="${e(p.screens[0].alt)}" loading="lazy" width="200" height="434">` : `<div class="engineering-art"><span>MOBILE</span><span>PRODUCT</span><span>ENGINEERING</span><p>Engineering<br>in progress.</p></div>`}</div><div class="tile-copy"><span class="eyebrow">${e(p.category)}</span><h3>${e(p.name)}<span aria-hidden="true">＋</span></h3><p>${e(p.teaser)}</p>${tags(p)}</div></a>`;
}
const home = `<section class="intro"><div class="eyebrow">INDEPENDENT APP SHOWROOM <span>FLUTTER · SWIFTUI · COMPOSE</span></div><h1>Small screens.<br><span>Complete experiences.</span></h1><div class="intro-bottom"><p>A selection of mobile products I’ve built and contributed to.<br> From the first interaction to the details under the hood.</p><p class="experience">~5 years with Flutter <span>/</span> 20+ applications</p></div></section><section id="selected"><div class="section-bar"><h2>Selected work</h2><span>01—${n(featured.length)} / THE FEATURED COLLECTION</span></div><div class="features">${featured.map(feature).join("")}</div></section><section id="collection" class="collection"><div class="section-bar"><h2>The collection <span class="count">${n(projects.length)}</span></h2><span>PRODUCTS / PROTOTYPES / ENGINEERING</span></div><div class="collection-heading"><h3>Different products.<br>Same attention to detail.</h3><p>Published client work, connected demos and open engineering. A selected collection from my work across 20+ applications.</p></div><div class="browse-controls"><div class="filters" role="group" aria-label="Filter projects"><button type="button" data-filter="all" aria-pressed="true">All projects</button><button type="button" data-filter="native" aria-pressed="false">Native iOS & Android</button><button type="button" data-filter="published" aria-pressed="false">Published</button><button type="button" data-filter="public" aria-pressed="false">Public source</button><button type="button" data-filter="private" aria-pressed="false">Private source</button></div><label class="search"><span class="sr-only">Search projects</span><input type="search" id="project-search" placeholder="Find a project…" autocomplete="off"><span aria-hidden="true">⌕</span></label></div><div class="results-line"><p id="result-count" role="status" aria-live="polite">${projects.length} projects</p><button class="clear-search" type="button" id="reset-filters" hidden>Clear filters</button></div><div class="project-grid">${projects.map(tile).join("")}</div><div class="empty-state" hidden><h3>No projects found.</h3><p>Try a different name, category or source type.</p><button type="button" id="empty-reset">Show all projects</button></div><noscript><p>All projects are shown. Filtering requires JavaScript.</p></noscript></section><section class="contact"><span class="eyebrow">HAVE A MOBILE PRODUCT IN MIND?</span><div><h2>Let’s make it<br>work beautifully.</h2><a href="mailto:abozina50@gmail.com">abozina50@gmail.com</a></div><p>For mobile development, product collaboration and engineering opportunities.</p></section>`;
writeFileSync(
  "dist/index.html",
  shell(
    "Apps & Projects",
    "A curated exhibition of mobile apps, published client work, Flutter and native iOS/Android engineering by Hussein Abozina.",
    home,
  ),
);
rmSync("dist/projects", { recursive: true, force: true });
for (let i = 0; i < projects.length; i++) {
  const p = projects[i],
    next = projects[(i + 1) % projects.length],
    base = "../../";
  const detail = `<div class="breadcrumb"><a href="../../#collection">All projects</a><span>/</span><span>${e(p.name)}</span></div><section class="project-intro"><div><div class="eyebrow">${e(p.category.toUpperCase())} / ${e(p.engagement.toUpperCase())}</div><h1>${e(p.name)}</h1><h2>${e(p.headline)}</h2></div><div class="project-summary">${tags(p)}<p>${e(p.summary)}</p><div class="resource-links">${p.links.slice(0, 2).map(ext).join("")}</div></div></section>${
    p.screens.length
      ? `<div class="detail-stage ${p.mediaKind ? "store-art" : ""}" style="--project-color:${p.color};--project-ink:${p.ink}"><span class="detail-word" aria-hidden="true">${e(p.name)}</span>${p.screens
          .slice(0, 3)
          .map(
            (s, j) =>
              `<img class="detail-screen detail-screen-${j}" src="../../${s.src}" alt="${e(s.alt)}" width="300" height="650" ${j > 0 ? 'loading="lazy"' : 'fetchpriority="high"'}>`,
          )
          .join(
            "",
          )}<span class="media-note">${p.mediaKind ? "Published store artwork · may include later team updates" : e(p.mediaCaption || "Screens from the app experience")}</span></div>`
      : ""
  }<nav class="project-nav" aria-label="Project sections"><a href="#contribution">My contribution</a><a href="#experience">Product flows</a><a href="#engineering">Engineering</a>${p.screens.length ? '<a href="#screens">Screens</a>' : ""}<a href="#proof">Links & evidence</a></nav><section id="contribution" class="story-section"><div class="section-label"><span>01 / CONTRIBUTION</span><h2>${e(p.role)}</h2></div><div class="story-content"><p class="lead">${e(p.roleDetail)}</p><ul class="contribution-list">${p.contributions.map((t) => `<li>${e(t)}</li>`).join("")}</ul><aside class="scope-note"><strong>Scope & status</strong><p>${e(p.boundary)}</p></aside></div></section><section id="experience" class="flow-section"><div class="section-bar"><h2>Inside the experience</h2><span>02 / PRODUCT FLOWS</span></div><div class="flow-grid">${p.flows.map(([title, text], j) => `<article><span class="flow-number">${n(j + 1)}</span><h3>${e(title)}</h3><p>${e(text)}</p></article>`).join("")}</div></section>${p.video ? `<section class="film-section"><div class="section-bar"><h2>Watch the app</h2><span>APP WALKTHROUGH</span></div><div class="film-wrap"><video controls playsinline preload="none" poster="../../${p.screens[0].src}" aria-label="${e(p.name)} app walkthrough"><source src="${e(p.video.src)}" type="video/mp4">Your browser cannot play this video. <a href="${e(p.video.src)}">Open the walkthrough</a>.</video><div><span class="eyebrow">THE PRODUCT IN MOTION</span><h3>See the flow.<br>Feel the details.</h3><p>${e(p.video.caption)}</p><a class="text-link" href="${e(p.video.src)}" target="_blank" rel="noopener noreferrer">Open video separately</a></div></div></section>` : ""}<section id="engineering" class="story-section"><div class="section-label"><span>03 / ENGINEERING</span><h2>Behind the interface.</h2></div><div class="story-content engineering-list">${p.engineering.map(([title, text]) => `<article><h3>${e(title)}</h3><p>${e(text)}</p></article>`).join("")}</div></section>${p.screens.length ? `<section id="screens" class="screens-section"><div class="section-bar"><h2>A closer look</h2><span>${n(p.screens.length)} / ${p.mediaKind ? "STORE VISUALS" : "APP SCREENS"}</span></div><p class="gallery-hint">${p.mediaCaption ? e(p.mediaCaption) + ". " : ""}Scroll to explore. Select a screen to open the full view.</p><div class="screen-gallery">${p.screens.map((s, j) => `<figure><button type="button" class="gallery-open" data-index="${j}" aria-label="Open ${e(s.caption)}"><img src="../../${s.src}" alt="${e(s.alt)}" loading="lazy" width="250" height="545"></button><figcaption><span>${n(j + 1)}</span> ${e(s.caption)}</figcaption></figure>`).join("")}</div><dialog class="lightbox" aria-labelledby="lightbox-caption"><div class="lightbox-toolbar"><p id="lightbox-caption"></p><button type="button" class="lightbox-close" aria-label="Close screenshot">Close ×</button></div><div class="lightbox-image-wrap"><img id="lightbox-image" alt=""></div><div class="lightbox-controls"><button type="button" id="prev-screen">Previous screen</button><span id="screen-counter" aria-live="polite"></span><button type="button" id="next-screen">Next screen</button></div></dialog></section>` : ""}<section id="proof" class="story-section"><div class="section-label"><span>04 / PROOF</span><h2>Explore it for yourself.</h2></div><div class="story-content"><div class="proof-links">${p.links.map(ext).join("")}</div><p class="evidence-note">${p.source === "Private source" ? "App source is private. Presentation repositories contain public project information and media." : "The public repository provides implementation and engineering evidence."} Project information reviewed ${e(reviewDate(p.verifiedAt))}.</p><details class="sources"><summary>Content sources</summary><ul>${p.evidence.map((url, j) => `<li><a href="${e(url)}" target="_blank" rel="noopener noreferrer">${url.includes("play.google") ? "Google Play listing" : `Project evidence ${j + 1}`}</a></li>`).join("")}</ul></details></div></section><a class="next-project" href="../${next.slug}/"><span class="eyebrow">NEXT IN THE COLLECTION</span><span class="next-name">${e(next.name)} <span aria-hidden="true">＋</span></span><span>${e(next.category)} · ${e(next.status)}</span></a>`;
  mkdirSync(`dist/projects/${p.slug}`, { recursive: true });
  writeFileSync(
    `dist/projects/${p.slug}/index.html`,
    shell(p.name, p.summary, detail, base),
  );
}
writeFileSync(
  "dist/404.html",
  shell(
    "Page not found",
    "Explore the Apps & Projects collection.",
    `<section class="not-found"><span class="eyebrow">404 / NOT IN THE COLLECTION</span><h1>Let’s get you<br>back to the work.</h1><a class="resource-link" href="./">Explore all projects</a></section>`,
  ).replace(
    "<head>",
    '<head><base href="https://husseinabozina.github.io/app-showroom/">',
  ),
);
console.log(
  `Built home, ${projects.length} project pages and 404. ${all.length - projects.length} draft records excluded.`,
);
