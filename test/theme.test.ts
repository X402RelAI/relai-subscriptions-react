import { describe, it, expect } from "vitest";
import { themeToCssVars } from "../src/theme";

describe("themeToCssVars", () => {
  it("returns an empty object for no theme", () => {
    expect(themeToCssVars()).toEqual({});
    expect(themeToCssVars(undefined)).toEqual({});
  });

  it("maps theme keys to --relai-* variables", () => {
    const vars = themeToCssVars({ primary: "#7c3aed", radius: "20px" }) as Record<string, string>;
    expect(vars["--relai-primary"]).toBe("#7c3aed");
    expect(vars["--relai-radius"]).toBe("20px");
  });

  it("only includes provided keys", () => {
    const vars = themeToCssVars({ card: "#fff" }) as Record<string, string>;
    expect(Object.keys(vars)).toEqual(["--relai-card"]);
  });
});
