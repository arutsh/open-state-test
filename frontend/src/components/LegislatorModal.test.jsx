import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import LegislatorModal from "./LegislatorModal";

const legislator = {
  id: "1",
  name: "Alex Rivera",
  party: "Democratic",
  chamber: "upper",
  district: "10",
  image_url: null,
};

describe("LegislatorModal", () => {
  it("shows the legislator's name, party, chamber, district, and jurisdiction", () => {
    render(
      <LegislatorModal legislator={legislator} jurisdictionName="California" onClose={() => {}} />
    );

    expect(screen.getByRole("heading", { name: "Alex Rivera" })).toBeInTheDocument();
    expect(screen.getAllByText("Democratic").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Upper chamber").length).toBeGreaterThan(0);
    expect(screen.getAllByText("10").length).toBeGreaterThan(0);
    expect(screen.getAllByText("California").length).toBeGreaterThan(0);
  });

  it("falls back to initials when there is no image_url", () => {
    render(
      <LegislatorModal legislator={legislator} jurisdictionName="California" onClose={() => {}} />
    );

    expect(screen.getByText("AR")).toBeInTheDocument();
  });

  it("calls onClose when the close button is activated", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <LegislatorModal legislator={legislator} jurisdictionName="California" onClose={onClose} />
    );

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Escape is pressed", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <LegislatorModal legislator={legislator} jurisdictionName="California" onClose={onClose} />
    );

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalled();
  });

  it("returns focus to the previously focused element on unmount", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "open";
    document.body.appendChild(trigger);
    trigger.focus();

    const { unmount } = render(
      <LegislatorModal legislator={legislator} jurisdictionName="California" onClose={() => {}} />
    );

    expect(document.activeElement).toHaveAccessibleName("Close");

    unmount();

    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });
});
