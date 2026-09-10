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
    classification: "state",
    last_synced_at: new Date().toISOString(),
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
  api.fetchPartySummary.mockResolvedValue({
    counts: { Democratic: 1, Republican: 1 },
  });
});

describe("App", () => {
  it("loads jurisdictions and shows legislators after selecting one", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() =>
      expect(screen.getByText("California")).toBeInTheDocument()
    );

    await user.selectOptions(screen.getByLabelText("Jurisdiction"), "jur/ca");

    await waitFor(() => {
      expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
      expect(screen.getByText("Jordan Lee")).toBeInTheDocument();
    });

    expect(api.fetchLegislators).toHaveBeenCalledWith("jur/ca", {
      party: "",
      chamber: "",
    });
    expect(screen.getByText(/last updated/i)).toBeInTheDocument();
  });

  it("shows an error state when jurisdictions fail to load", async () => {
    api.fetchJurisdictions.mockRejectedValue(new Error("network down"));
    render(<App />);

    await waitFor(() =>
      expect(screen.getByText(/could not load jurisdictions/i)).toBeInTheDocument()
    );
  });

  it("shows a sync-pending message when a jurisdiction has no legislators", async () => {
    const user = userEvent.setup();
    api.fetchLegislators.mockResolvedValue([]);
    api.fetchPartySummary.mockResolvedValue({ counts: {} });
    render(<App />);

    await waitFor(() =>
      expect(screen.getByText("California")).toBeInTheDocument()
    );
    await user.selectOptions(screen.getByLabelText("Jurisdiction"), "jur/ca");

    await waitFor(() =>
      expect(screen.getByText(/sync pending/i)).toBeInTheDocument()
    );
  });
});
