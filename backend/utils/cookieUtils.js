const DEFAULT_SAME_SITE = "Lax";
const ALLOWED_SAME_SITE = new Set(["Lax", "Strict", "None"]);

function normalizeSameSite(value) {
  if (!value) return DEFAULT_SAME_SITE;

  const normalized = String(value).trim().toLowerCase();
  if (normalized === "lax") return "Lax";
  if (normalized === "strict") return "Strict";
  if (normalized === "none") return "None";

  return DEFAULT_SAME_SITE;
}

export function getAuthCookieOptions(overrides = {}) {
  const secureByEnv = process.env.NODE_ENV === "production";
  let sameSite = normalizeSameSite(process.env.COOKIE_SAME_SITE);
  let secure = secureByEnv;

  // Browsers require Secure when SameSite=None.
  if (sameSite === "None") {
    secure = true;
  }

  if (!ALLOWED_SAME_SITE.has(sameSite)) {
    sameSite = DEFAULT_SAME_SITE;
  }

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    ...overrides,
  };
}
