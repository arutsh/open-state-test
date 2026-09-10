import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PartySummary from "./PartySummary";

describe("PartySummary", () => {
  it("renders nothing when there are no counts", () => {
    const { container } = render(<PartySummary counts={{}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a row per party with its seat count, largest first", () => {
    render(<PartySummary counts={{ Republican: 1, Democratic: 2 }} />);

    const labels = screen
      .getAllByText(/Democratic|Republican/)
      .map((el) => el.textContent);
    expect(labels).toEqual(["Democratic", "Republican"]);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
