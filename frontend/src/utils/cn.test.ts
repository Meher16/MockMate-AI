import { describe, expect, it } from "vitest";
import { cn, formatDate, getInitials } from "./cn";

describe("cn", () => {
  it("merges class names and resolves tailwind conflicts", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    expect(cn("text-sm", false && "hidden", "font-medium")).toBe("text-sm font-medium");
  });
});

describe("getInitials", () => {
  it("returns uppercase initials", () => {
    expect(getInitials("john", "doe")).toBe("JD");
    expect(getInitials("Alice", "Smith")).toBe("AS");
  });
});

describe("formatDate", () => {
  it("formats dates consistently", () => {
    const formatted = formatDate("2026-01-15T10:30:00.000Z");
    expect(formatted).toMatch(/Jan 15, 2026/);
  });
});
