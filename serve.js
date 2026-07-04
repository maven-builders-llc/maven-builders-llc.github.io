#!/usr/bin/env node
// Maven Builders — local dev server. Zero dependencies.
// Usage: node serve.js   →  http://localhost:8080
// Serves ./docs and fakes the POST /api/contact endpoint so the form can be tested.
"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PAGES = path.join(__dirname, "docs");
const PORT = process.env.PORT || 8080;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
};

http
  .createServer((req, res) => {
    // Fake contact endpoint for local testing — replace with your real backend in production.
    if (req.method === "POST" && req.url === "/api/contact") {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        console.log("[contact form]", body);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end('{"ok":true}');
      });
      return;
    }

    let urlPath = decodeURIComponent(req.url.split("?")[0]);
    if (urlPath.endsWith("/")) urlPath += "index.html";
    const file = path.normalize(path.join(PAGES, urlPath));
    if (!file.startsWith(PAGES)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        return res.end("Not found");
      }
      res.writeHead(200, {
        "Content-Type": MIME[path.extname(file)] || "application/octet-stream",
      });
      res.end(data);
    });
  })
  .listen(PORT, () => console.log(`Serving docs/ at http://localhost:${PORT}`));
