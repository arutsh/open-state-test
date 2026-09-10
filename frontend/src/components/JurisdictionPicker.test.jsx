import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import JurisdictionPicker from "./JurisdictionPicker";

const jurisdictions = [
  { id: "jur/ca", name: "California" },
  { id: "jur/tx", name: "Texas" },
];

describe("JurisdictionPicker", () => {
  it("lists all provided jurisdictions as options", () => {
    render(
      <JurisdictionPicker
        jurisdictions={jurisdictions}
        selectedId=""
        onSelect={() => {}}
      />
    );

    expect(screen.getByText("California")).toBeInTheDocument();
    expect(screen.getByText("Texas")).toBeInTheDocument();
  });

  it("calls onSelect with the chosen jurisdiction id", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <JurisdictionPicker
        jurisdictions={jurisdictions}
        selectedId=""
        onSelect={onSelect}
      />
    );

    await user.selectOptions(screen.getByLabelText("Jurisdiction"), "jur/tx");

    expect(onSelect).toHaveBeenCalledWith("jur/tx");
  });
});
