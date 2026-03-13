export function appendParams(args) {
  const params = new URLSearchParams();
  for (const key in args) {
    if (typeof args[key] === "object") {
      params.append(key, JSON.stringify(args[key]));
    } else {
      params.append(key, args[key]);
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
