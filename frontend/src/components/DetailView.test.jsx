import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DetailView from "./DetailView";
import * as api from "../api/client";

vi.mock("../api/client");

const jurisdiction = {
  id: "ocd-jurisdiction/country:us/state:ca/government",
  name: "California",
  classification: "State",
  last_synced_at: new Date().toISOString(),
  party_counts: { Democratic: 2, Republican: 1 },
};

const legislators = [
  { id: "1", name: "Alex Rivera", party: "Democratic", chamber: "upper", district: "10" },
  { id: "2", name: "Jordan Lee", party: "Republican", chamber: "lower", district: "42" },
  { id: "3", name: "Sam Patel", party: "Democratic", chamber: "lower", district: "7" },
];

beforeEach(() => {
  vi.resetAllMocks();
  api.fetchLegislators.mockResolvedValue(legislators);
});

describe("DetailView", () => {
  it("fetches and renders the full roster and per-chamber composition cards", async () => {
    render(<DetailView jurisdiction={jurisdiction} onBack={() => {}} />);

    await waitFor(() => expect(screen.getAllByText("Alex Rivera").length).toBeGreaterThan(0));

    expect(api.fetchLegislators).toHaveBeenCalledWith(jurisdiction.id);
    expect(screen.getAllByText("Upper chamber").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Lower chamber").length).toBeGreaterThan(0);
    expect(screen.getByText("3 legislators shown")).toBeInTheDocument();
  });

  it("filters the roster by party when a party pill is selected", async () => {
    const user = userEvent.setup();
    render(<DetailView jurisdiction={jurisdiction} onBack={() => {}} />);

    await waitFor(() => expect(screen.getAllByText("Alex Rivera").length).toBeGreaterThan(0));

    await user.click(screen.getByRole("button", { name: "Republican" }));

    expect(screen.getByText("1 legislator shown")).toBeInTheDocument();
    expect(screen.getAllByText("Jordan Lee").length).toBeGreaterThan(0);
    expect(screen.queryByText("Alex Rivera")).not.toBeInTheDocument();
  });

  it("filters the roster by name search", async () => {
    const user = userEvent.setup();
    render(<DetailView jurisdiction={jurisdiction} onBack={() => {}} />);

    await waitFor(() => expect(screen.getAllByText("Alex Rivera").length).toBeGreaterThan(0));

    await user.type(screen.getByLabelText("Search legislators by name"), "sam");

    expect(screen.getByText("1 legislator shown")).toBeInTheDocument();
    expect(screen.getAllByText("Sam Patel").length).toBeGreaterThan(0);
  });

  it("opens the legislator modal from a roster row", async () => {
    const user = userEvent.setup();
    render(<DetailView jurisdiction={jurisdiction} onBack={() => {}} />);

    await waitFor(() => expect(screen.getAllByText("Alex Rivera").length).toBeGreaterThan(0));

    await user.click(screen.getAllByText("Alex Rivera")[0]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Alex Rivera" })).toBeInTheDocument();
  });

  it("calls onBack when the back control is activated", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<DetailView jurisdiction={jurisdiction} onBack={onBack} />);

    await user.click(screen.getByRole("button", { name: /All jurisdictions/ }));

    expect(onBack).toHaveBeenCalled();
  });

  it("shows a sync-pending empty state when the jurisdiction has no legislators", async () => {
    api.fetchLegislators.mockResolvedValue([]);
    render(<DetailView jurisdiction={jurisdiction} onBack={() => {}} />);

    await waitFor(() =>
      expect(screen.getByText(/no legislators synced yet/i)).toBeInTheDocument()
    );
  });
});
