import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LegislatorTable from "./LegislatorTable";

describe("LegislatorTable", () => {
  it("shows an empty-state message when there are no legislators", () => {
    render(<LegislatorTable legislators={[]} />);

    expect(
      screen.getByText(/no legislators match the current filters/i)
    ).toBeInTheDocument();
  });

  it("renders a row per legislator with name, party, chamber, district", () => {
    render(
      <LegislatorTable
        legislators={[
          {
            id: "1",
            name: "Alex Rivera",
            party: "Democratic",
            chamber: "upper",
            district: "10",
          },
        ]}
      />
    );

    expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
    expect(screen.getByText("Democratic")).toBeInTheDocument();
    expect(screen.getByText("upper")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("falls back to placeholders for missing party/chamber/district", () => {
    render(
      <LegislatorTable
        legislators={[
          { id: "1", name: "Alex Rivera", party: null, chamber: null, district: null },
        ]}
      />
    );

    expect(screen.getByText("Unknown")).toBeInTheDocument();
    expect(screen.getAllByText("—")).toHaveLength(2);
  });
});
