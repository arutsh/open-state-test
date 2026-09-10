import { describe, expect, it } from "vitest";
import { bucketLabel, bucketOf } from "./party";

describe("bucketOf", () => {
  it("maps Democratic to dem", () => {
    expect(bucketOf("Democratic")).toBe("dem");
  });

  it("maps Republican to rep", () => {
    expect(bucketOf("Republican")).toBe("rep");
  });

  it("maps Vacant to vacant", () => {
    expect(bucketOf("Vacant")).toBe("vacant");
  });

  it("maps any other party (e.g. a local party name) to ind", () => {
    expect(bucketOf("New Progressive Party")).toBe("ind");
    expect(bucketOf("Independent")).toBe("ind");
  });
});

describe("bucketLabel", () => {
  it("returns a display label for each known bucket", () => {
    expect(bucketLabel("dem")).toBe("Democratic");
    expect(bucketLabel("rep")).toBe("Republican");
    expect(bucketLabel("ind")).toBe("Independent / Other");
    expect(bucketLabel("vacant")).toBe("Vacant");
  });
});
