import { describe, expect, it } from "vitest";
import { formatRelative, isStale } from "./freshness";

describe("formatRelative", () => {
  it("returns 'never synced' when there is no timestamp", () => {
    expect(formatRelative(null)).toBe("never synced");
  });

  it("formats a recent timestamp in minutes", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelative(fiveMinutesAgo)).toBe("5 minutes ago");
  });

  it("formats an older timestamp in hours", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(formatRelative(threeHoursAgo)).toBe("3 hours ago");
  });

  it("formats a multi-day-old timestamp in days", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelative(twoDaysAgo)).toBe("2 days ago");
  });
});

describe("isStale", () => {
  it("is true when there is no timestamp", () => {
    expect(isStale(null)).toBe(true);
  });

  it("is false within the 72-hour threshold", () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    expect(isStale(oneHourAgo)).toBe(false);
  });

  it("is true past the 72-hour threshold", () => {
    const seventyThreeHoursAgo = new Date(
      Date.now() - 73 * 60 * 60 * 1000
    ).toISOString();
    expect(isStale(seventyThreeHoursAgo)).toBe(true);
  });
});
