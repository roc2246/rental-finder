import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App.jsx";

// Mock the entire fetch library — all exports become vi.fn()
vi.mock("../js/fetch-library.js", () => ({
  fetchListings: vi.fn(),
}));

import * as fetchLib from "../js/fetch-library.js";

const SAMPLE_LISTINGS = [
  { title: "Apt 1", price: "$1000", location: "Boston", listingURL: "" },
  { title: "Apt 2", price: "$1500", location: "NYC", listingURL: "" },
];

describe("App", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_SERVER_ORIGIN", "http://localhost:3000");
    fetchLib.fetchListings.mockResolvedValue({
      results: SAMPLE_LISTINGS,
      totalPages: 1,
    });
    // Suppress expected console.error calls from the error-handling tests
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  // ── Initial render ─────────────────────────────────────────────────────

  it("renders the location input", () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/boston/i)).toBeInTheDocument();
  });

  it("renders the sort-by select", () => {
    render(<App />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("calls fetchListings once on mount", async () => {
    render(<App />);
    await waitFor(() => expect(fetchLib.fetchListings).toHaveBeenCalled());
    // There should be exactly one call: the initial load. A second call would
    // indicate an unintentional extra render cycle.
    expect(fetchLib.fetchListings).toHaveBeenCalledTimes(1);
  });

  it("calls fetchListings with page=1, pageSize=20, and sort={price:1} by default", async () => {
    render(<App />);
    await waitFor(() =>
      expect(fetchLib.fetchListings).toHaveBeenCalledWith(
        {},    // no location filter
        1,
        20,
        { price: 1 }
      )
    );
  });

  it("does not include a location filter when locationQuery is empty", async () => {
    render(<App />);
    await waitFor(() =>
      expect(fetchLib.fetchListings).toHaveBeenCalledWith(
        {},
        expect.any(Number),
        expect.any(Number),
        expect.any(Object)
      )
    );
  });

  // ── Listings display ───────────────────────────────────────────────────

  it("renders the listing titles returned by the API", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("Apt 1")).toBeInTheDocument();
      expect(screen.getByText("Apt 2")).toBeInTheDocument();
    });
  });

  it("shows 'No rentals found.' while the first fetch is pending", () => {
    // fetchListings never resolves during this synchronous check
    fetchLib.fetchListings.mockReturnValue(new Promise(() => {}));
    render(<App />);
    expect(screen.getByText("No rentals found.")).toBeInTheDocument();
  });

  // ── Pagination visibility ──────────────────────────────────────────────

  it("hides pagination when totalPages is 1", async () => {
    render(<App />);
    await waitFor(() => screen.getByText("Apt 1"));
    expect(
      screen.queryByRole("button", { name: "Prev" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Next" })
    ).not.toBeInTheDocument();
  });

  it("shows pagination when totalPages > 1", async () => {
    fetchLib.fetchListings.mockResolvedValue({
      results: SAMPLE_LISTINGS,
      totalPages: 3,
    });
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Prev" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    });
  });

  it("displays the current page indicator", async () => {
    fetchLib.fetchListings.mockResolvedValue({
      results: SAMPLE_LISTINGS,
      totalPages: 3,
    });
    render(<App />);
    await waitFor(() => expect(screen.getByText("1 / 3")).toBeInTheDocument());
  });

  // ── Sorting ────────────────────────────────────────────────────────────

  it("calls fetchListings with sort={location:1} when location sort is selected", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByRole("combobox"), "location");

    await waitFor(() =>
      expect(fetchLib.fetchListings).toHaveBeenCalledWith(
        expect.any(Object),
        1,
        20,
        { location: 1 }
      )
    );
  });

  it("resets to page 1 when the sort changes while viewing page 2", async () => {
    fetchLib.fetchListings.mockResolvedValue({
      results: SAMPLE_LISTINGS,
      totalPages: 3,
    });
    const user = userEvent.setup();
    render(<App />);

    // Navigate to page 2
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument()
    );
    await user.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(screen.getByText("2 / 3")).toBeInTheDocument());

    // Change sort — should snap back to page 1
    await user.selectOptions(screen.getByRole("combobox"), "location");
    await waitFor(() => expect(screen.getByText("1 / 3")).toBeInTheDocument());
  });

  // ── Location filter ────────────────────────────────────────────────────

  it("sends a $regex location filter when the user types in the location input", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByPlaceholderText(/boston/i), "NYC");

    await waitFor(() =>
      expect(fetchLib.fetchListings).toHaveBeenCalledWith(
        { location: { $regex: "NYC", $options: "i" } },
        1,
        20,
        expect.any(Object)
      )
    );
  });

  it("resets to page 1 when the location query changes while viewing page 2", async () => {
    fetchLib.fetchListings.mockResolvedValue({
      results: SAMPLE_LISTINGS,
      totalPages: 3,
    });
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument()
    );
    await user.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(screen.getByText("2 / 3")).toBeInTheDocument());

    await user.type(screen.getByPlaceholderText(/boston/i), "B");

    await waitFor(() => expect(screen.getByText("1 / 3")).toBeInTheDocument());
  });

  it("trims whitespace from locationQuery before building the filter", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Type only spaces — should not send a location filter
    await user.type(screen.getByPlaceholderText(/boston/i), "   ");

    await waitFor(() =>
      expect(fetchLib.fetchListings).toHaveBeenLastCalledWith(
        {},
        expect.any(Number),
        expect.any(Number),
        expect.any(Object)
      )
    );
  });

  // ── Error handling ─────────────────────────────────────────────────────

  it("shows 'No rentals found.' when fetchListings rejects", async () => {
    fetchLib.fetchListings.mockRejectedValue(new Error("API error"));
    render(<App />);
    await waitFor(() =>
      expect(screen.getByText("No rentals found.")).toBeInTheDocument()
    );
  });

  it("keeps totalPages at 1 (hides pagination) after a fetch error", async () => {
    fetchLib.fetchListings.mockRejectedValue(new Error("API error"));
    render(<App />);
    await waitFor(() => screen.getByText("No rentals found."));
    expect(
      screen.queryByRole("button", { name: "Prev" })
    ).not.toBeInTheDocument();
  });
});
