import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { appendParams, getListingHref } from "../utils-library.js";

// ─── appendParams ────────────────────────────────────────────────────────────

describe("appendParams", () => {
  it("returns an empty URLSearchParams for an empty object", () => {
    const params = appendParams({});
    expect(params.toString()).toBe("");
  });

  it("returns a URLSearchParams instance", () => {
    expect(appendParams({ page: 1 })).toBeInstanceOf(URLSearchParams);
  });

  it("appends string values as-is", () => {
    const params = appendParams({ foo: "bar" });
    expect(params.get("foo")).toBe("bar");
  });

  it("converts numbers to strings", () => {
    const params = appendParams({ page: 1, pageSize: 20 });
    expect(params.get("page")).toBe("1");
    expect(params.get("pageSize")).toBe("20");
  });

  it("serializes plain objects as JSON", () => {
    const filters = { status: "active" };
    const params = appendParams({ filters });
    expect(params.get("filters")).toBe(JSON.stringify(filters));
  });

  it("serializes nested objects as JSON", () => {
    const filters = { location: { $regex: "Boston", $options: "i" } };
    const params = appendParams({ filters });
    expect(JSON.parse(params.get("filters"))).toEqual(filters);
  });

  it("serializes sort objects as JSON", () => {
    const sort = { price: 1 };
    const params = appendParams({ sort });
    expect(JSON.parse(params.get("sort"))).toEqual({ price: 1 });
  });

  it("skips null values", () => {
    const params = appendParams({ a: null, b: "present" });
    expect(params.has("a")).toBe(false);
    expect(params.get("b")).toBe("present");
  });

  it("skips undefined values", () => {
    const params = appendParams({ a: undefined, b: "present" });
    expect(params.has("a")).toBe(false);
    expect(params.get("b")).toBe("present");
  });

  it("handles the full set of args the App passes", () => {
    const args = {
      filters: { location: { $regex: "NYC", $options: "i" } },
      page: 2,
      pageSize: 20,
      sort: { price: 1 },
    };
    const params = appendParams(args);
    expect(JSON.parse(params.get("filters"))).toEqual(args.filters);
    expect(params.get("page")).toBe("2");
    expect(params.get("pageSize")).toBe("20");
    expect(JSON.parse(params.get("sort"))).toEqual({ price: 1 });
  });

  it("includes boolean false as a string", () => {
    const params = appendParams({ active: false });
    expect(params.get("active")).toBe("false");
  });
});

// ─── getListingHref ──────────────────────────────────────────────────────────

describe("getListingHref", () => {
  const SERVER = "http://test-server:3000";

  beforeEach(() => {
    vi.stubEnv("VITE_SERVER_ORIGIN", SERVER);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the fallback index when listingURL is an empty string", () => {
    expect(getListingHref({ listingURL: "" })).toBe(
      `${SERVER}/mock-websites/index.html`
    );
  });

  it("returns the fallback index when listingURL is whitespace only", () => {
    expect(getListingHref({ listingURL: "   " })).toBe(
      `${SERVER}/mock-websites/index.html`
    );
  });

  it("returns the fallback index when listing is null", () => {
    expect(getListingHref(null)).toBe(`${SERVER}/mock-websites/index.html`);
  });

  it("returns the fallback index when listing has no listingURL property", () => {
    expect(getListingHref({})).toBe(`${SERVER}/mock-websites/index.html`);
  });

  it("returns an absolute https URL unchanged", () => {
    const url = "https://example.com/listing/1";
    expect(getListingHref({ listingURL: url })).toBe(url);
  });

  it("returns an absolute http URL unchanged", () => {
    const url = "http://example.com/listing/1";
    expect(getListingHref({ listingURL: url })).toBe(url);
  });

  it("resolves a bare filename to mock-websites path", () => {
    expect(getListingHref({ listingURL: "apartment-finder.html" })).toBe(
      `${SERVER}/mock-websites/apartment-finder.html`
    );
  });

  it("strips a leading slash from a relative path", () => {
    expect(getListingHref({ listingURL: "/apartment-finder.html" })).toBe(
      `${SERVER}/mock-websites/apartment-finder.html`
    );
  });

  it("strips the mock-websites/ prefix to avoid path duplication", () => {
    const href = getListingHref({
      listingURL: "mock-websites/apartment-finder.html",
    });
    expect(href).toBe(`${SERVER}/mock-websites/apartment-finder.html`);
    expect(href).not.toContain("mock-websites/mock-websites/");
  });

  it("strips case-insensitive Mock-Websites/ prefix", () => {
    const href = getListingHref({
      listingURL: "Mock-Websites/quick-rent.html",
    });
    expect(href).toBe(`${SERVER}/mock-websites/quick-rent.html`);
  });

  it("preserves the fragment in a relative URL", () => {
    const href = getListingHref({
      listingURL: "apartment-finder.html#listing-1",
    });
    expect(href).toContain("/mock-websites/apartment-finder.html");
    expect(href).toContain("#");
  });

  it("trims whitespace from listingURL before processing", () => {
    expect(getListingHref({ listingURL: "  apartment-finder.html  " })).toBe(
      `${SERVER}/mock-websites/apartment-finder.html`
    );
  });
});
