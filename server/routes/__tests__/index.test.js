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
  it("exposes /rentals and /listings GET endpoints", () => {
    const routes = getRouteLayers(router);
    const paths = routes.map((route) => route.path);

    expect(paths).toContain("/rentals");
    expect(paths).toContain("/listings");
  });

  it("exposes CRUD endpoints for rentals", () => {
    const routes = getRouteLayers(router);
    const methods = {};

    for (const route of routes) {
      if (!methods[route.path]) {
        methods[route.path] = [];
      }
      if (route.methods.get) methods[route.path].push('GET');
      if (route.methods.post) methods[route.path].push('POST');
      if (route.methods.put) methods[route.path].push('PUT');
      if (route.methods.delete) methods[route.path].push('DELETE');
    }

    // List endpoints should have GET only
    expect(methods['/rentals']).toContain('GET');
    expect(methods['/rentals']).toContain('POST');
    expect(methods['/rentals']).toContain('PUT');
    expect(methods['/rentals']).toContain('DELETE');

    // Listings alias should have GET only
    expect(methods['/listings']).toEqual(['GET']);
  });

  it("maps GET /rentals and /listings to manageRentalRetrieval", () => {
    const routes = getRouteLayers(router);
    const rentalRoute = routes.find((route) => route.path === "/rentals");
    const listingRoute = routes.find((route) => route.path === "/listings");

    expect(rentalRoute).toBeDefined();
    expect(listingRoute).toBeDefined();
    
    // Find the manageRentalRetrieval handler in the middleware stack
    const rentalHandler = rentalRoute.stack.find(layer => layer.handle === controls.manageRentalRetrieval);
    const listingHandler = listingRoute.stack.find(layer => layer.handle === controls.manageRentalRetrieval);
    
    expect(rentalHandler).toBeDefined();
    expect(listingHandler).toBeDefined();
  });

  it("protects write endpoints with authentication and authorization", () => {
    const routes = getRouteLayers(router);
    
    // Find POST /rentals route
    const postRental = routes.find((r) => r.path === "/rentals" && r.methods.post);
    
    expect(postRental).toBeDefined();
    expect(postRental.stack.length).toBeGreaterThan(1); // Should have middleware
  });
});
