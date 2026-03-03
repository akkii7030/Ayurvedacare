import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const baseUrl = process.env.SITE_URL || "https://sharavatclinic.com";

const routes = [
  "/",
  "/about",
  "/services",
  "/products",
  "/booking",
  "/doctors",
  "/testimonials",
  "/blog",
  "/contact",
  "/privacy",
  "/terms",
  "/refund-policy",
  "/emergency-info",
];

const urls = routes
  .map(
    (route) => `
  <url>
    <loc>${baseUrl}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === "/" ? "1.0" : "0.8"}</priority>
  </url>`
  )
  .join("");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

writeFileSync(resolve("public/sitemap.xml"), xml, "utf8");
