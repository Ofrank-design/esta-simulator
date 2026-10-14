import { describe, expect, it } from "vitest";
import { feedbackHref } from "./site-config";

describe("feedback link", () => {
  it("is hidden when nothing is configured", () => {
    expect(feedbackHref(undefined)).toBeNull();
    expect(feedbackHref("")).toBeNull();
    expect(feedbackHref("   ")).toBeNull();
  });
  it("accepts a mailto address and adds a subject", () => {
    expect(feedbackHref("mailto:hello@example.com")).toBe("mailto:hello@example.com?subject=ESTA%20Simulator%20feedback");
    expect(feedbackHref("mailto:hello@example.com?subject=Hi")).toBe("mailto:hello@example.com?subject=Hi");
  });
  it("accepts an https page", () => {
    expect(feedbackHref("https://forms.example.com/esta")).toBe("https://forms.example.com/esta");
  });
  it("rejects anything unsafe or malformed", () => {
    for (const bad of ["javascript:alert(1)", "http://example.com", "data:text/html,hi", "mailto:not-an-email", "example.com", "ftp://x.y", "mailto:a@b.co extra"]) {
      expect(feedbackHref(bad)).toBeNull();
    }
  });
});
