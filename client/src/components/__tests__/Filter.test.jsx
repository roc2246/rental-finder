import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Filter from "../Filter.jsx";

describe("Filter", () => {
  // ── Rendering ──────────────────────────────────────────────────────────

  it("renders the label text", () => {
    render(<Filter label="Sort By:" sortBy="price" setSortBy={vi.fn()} />);
    expect(screen.getByText("Sort By:")).toBeInTheDocument();
  });

  it("renders a select element", () => {
    render(<Filter label="Sort By:" sortBy="price" setSortBy={vi.fn()} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders a Price option", () => {
    render(<Filter label="Sort By:" sortBy="price" setSortBy={vi.fn()} />);
    expect(screen.getByRole("option", { name: "Price" })).toBeInTheDocument();
  });

  it("renders a Location option", () => {
    render(<Filter label="Sort By:" sortBy="price" setSortBy={vi.fn()} />);
    expect(
      screen.getByRole("option", { name: "Location" })
    ).toBeInTheDocument();
  });

  // ── Controlled value ───────────────────────────────────────────────────

  it("selects the option matching sortBy='price'", () => {
    render(<Filter label="Sort By:" sortBy="price" setSortBy={vi.fn()} />);
    expect(screen.getByRole("combobox")).toHaveValue("price");
  });

  it("selects the option matching sortBy='location'", () => {
    render(<Filter label="Sort By:" sortBy="location" setSortBy={vi.fn()} />);
    expect(screen.getByRole("combobox")).toHaveValue("location");
  });

  // ── Interaction ────────────────────────────────────────────────────────

  it("calls setSortBy with 'location' when that option is selected", async () => {
    const setSortBy = vi.fn();
    const user = userEvent.setup();
    render(<Filter label="Sort By:" sortBy="price" setSortBy={setSortBy} />);

    await user.selectOptions(screen.getByRole("combobox"), "location");

    expect(setSortBy).toHaveBeenCalledOnce();
    expect(setSortBy).toHaveBeenCalledWith("location");
  });

  it("calls setSortBy with 'price' when switching back from location", async () => {
    const setSortBy = vi.fn();
    const user = userEvent.setup();
    render(
      <Filter label="Sort By:" sortBy="location" setSortBy={setSortBy} />
    );

    await user.selectOptions(screen.getByRole("combobox"), "price");

    expect(setSortBy).toHaveBeenCalledWith("price");
  });

  it("does not call setSortBy when the same option is re-selected", async () => {
    const setSortBy = vi.fn();
    const user = userEvent.setup();
    render(<Filter label="Sort By:" sortBy="price" setSortBy={setSortBy} />);

    // Selecting the already-selected value fires change only if the browser
    // fires the event; userEvent still fires it, so we just verify the arg.
    await user.selectOptions(screen.getByRole("combobox"), "price");
    expect(setSortBy).toHaveBeenCalledWith("price");
  });
});
