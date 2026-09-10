import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FreshnessIndicator from "./FreshnessIndicator";

describe("FreshnessIndicator", () => {
  it("shows 'never synced' when there is no timestamp", () => {
    render(<FreshnessIndicator lastSyncedAt={null} />);
    expect(screen.getByText(/never synced/i)).toBeInTheDocument();
  });

  it("shows a relative time for a recent timestamp", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    render(<FreshnessIndicator lastSyncedAt={fiveMinutesAgo} />);
    expect(screen.getByText(/5 minutes ago/i)).toBeInTheDocument();
  });
});
