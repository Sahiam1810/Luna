import { describe, expect, it } from "vitest";
import { POSITION_EQUATION_HELP } from "@/content/positionEquationHelp";

describe("position equation help content", () => {
  it("contains six complete entries with unique ids", () => {
    expect(POSITION_EQUATION_HELP).toHaveLength(6);
    expect(new Set(POSITION_EQUATION_HELP.map((entry) => entry.id)).size).toBe(6);
    for (const entry of POSITION_EQUATION_HELP) {
      expect(entry.meaning.trim()).not.toBe("");
      expect(entry.why.trim()).not.toBe("");
      expect(entry.variables.length).toBeGreaterThanOrEqual(2);
      for (const variable of entry.variables) {
        expect(variable.symbol.trim()).not.toBe("");
        expect(variable.meaning.trim()).not.toBe("");
        expect(variable.unit.trim()).not.toBe("");
      }
    }
  });
});
