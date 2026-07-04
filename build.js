#!/usr/bin/env node
// Maven Builders — static site build. Zero dependencies.
// Usage: node build.js   →  outputs the servable site into ./docs
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ROOT = __dirname;
const SRC = path.join(ROOT, "src");
const CONTENT = path.join(ROOT, "content");
const OUT = path.join(ROOT, "docs");

// ---- clean output ----
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// ---- copy static files ----
copyDir(path.join(SRC, "css"), path.join(OUT, "css"));
copyDir(path.join(SRC, "assets"), path.join(OUT, "assets"));
copyDir(path.join(SRC, "images"), path.join(OUT, "images")); // your site photos (optional)
copyDir(path.join(CONTENT, "photos"), path.join(OUT, "photos")); // testimonial photos

// ---- load layout + testimonials ----
const layout = fs.readFileSync(path.join(SRC, "layout.html"), "utf8");
const testimonials = JSON.parse(
  fs.readFileSync(path.join(CONTENT, "testimonials.json"), "utf8"),
);

// ---- build pages ----
const pagesDir = path.join(SRC, "pages");
for (const file of fs.readdirSync(pagesDir)) {
  if (!file.endsWith(".html")) continue;
  const name = path.basename(file, ".html");

  let body = fs.readFileSync(path.join(pagesDir, file), "utf8");

  // page title from <!-- @title: ... -->
  const m = body.match(/<!--\s*@title:\s*(.*?)\s*-->\s*/);
  const title = m ? m[1] : "Maven Builders";
  if (m) body = body.replace(m[0], "");

  // testimonials hole
  if (body.includes("{{testimonials}}")) {
    body = body.replace("{{testimonials}}", renderTestimonials());
  }

  let html = layout.replace("{{title}}", title).replace("{{content}}", body);

  // active nav state
  html = html.replace(
    new RegExp("\\{\\{active:" + name + "\\}\\}", "g"),
    " active",
  );
  html = html.replace(/\{\{active:[a-z-]+\}\}/g, "");

  fs.writeFileSync(path.join(OUT, file), html);
  console.log("  built", file);
}

// ---- testimonial detail pages (one per entry, with photo gallery) ----
for (const t of testimonials) {
  const slug = slugify(t.name);
  const gallery =
    (t.images || [])
      .map((img) => {
        const src = typeof img === "string" ? img : img.src;
        const caption = typeof img === "string" ? "" : img.caption || "";
        return `<figure class="g-item"><img src="photos/${encodeURIComponent(src)}" alt="${esc(caption || "Build photo from " + t.name)}" loading="lazy">${caption ? `<figcaption>${esc(caption)}</figcaption>` : ""}</figure>`;
      })
      .join("\n") || `<div class="ph g-empty">Build photos coming soon</div>`;

  const body = `<section class="page-head">
  <p class="eyebrow"><a class="crumb" href="testimonials.html">\u2190 All testimonials</a></p>
  <h1>${esc(t.name)}</h1>
  ${t.detail ? `<p class="t-detail-line">${esc(t.detail)}</p>` : ""}
</section>

<section class="quote-band">
  <figure class="t-feature">
    ${avatarHtml(t)}
    <blockquote>\u201C${esc(t.quote)}\u201D</blockquote>
    <figcaption>\u2014 ${esc(t.name).toUpperCase()}</figcaption>
  </figure>
</section>

<section class="t-gallery">
${gallery}
</section>

<section class="cta-band">
  <h2>Ready to start your own build?</h2>
  <a class="btn btn-cream" href="contact.html">Contact Us</a>
</section>`;

  let html = layout.replace("{{title}}", t.name).replace("{{content}}", body);
  html = html.replace(/\{\{active:testimonials\}\}/g, " active");
  html = html.replace(/\{\{active:[a-z-]+\}\}/g, "");
  fs.writeFileSync(path.join(OUT, `testimonial-${slug}.html`), html);
  console.log("  built", `testimonial-${slug}.html`);
}
console.log("Done → docs/");

// ---- helpers ----
function renderTestimonials() {
  return testimonials
    .map((t) => {
      const detail = t.detail
        ? `<span class="t-detail">${esc(t.detail)}</span>`
        : "";
      return `<figure class="t-card">
  ${avatarHtml(t)}
  <blockquote>\u201C${esc(t.quote)}\u201D</blockquote>
  <figcaption>\u2014 ${esc(t.name).toUpperCase()}${detail}</figcaption>
  <a class="link-arrow t-more" href="testimonial-${slugify(t.name)}.html">See their build \u2192</a>
</figure>`;
    })
    .join("\n");
}

function avatarHtml(t) {
  return t.photo
    ? `<img class="t-photo" src="photos/${encodeURIComponent(t.photo)}" alt="Photo from ${esc(t.name)}" loading="lazy">`
    : `<div class="t-photo t-initials" aria-hidden="true">${initials(t.name)}</div>`;
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function initials(name) {
  const words = name
    .split(/\s+/)
    .filter(
      (w) => /^[A-Za-z]/.test(w) && !["the", "and"].includes(w.toLowerCase()),
    );
  return (
    words
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("") || "MB"
  );
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.cpSync(from, to, { recursive: true });
}
