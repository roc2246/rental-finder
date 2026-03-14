import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ListingsGrid from "../ListingsGrid.jsx";

const SERVER = "http://test-server:3000";

describe("ListingsGrid", () => {
  beforeEach(() => vi.stubEnv("VITE_SERVER_ORIGIN", SERVER));
  afterEach(() => vi.unstubAllEnvs());

  // ── Empty state ────────────────────────────────────────────────────────

  it("shows 'No rentals found.' when listings is an empty array", () => {
    render(<ListingsGrid listings={[]} />);
    expect(screen.getByText("No rentals found.")).toBeInTheDocument();
  });

  it("does not show 'No rentals found.' when listings exist", () => {
    render(
      <ListingsGrid
        listings={[{ title: "Apt", price: "$1000", location: "Boston", listingURL: "" }]}
      />
    );
    expect(screen.queryByText("No rentals found.")).not.toBeInTheDocument();
  });

  // ── Rendering multiple listings ────────────────────────────────────────

  it("renders one 'View Listing' link per listing", () => {
    const listings = [
      { title: "A", price: "$1000", location: "Boston", listingURL: "" },
      { title: "B", price: "$1200", location: "NYC", listingURL: "" },
      { title: "C", price: "$900", location: "LA", listingURL: "" },
    ];
    render(<ListingsGrid listings={listings} />);
    expect(screen.getAllByRole("link", { name: "View Listing" })).toHaveLength(3);
  });

  // ── Field display ──────────────────────────────────────────────────────

  it("renders the listing title", () => {
    render(
      <ListingsGrid
        listings={[{ title: "Cozy Studio", price: "$800", location: "Denver", listingURL: "" }]}
      />
    );
    expect(screen.getByText("Cozy Studio")).toBeInTheDocument();
  });

  it("renders the listing price", () => {
    render(
      <ListingsGrid
        listings={[{ title: "Apt", price: "$1500/mo", location: "Denver", listingURL: "" }]}
      />
    );
    expect(screen.getByText("$1500/mo")).toBeInTheDocument();
  });

  it("renders the listing location", () => {
    render(
      <ListingsGrid
        listings={[{ title: "Apt", price: "$1500", location: "Seattle", listingURL: "" }]}
      />
    );
    expect(screen.getByText("Seattle")).toBeInTheDocument();
  });

  // ── Fallback values ────────────────────────────────────────────────────

  it("shows 'Untitled' when title is absent", () => {
    render(
      <ListingsGrid listings={[{ price: "$1000", location: "Boston", listingURL: "" }]} />
    );
    expect(screen.getByText("Untitled")).toBeInTheDocument();
  });

  it("shows 'N/A' for missing price and missing location", () => {
    render(<ListingsGrid listings={[{ title: "Apt", listingURL: "" }]} />);
    const naElements = screen.getAllByText("N/A");
    expect(naElements).toHaveLength(2);
  });

  it("shows 'N/A' only for price when location is present", () => {
    render(
      <ListingsGrid
        listings={[{ title: "Apt", location: "Boston", listingURL: "" }]}
      />
    );
    expect(screen.getByText("N/A")).toBeInTheDocument();
    expect(screen.getByText("Boston")).toBeInTheDocument();
  });

  // ── Link hrefs ─────────────────────────────────────────────────────────

  it("builds href from a relative filename pointing to mock-websites", () => {
    render(
      <ListingsGrid
        listings={[
          { title: "Apt", price: "$1000", location: "Boston", listingURL: "apartment-finder.html" },
        ]}
      />
    );
    const link = screen.getByRole("link", { name: "View Listing" });
    expect(link).toHaveAttribute(
      "href",
      `${SERVER}/mock-websites/apartment-finder.html`
    );
  });

  it("builds href to fallback index when listingURL is empty", () => {
    render(
      <ListingsGrid
        listings={[{ title: "Apt", price: "$1000", location: "Boston", listingURL: "" }]}
      />
    );
    const link = screen.getByRole("link", { name: "View Listing" });
    expect(link).toHaveAttribute("href", `${SERVER}/mock-websites/index.html`);
  });

  it("passes absolute URLs through to the link href unchanged", () => {
    render(
      <ListingsGrid
        listings={[
          { title: "Apt", price: "$1000", location: "Boston", listingURL: "https://example.com/apt" },
        ]}
      />
    );
    const link = screen.getByRole("link", { name: "View Listing" });
    expect(link).toHaveAttribute("href", "https://example.com/apt");
  });

  it("opens every View Listing link in a new tab with safe rel attribute", () => {
    render(
      <ListingsGrid
        listings={[{ title: "Apt", price: "$1000", location: "Boston", listingURL: "" }]}
      />
    );
    const link = screen.getByRole("link", { name: "View Listing" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
