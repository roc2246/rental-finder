import { describe, it, expect, vi } from "vitest";
import router from "../index.js";
import * as controls from "../../controls/index.js";

// Prevent dotenv from printing its banner during tests
vi.mock('dotenv', () => ({ default: { config: vi.fn() } }));

// helper to find route paths inside router.stack
function getRouteLayers(r) {
  return r.stack
    .filter((layer) => layer.route)
    .map((layer) => layer.route);
}

describe("API router", () => {
  it("exposes /rentals and /listings", () => {
    const routes = getRouteLayers(router);
    const paths = routes.map((route) => route.path);

    expect(paths).toContain("/rentals");
    expect(paths).toContain("/listings");
  });

  it("registers GET handlers only", () => {
    const routes = getRouteLayers(router);
    for (const route of routes) {
      expect(route.methods.get).toBe(true);
      expect(route.methods.post).toBeUndefined();
      expect(route.methods.put).toBeUndefined();
      expect(route.methods.delete).toBeUndefined();
    }
  });

  it("maps both endpoints to the same controller", () => {
    const routes = getRouteLayers(router);
    const rentalRoute = routes.find((route) => route.path === "/rentals");
    const listingRoute = routes.find((route) => route.path === "/listings");

    expect(rentalRoute).toBeDefined();
    expect(listingRoute).toBeDefined();
    expect(rentalRoute.stack[0].handle).toBe(controls.manageRentalRetrieval);
    expect(listingRoute.stack[0].handle).toBe(controls.manageRentalRetrieval);
  });
});
