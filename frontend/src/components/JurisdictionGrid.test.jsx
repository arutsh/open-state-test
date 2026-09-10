import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import JurisdictionGrid from "./JurisdictionGrid";

const jurisdictions = [
  {
    id: "jur/ca",
    name: "California",
    classification: "State",
    last_synced_at: new Date().toISOString(),
    party_counts: { Democratic: 3, Republican: 1 },
  },
  {
    id: "jur/wy",
    name: "Wyoming",
    classification: "State",
    last_synced_at: null,
    party_counts: {},
  },
];

describe("JurisdictionGrid", () => {
  it("renders a card per jurisdiction with seat counts from party_counts", () => {
    render(<JurisdictionGrid jurisdictions={jurisdictions} onSelect={() => {}} emptyMessage="" />);

    expect(screen.getByText("California")).toBeInTheDocument();
    expect(screen.getByText("4 seats")).toBeInTheDocument();
    expect(screen.getByText("No legislators synced yet")).toBeInTheDocument();
  });

  it("calls onSelect with the jurisdiction id when a card is activated", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<JurisdictionGrid jurisdictions={jurisdictions} onSelect={onSelect} emptyMessage="" />);

    await user.click(screen.getByText("California"));

    expect(onSelect).toHaveBeenCalledWith("jur/ca");
  });

  it("shows the empty message when there are no jurisdictions", () => {
    render(<JurisdictionGrid jurisdictions={[]} onSelect={() => {}} emptyMessage="Nothing here" />);

    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });
});
