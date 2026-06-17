import { describe, it, expect } from "vitest";
import {
  formatUsdc,
  formatPeriodSuffix,
  formatPeriodLabel,
  formatNetwork,
} from "../src/format";

describe("formatUsdc", () => {
  it("converts base units to a 2-dp amount", () => {
    expect(formatUsdc("5000000")).toBe("5.00");
    expect(formatUsdc("20000000")).toBe("20.00");
    expect(formatUsdc("99000000")).toBe("99.00");
  });

  it("appends the ticker when asked", () => {
    expect(formatUsdc("5000000", { withTicker: true })).toBe("5.00 USDC");
  });

  it("accepts a number and keeps cents", () => {
    expect(formatUsdc(2500000)).toBe("2.50");
  });
});

describe("formatPeriodSuffix", () => {
  it("maps common cadences to short suffixes", () => {
    expect(formatPeriodSuffix(1)).toBe("/hr");
    expect(formatPeriodSuffix(24)).toBe("/day");
    expect(formatPeriodSuffix(168)).toBe("/wk");
    expect(formatPeriodSuffix(720)).toBe("/mo");
    expect(formatPeriodSuffix(8760)).toBe("/yr");
  });

  it("falls back to days or hours for odd cadences", () => {
    expect(formatPeriodSuffix(48)).toBe("/2d");
    expect(formatPeriodSuffix(5)).toBe("/5h");
  });
});

describe("formatPeriodLabel", () => {
  it("describes the cadence in words", () => {
    expect(formatPeriodLabel(720)).toBe("Billed monthly");
    expect(formatPeriodLabel(1)).toBe("Billed hourly");
    expect(formatPeriodLabel(48)).toBe("Billed every 2 days");
    expect(formatPeriodLabel(5)).toBe("Billed every 5 hours");
  });
});

describe("formatNetwork", () => {
  it("labels mainnet and devnet", () => {
    expect(formatNetwork("solana")).toBe("Solana");
    expect(formatNetwork("solana-devnet")).toBe("Solana devnet");
  });
});
