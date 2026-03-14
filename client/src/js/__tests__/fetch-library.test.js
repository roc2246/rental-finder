import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock utils-library before importing the module under test.
// Path is relative to THIS test file; resolves to src/js/utils-library.js.
vi.mock("../utils-library.js", () => ({
  appendParams: vi.fn((args) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(args)) {
      if (v == null) continue;
      params.append(k, typeof v === "object" ? JSON.stringify(v) : String(v));
    }
    return params;
  }),
}));

import { fetchListings } from "../fetch-library.js";
import * as utilsLibrary from "../utils-library.js";

describe("fetchListings", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Happy path ──────────────────────────────────────────────────────────

  it("calls fetch with a GET request to /api/listings", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [], totalPages: 1 }),
    });

    await fetchListings();

    expect(global.fetch).toHaveBeenCalledOnce();
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toMatch(/^\/api\/listings\?/);
    expect(options.method).toBe("GET");
  });

  it("returns the parsed JSON body on success", async () => {
    const mockData = { results: [{ title: "Test Apartment" }], totalPages: 3 };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await fetchListings();
    expect(result).toEqual(mockData);
  });

  it("passes filters, page, pageSize, and sort to appendParams", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [], totalPages: 1 }),
    });

    const filters = { location: { $regex: "Boston", $options: "i" } };
    const sort = { price: 1 };

    await fetchListings(filters, 2, 10, sort);

    expect(utilsLibrary.appendParams).toHaveBeenCalledWith({
      filters,
      page: 2,
      pageSize: 10,
      sort,
    });
  });

  it("uses correct defaults: page=1, pageSize=20, empty filters and sort", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [], totalPages: 1 }),
    });

    await fetchListings();

    expect(utilsLibrary.appendParams).toHaveBeenCalledWith({
      filters: {},
      page: 1,
      pageSize: 20,
      sort: {},
    });
  });

  // ── Error handling ──────────────────────────────────────────────────────

  it("throws when the server returns a non-ok status", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 });

    await expect(fetchListings()).rejects.toThrow("Server returned 500");
  });

  it("includes the exact status code in the error message", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 404 });

    await expect(fetchListings()).rejects.toThrow("Server returned 404");
  });

  it("re-throws network errors from fetch", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network failure"));

    await expect(fetchListings()).rejects.toThrow("Network failure");
  });
});
