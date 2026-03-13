export function appendParams(args) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(args)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value === "object") {
      // Send objects as JSON so the server can parse query filters/sort.
      params.append(key, JSON.stringify(value));
    } else {
      params.append(key, String(value));
    }
  }
  return params;
}

export function getListingHref(listing) {
  const raw = (listing?.listingURL || "").trim();
  const serverOrigin =
    import.meta.env.VITE_SERVER_ORIGIN ||
    (import.meta.env.DEV ? "http://localhost:3000" : window.location.origin);

  if (!raw) {
    return `${serverOrigin}/mock-websites/index.html`;
  }

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  const normalized = raw.replace(/^\/+/, "").replace(/^mock-websites\//i, "");
  const [fileName, fragment = ""] = normalized.split("#");
  const safeFile = fileName || "index.html";
  const safeFragment = fragment ? `#${encodeURIComponent(fragment)}` : "";

  return `${serverOrigin}/mock-websites/${safeFile}${safeFragment}`;
}
