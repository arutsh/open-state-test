import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import LandingView from "./LandingView";

const jurisdictions = [
  {
    id: "jur/ca",
    name: "California",
    classification: "State",
    last_synced_at: new Date().toISOString(),
    party_counts: { Democratic: 3, Republican: 1 },
  },
  {
    id: "jur/tx",
    name: "Texas",
    classification: "State",
    last_synced_at: new Date(Date.now() - 100 * 60 * 60 * 1000).toISOString(),
    party_counts: { Republican: 2, Democratic: 1 },
  },
];

describe("LandingView", () => {
  it("shows the coverage note against the fixed 52-jurisdiction total", () => {
    render(<LandingView jurisdictions={jurisdictions} onSelect={() => {}} />);

    expect(screen.getByText(/Showing 2 of 52 supported jurisdictions/)).toBeInTheDocument();
  });

  it("filters the grid by jurisdiction name search", async () => {
    const user = userEvent.setup();
    render(<LandingView jurisdictions={jurisdictions} onSelect={() => {}} />);

    await user.type(screen.getByLabelText("Search jurisdictions"), "cali");

    expect(screen.getByText("California")).toBeInTheDocument();
    expect(screen.queryByText("Texas")).not.toBeInTheDocument();
    expect(screen.getByText(/Showing 1 of 52 supported jurisdictions/)).toBeInTheDocument();
  });

  it("shows a search-specific empty state when nothing matches", async () => {
    const user = userEvent.setup();
    render(<LandingView jurisdictions={jurisdictions} onSelect={() => {}} />);

    await user.type(screen.getByLabelText("Search jurisdictions"), "nowhere");

    expect(screen.getByText(/No jurisdictions match "nowhere"/)).toBeInTheDocument();
  });

  it("flags a jurisdiction stale after 72 hours in the freshness banner", () => {
    render(<LandingView jurisdictions={jurisdictions} onSelect={() => {}} />);

    expect(screen.getByText(/1 jurisdiction overdue for re-sync \(Texas\)/)).toBeInTheDocument();
  });

  it("calls onSelect when a card is opened", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<LandingView jurisdictions={jurisdictions} onSelect={onSelect} />);

    await user.click(screen.getByText("Texas"));

    expect(onSelect).toHaveBeenCalledWith("jur/tx");
  });
});
