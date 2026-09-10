import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import * as api from "./api/client";

vi.mock("./api/client");

const jurisdictions = [
  {
    id: "jur/ca",
    name: "California",
    classification: "State",
    last_synced_at: new Date().toISOString(),
    party_counts: { Democratic: 1, Republican: 1 },
  },
];

const legislators = [
  { id: "1", name: "Alex Rivera", party: "Democratic", chamber: "upper", district: "10" },
  { id: "2", name: "Jordan Lee", party: "Republican", chamber: "lower", district: "42" },
];

beforeEach(() => {
  vi.resetAllMocks();
  api.fetchJurisdictions.mockResolvedValue(jurisdictions);
  api.fetchLegislators.mockResolvedValue(legislators);
});

describe("App", () => {
  it("loads jurisdictions on the landing view, then shows the roster after opening one", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => expect(screen.getByText("California")).toBeInTheDocument());

    await user.click(screen.getByText("California"));

    await waitFor(() => {
      expect(screen.getAllByText("Alex Rivera").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Jordan Lee").length).toBeGreaterThan(0);
    });

    expect(api.fetchLegislators).toHaveBeenCalledWith("jur/ca");
  });

  it("filters the roster and opens a legislator modal, then returns to the landing view", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => expect(screen.getByText("California")).toBeInTheDocument());
    await user.click(screen.getByText("California"));
    await waitFor(() => expect(screen.getAllByText("Alex Rivera").length).toBeGreaterThan(0));

    await user.click(screen.getByRole("button", { name: "Democratic" }));
    expect(screen.queryByText("Jordan Lee")).not.toBeInTheDocument();

    await user.click(screen.getAllByText("Alex Rivera")[0]);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close" }));
    await user.click(screen.getByRole("button", { name: /All jurisdictions/ }));

    await waitFor(() => expect(screen.getByText("California")).toBeInTheDocument());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows an error state when jurisdictions fail to load", async () => {
    api.fetchJurisdictions.mockRejectedValue(new Error("network down"));
    render(<App />);

    await waitFor(() =>
      expect(screen.getByText(/could not load jurisdictions/i)).toBeInTheDocument()
    );
  });
});
