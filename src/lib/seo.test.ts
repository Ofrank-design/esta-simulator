import { describe, expect, it } from "vitest";
import { openGraphFor } from "./seo";

describe("social preview", () => {
  it("always carries the image, so a page that sets its own title can't lose it", () => {
    const og = openGraphFor("Marina Residence simulator", "Sample property");
    expect(og).toMatchObject({ title: "Marina Residence simulator", type: "website", siteName: "ESTA Simulator" });
    expect(JSON.stringify(og.images)).toContain("og-image.jpg");
  });
});
