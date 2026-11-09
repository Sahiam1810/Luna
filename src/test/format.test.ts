import { describe, expect, it } from "vitest";

import { formatScientific } from "@/lib/format";

describe("formatScientific", () => {
  it("formats a large number", () => {
    expect(formatScientific(3.84e28)).toBe("3,84 × 10²⁸");
  });

  it("formats a small number", () => {
    expect(formatScientific(2.66e-6)).toBe("2,66 × 10⁻⁶");
  });

  it("formats a normal number", () => {
    expect(formatScientific(1023.157)).toBe("1,02 × 10³");
  });
});
