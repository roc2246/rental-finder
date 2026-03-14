import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Filters from "../Filters.jsx";

const defaults = {
  sortBy: "price",
  setSortBy: vi.fn(),
  locationQuery: "",
  setLocationQuery: vi.fn(),
};

describe("Filters", () => {
  // ── Rendering ──────────────────────────────────────────────────────────

  it("renders a Location label", () => {
    render(<Filters {...defaults} />);
    expect(screen.getByText("Location:")).toBeInTheDocument();
  });

  it("renders a text input with placeholder", () => {
    render(<Filters {...defaults} />);
    expect(screen.getByPlaceholderText(/boston/i)).toBeInTheDocument();
  });

  it("renders the Sort By filter label", () => {
    render(<Filters {...defaults} />);
    expect(screen.getByText(/sort by/i)).toBeInTheDocument();
  });

  it("renders the sort select element", () => {
    render(<Filters {...defaults} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  // ── Controlled values ──────────────────────────────────────────────────

  it("location input value reflects locationQuery prop", () => {
    render(<Filters {...defaults} locationQuery="New York" />);
    expect(screen.getByPlaceholderText(/boston/i)).toHaveValue("New York");
  });

  it("location input is empty when locationQuery is empty string", () => {
    render(<Filters {...defaults} locationQuery="" />);
    expect(screen.getByPlaceholderText(/boston/i)).toHaveValue("");
  });

  it("select shows the current sortBy value", () => {
    render(<Filters {...defaults} sortBy="location" />);
    expect(screen.getByRole("combobox")).toHaveValue("location");
  });

  it("select shows price when sortBy is price", () => {
    render(<Filters {...defaults} sortBy="price" />);
    expect(screen.getByRole("combobox")).toHaveValue("price");
  });

  // ── Interaction ────────────────────────────────────────────────────────

  it("calls setLocationQuery when user types in the location input", async () => {
    const setLocationQuery = vi.fn();
    const user = userEvent.setup();
    render(<Filters {...defaults} setLocationQuery={setLocationQuery} />);

    // The input is controlled — each keystroke fires onChange with that
    // character's value (since the mock setter never updates the prop).
    await user.type(screen.getByPlaceholderText(/boston/i), "N");

    expect(setLocationQuery).toHaveBeenCalledWith("N");
  });

  it("calls setLocationQuery on each keystroke", async () => {
    const setLocationQuery = vi.fn();
    const user = userEvent.setup();
    render(<Filters {...defaults} setLocationQuery={setLocationQuery} />);

    await user.type(screen.getByPlaceholderText(/boston/i), "NYC");

    // 3 characters → 3 calls (N, Y, C)
    expect(setLocationQuery).toHaveBeenCalledTimes(3);
  });

  it("calls setSortBy with 'location' when location sort is selected", async () => {
    const setSortBy = vi.fn();
    const user = userEvent.setup();
    render(<Filters {...defaults} setSortBy={setSortBy} />);

    await user.selectOptions(screen.getByRole("combobox"), "location");

    expect(setSortBy).toHaveBeenCalledWith("location");
  });

  it("calls setSortBy with 'price' when price sort is selected", async () => {
    const setSortBy = vi.fn();
    const user = userEvent.setup();
    render(
      <Filters {...defaults} sortBy="location" setSortBy={setSortBy} />
    );

    await user.selectOptions(screen.getByRole("combobox"), "price");

    expect(setSortBy).toHaveBeenCalledWith("price");
  });
});
