import { describe, expect, it } from "vitest";
import { businessDate, businessIsoWeek } from "./index";

describe("D-058: server instants mapped to Casablanca business dates", () => {
  it.each([
    ["2026-10-18T22:59:59.999Z", "2026-10-18"],
    ["2026-10-18T23:00:00.000Z", "2026-10-19"],
    ["2026-02-16T23:30:00.000Z", "2026-02-16"],
    ["2026-03-23T23:30:00.000Z", "2026-03-24"],
  ])("maps %s to %s", (instant, expected) => {
    expect(businessDate(new Date(instant))).toBe(expected);
  });

  it.each([
    ["2025-12-28T23:00:00.000Z", "2026-W01", "2025-12-28T23:00:00.000Z", "2026-01-04T23:00:00.000Z"],
    ["2027-01-01T12:00:00.000Z", "2026-W53", "2026-12-27T23:00:00.000Z", "2027-01-03T23:00:00.000Z"],
    ["2026-02-15T12:00:00.000Z", "2026-W07", "2026-02-08T23:00:00.000Z", "2026-02-16T00:00:00.000Z"],
    ["2026-03-22T12:00:00.000Z", "2026-W12", "2026-03-16T00:00:00.000Z", "2026-03-22T23:00:00.000Z"],
  ])("uses calendar weeks, including year/DST changes: %s", (instant, key, start, end) => {
    expect(businessIsoWeek(new Date(instant))).toMatchObject({ key, startInclusive: start, endExclusive: end });
  });

  it.each(["2026-02-16T00:00:00.000Z", "2026-03-22T23:00:00.000Z", "2027-01-03T23:00:00.000Z"])(
    "shares an exact boundary without a gap or overlapping cap window: %s", end => {
      const previous = businessIsoWeek(new Date(Date.parse(end) - 1));
      const next = businessIsoWeek(new Date(end));
      expect(previous.endExclusive).toBe(next.startInclusive);
      expect(next.startInclusive).toBe(end);
      expect(previous.key).not.toBe(next.key);
    },
  );

  it("does not mutate the server clock value", () => {
    const instant = new Date("2026-10-18T12:00:00Z");
    businessIsoWeek(instant);
    expect(instant.toISOString()).toBe("2026-10-18T12:00:00.000Z");
  });

  it("rejects invalid instants rather than inventing an admission date", () => {
    expect(() => businessDate(new Date(NaN))).toThrow(RangeError);
    expect(() => businessIsoWeek(new Date(NaN))).toThrow(RangeError);
  });
});
