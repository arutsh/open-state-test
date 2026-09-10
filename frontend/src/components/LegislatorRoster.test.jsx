import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import LegislatorRoster from "./LegislatorRoster";

const legislators = [
  { id: "1", name: "Alex Rivera", party: "Democratic", chamber: "upper", district: "10" },
  { id: "2", name: "Jordan Lee", party: "Republican", chamber: "lower", district: "42" },
];

describe("LegislatorRoster", () => {
  it("shows an empty-state message when there are no legislators", () => {
    render(
      <LegislatorRoster
        legislators={[]}
        isUnicameral={false}
        sort={{ field: "name", dir: "asc" }}
        onSort={() => {}}
        onSelect={() => {}}
      />
    );

    expect(screen.getByText(/no legislators match these filters/i)).toBeInTheDocument();
  });

  it("renders each legislator's name, party, district, and chamber", () => {
    render(
      <LegislatorRoster
        legislators={legislators}
        isUnicameral={false}
        sort={{ field: "name", dir: "asc" }}
        onSort={() => {}}
        onSelect={() => {}}
      />
    );

    expect(screen.getAllByText("Alex Rivera").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Democratic").length).toBeGreaterThan(0);
    expect(screen.getAllByText("42").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Lower chamber").length).toBeGreaterThan(0);
  });

  it("omits the chamber column/label for a unicameral jurisdiction", () => {
    render(
      <LegislatorRoster
        legislators={legislators}
        isUnicameral
        sort={{ field: "name", dir: "asc" }}
        onSort={() => {}}
        onSelect={() => {}}
      />
    );

    expect(screen.queryByText("Chamber")).not.toBeInTheDocument();
    expect(screen.queryByText("Lower chamber")).not.toBeInTheDocument();
  });

  it("calls onSort with the field when a sortable header is activated", async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(
      <LegislatorRoster
        legislators={legislators}
        isUnicameral={false}
        sort={{ field: "name", dir: "asc" }}
        onSort={onSort}
        onSelect={() => {}}
      />
    );

    await user.click(screen.getByRole("button", { name: /District/ }));

    expect(onSort).toHaveBeenCalledWith("district");
  });

  it("calls onSelect with the legislator when a row is activated", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <LegislatorRoster
        legislators={legislators}
        isUnicameral={false}
        sort={{ field: "name", dir: "asc" }}
        onSort={() => {}}
        onSelect={onSelect}
      />
    );

    await user.click(screen.getAllByText("Alex Rivera")[0]);

    expect(onSelect).toHaveBeenCalledWith(legislators[0]);
  });
});
