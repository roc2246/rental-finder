import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import * as CRUD from "../CRUD.js";
import RentalSchema from "../schemas.js";

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri(), { dbName: "test" });
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

beforeEach(async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});

  const { collections } = mongoose.connection;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("models/CRUD.js", () => {
  describe("addRental", () => {
    it("creates a rental with expected persisted fields", async () => {
      const listing = {
        title: "Modern Loft",
        listingURL: "http://listing/1",
        location: "Boston, MA",
        price: "$2100/mo",
        dailyRate: 100,
      };

      const created = await CRUD.addRental(listing);

      expect(created).toBeTruthy();
      expect(created.listingURL).toBe(listing.listingURL);
      expect(created.title).toBe(listing.title);
      expect(created.location).toBe(listing.location);
      expect(created.price).toBe(listing.price);
      expect(created.dailyRate).toBe(listing.dailyRate);
    });

    it("rejects listings without listingURL", async () => {
      await expect(CRUD.addRental(null)).rejects.toThrow("listing must include a listingURL");
      await expect(CRUD.addRental({ title: "No URL" })).rejects.toThrow("listing must include a listingURL");
      await expect(CRUD.addRental({ listingURL: "" })).rejects.toThrow("listing must include a listingURL");
    });

    it("returns null for duplicate listingURL inserts", async () => {
      const listing = { title: "Unique", listingURL: "http://duplicate" };
      const first = await CRUD.addRental(listing);
      const second = await CRUD.addRental({ ...listing, title: "Duplicate Attempt" });

      expect(first).toBeTruthy();
      expect(second).toBeNull();
    });

    it("drops unknown schema fields", async () => {
      const created = await CRUD.addRental({
        listingURL: "http://unknown-fields",
        title: "Known",
        city: "Not in schema",
      });

      expect(created.title).toBe("Known");
      expect(created).not.toHaveProperty("city");
    });
  });

  describe("updateRental", () => {
    it("returns null when listingURL does not exist", async () => {
      const updated = await CRUD.updateRental({ listingURL: "http://missing", title: "X" });
      expect(updated).toBeNull();
    });

    it("returns null when no fields change", async () => {
      const listing = { listingURL: "http://same", title: "Same title", location: "Same place" };
      await CRUD.addRental(listing);

      const unchanged = await CRUD.updateRental(listing);
      expect(unchanged).toBeNull();
    });

    it("updates one or more existing fields", async () => {
      await CRUD.addRental({
        listingURL: "http://update-target",
        title: "Old title",
        location: "Old place",
        dailyRate: 120,
      });

      const updated = await CRUD.updateRental({
        listingURL: "http://update-target",
        title: "New title",
        location: "New place",
        dailyRate: 140,
      });

      expect(updated).toBeTruthy();
      expect(updated.title).toBe("New title");
      expect(updated.location).toBe("New place");
      expect(updated.dailyRate).toBe(140);
    });

    it("throws when listing payload is invalid", async () => {
      await expect(CRUD.updateRental(undefined)).rejects.toThrow();
    });
  });

  describe("deleteRental", () => {
    it("returns null for non-array input", async () => {
      await CRUD.addRental({ listingURL: "http://kept" });
      const result = await CRUD.deleteRental({ listingURL: "http://kept" });
      expect(result).toBeNull();
    });

    it("throws when listings argument is missing", async () => {
      await expect(CRUD.deleteRental()).rejects.toThrow(
        "deleteRental requires a listing object or an array of listings",
      );
    });

    it("bulk deletes any records not in the keep list", async () => {
      const keep = { listingURL: "http://keep" };
      const removeA = { listingURL: "http://remove-a" };
      const removeB = { listingURL: "http://remove-b" };
      await CRUD.addRental(keep);
      await CRUD.addRental(removeA);
      await CRUD.addRental(removeB);

      const result = await CRUD.deleteRental([keep], 1);

      expect(result).toEqual({ deletedCount: 2 });
      const page = await CRUD.getRentals({}, 1, 10, { listingURL: 1 });
      expect(page.total).toBe(1);
      expect(page.results[0].listingURL).toBe(keep.listingURL);
    });

    it("honors batch size while deleting in chunks", async () => {
      const keep = { listingURL: "http://batch-keep" };
      await CRUD.addRental(keep);

      for (let i = 0; i < 5; i++) {
        await CRUD.addRental({ listingURL: `http://batch-remove-${i}` });
      }

      const deleteSpy = vi.spyOn(RentalSchema, "deleteMany");
      const result = await CRUD.deleteRental([keep], 2);

      expect(result.deletedCount).toBe(5);
      expect(deleteSpy).toHaveBeenCalledTimes(3);
      deleteSpy.mockRestore();
    });
  });

  describe("getRentals", () => {
    beforeEach(async () => {
      const seed = [
        { listingURL: "u1", title: "A", location: "Boston", dailyRate: 50, price: "$1000" },
        { listingURL: "u2", title: "B", location: "Boston", dailyRate: 150, price: "$2000" },
        { listingURL: "u3", title: "C", location: "NYC", dailyRate: 300, price: "$3000" },
        { listingURL: "u4", title: "D", location: "NYC", dailyRate: 75, price: "$1500" },
        { listingURL: "u5", title: "E", location: "Miami", dailyRate: 500, price: "$5000" },
      ];
      await Promise.all(seed.map((listing) => CRUD.addRental(listing)));
    });

    it("returns paginated metadata and default page", async () => {
      const page = await CRUD.getRentals();
      expect(page.results.length).toBe(5);
      expect(page.total).toBe(5);
      expect(page.page).toBe(1);
      expect(page.pageSize).toBe(20);
      expect(page.totalPages).toBe(1);
    });

    it("paginates without overlap for explicit sort", async () => {
      const first = await CRUD.getRentals({}, 1, 2, { listingURL: 1 });
      const second = await CRUD.getRentals({}, 2, 2, { listingURL: 1 });

      const firstUrls = first.results.map((item) => item.listingURL);
      const secondUrls = second.results.map((item) => item.listingURL);

      const overlap = firstUrls.filter((url) => secondUrls.includes(url));
      expect(overlap).toHaveLength(0);
      expect(first.totalPages).toBe(3);
    });

    it("filters by existing schema fields", async () => {
      const bostonOnly = await CRUD.getRentals({ location: "Boston" });
      expect(bostonOnly.total).toBe(2);
      expect(bostonOnly.results.every((item) => item.location === "Boston")).toBe(true);
    });

    it("supports comparison operators in filters", async () => {
      const expensive = await CRUD.getRentals({ dailyRate: { $gte: 200 } }, 1, 20, { dailyRate: 1 });
      const cheap = await CRUD.getRentals({ dailyRate: { $lt: 100 } }, 1, 20, { dailyRate: 1 });

      expect(expensive.results.every((item) => item.dailyRate >= 200)).toBe(true);
      expect(cheap.results.every((item) => item.dailyRate < 100)).toBe(true);
    });

    it("applies custom ascending and descending sort orders", async () => {
      const asc = await CRUD.getRentals({}, 1, 10, { dailyRate: 1 });
      const desc = await CRUD.getRentals({}, 1, 10, { dailyRate: -1 });

      expect(asc.results[0].dailyRate).toBeLessThanOrEqual(asc.results[asc.results.length - 1].dailyRate);
      expect(desc.results[0].dailyRate).toBeGreaterThanOrEqual(desc.results[desc.results.length - 1].dailyRate);
    });

    it("returns empty result set and zero totals for unmatched filters", async () => {
      const page = await CRUD.getRentals({ location: "Nowhere" });
      expect(page.results).toEqual([]);
      expect(page.total).toBe(0);
      expect(page.totalPages).toBe(0);
    });
  });
});
