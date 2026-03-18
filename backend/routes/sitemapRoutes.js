import express from "express";
import db from "../config/db.js";

const router = express.Router();

const xmlEscape = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");

router.get("/", async (req, res, next) => {
  try {
    const siteUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

    const staticPaths = ["/", "/about", "/courses", "/artists", "/events", "/offers", "/gallery", "/teachers"];

    const [courseRows] = await db.query("SELECT slug, updated_at FROM Courses WHERE slug IS NOT NULL AND slug <> ''");
    const [eventRows] = await db.query("SELECT slug, updated_at FROM Events WHERE slug IS NOT NULL AND slug <> ''");
    const [newsRows] = await db.query("SELECT slug, updated_at FROM News WHERE slug IS NOT NULL AND slug <> ''");
    const [artistRows] = await db.query("SELECT slug, updated_at FROM Artists WHERE slug IS NOT NULL AND slug <> ''");
    const [offerRows] = await db.query("SELECT slug, updated_at FROM Offers WHERE slug IS NOT NULL AND slug <> '' AND is_active = 1");

    const urls = [];

    staticPaths.forEach((path) => {
      urls.push({ loc: `${siteUrl}${path}`, lastmod: null });
    });

    courseRows.forEach((item) => urls.push({ loc: `${siteUrl}/courses/${item.slug}`, lastmod: item.updated_at }));
    eventRows.forEach((item) => urls.push({ loc: `${siteUrl}/events/${item.slug}`, lastmod: item.updated_at }));
    newsRows.forEach((item) => urls.push({ loc: `${siteUrl}/news/${item.slug}`, lastmod: item.updated_at }));
    artistRows.forEach((item) => urls.push({ loc: `${siteUrl}/artists/${item.slug}`, lastmod: item.updated_at }));
    offerRows.forEach((item) => urls.push({ loc: `${siteUrl}/offers/${item.slug}`, lastmod: item.updated_at }));

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map(
        (entry) => `  <url>\n    <loc>${xmlEscape(entry.loc)}</loc>${
          entry.lastmod
            ? `\n    <lastmod>${new Date(entry.lastmod).toISOString()}</lastmod>`
            : ""
        }\n  </url>`
      )
      .join("\n")}\n</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    next(error);
  }
});

export default router;
