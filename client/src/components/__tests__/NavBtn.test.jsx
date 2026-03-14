import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NavBtn from "../NavBtn.jsx";

describe("NavBtn", () => {
  // ── Rendering ──────────────────────────────────────────────────────────

  it("renders a button with the given label", () => {
    render(<NavBtn label="Prev" bool={false} onClick={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Prev" })).toBeInTheDocument();
  });

  it("renders the Next label correctly", () => {
    render(<NavBtn label="Next" bool={false} onClick={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
  });

  // ── Disabled state ─────────────────────────────────────────────────────

  it("is disabled when bool is true", () => {
    render(<NavBtn label="Prev" bool={true} onClick={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Prev" })).toBeDisabled();
  });

  it("is enabled when bool is false", () => {
    render(<NavBtn label="Next" bool={false} onClick={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });

  // ── Interaction ────────────────────────────────────────────────────────

  it("calls onClick when clicked and the button is enabled", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<NavBtn label="Next" bool={false} onClick={onClick} />);

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not call onClick when the button is disabled", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<NavBtn label="Prev" bool={true} onClick={onClick} />);

    await user.click(screen.getByRole("button", { name: "Prev" }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("calls onClick exactly once per click", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<NavBtn label="Next" bool={false} onClick={onClick} />);

    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
