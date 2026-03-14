import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Pagination from "../Pagination.jsx";

describe("Pagination", () => {
  // ── Rendering ──────────────────────────────────────────────────────────

  it("renders a Prev button", () => {
    render(<Pagination currentPage={2} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Prev" })).toBeInTheDocument();
  });

  it("renders a Next button", () => {
    render(<Pagination currentPage={2} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
  });

  it("displays currentPage / totalPages", () => {
    render(<Pagination currentPage={3} totalPages={7} onPageChange={vi.fn()} />);
    expect(screen.getByText("3 / 7")).toBeInTheDocument();
  });

  // ── Disabled state ─────────────────────────────────────────────────────

  it("disables Prev on the first page", () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Prev" })).toBeDisabled();
  });

  it("enables Prev when not on the first page", () => {
    render(<Pagination currentPage={2} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Prev" })).toBeEnabled();
  });

  it("disables Next on the last page", () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("enables Next when not on the last page", () => {
    render(<Pagination currentPage={4} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });

  // ── Page navigation ────────────────────────────────────────────────────

  it("calls onPageChange with page - 1 when Prev is clicked", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("button", { name: "Prev" }));

    expect(onPageChange).toHaveBeenCalledOnce();
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("calls onPageChange with page + 1 when Next is clicked", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(onPageChange).toHaveBeenCalledOnce();
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("does not call onPageChange when Prev is clicked on page 1 (disabled)", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("button", { name: "Prev" }));

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("does not call onPageChange when Next is clicked on the last page (disabled)", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination currentPage={5} totalPages={5} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("navigates to page 1 when Prev is clicked from page 2", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("button", { name: "Prev" }));

    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
