import { describe, expect, it } from "vitest";

import {
  parseList,
  toAnnouncement,
  toHomeSection,
  toProductContent,
  toSizeChart,
} from "@/lib/shopify/transforms/store-content";
import {
  convertSizeChartRows,
  isAnnouncementLive,
  nextAnnouncementChange,
} from "@/lib/store-content";

const metaobject = (fields: Record<string, string>) => ({
  fields: Object.entries(fields).map(([key, value]) => ({
    key,
    reference: null,
    references: null,
    type: "single_line_text_field",
    value,
  })),
  handle: "entry",
  id: "gid://shopify/Metaobject/1",
  type: "test",
});

describe("store content transforms", () => {
  it("parses list metafields and ignores junk", () => {
    expect(parseList('["Soft", "", "Warm"]')).toEqual(["Soft", "Warm"]);
    expect(parseList("not json")).toEqual([]);
    expect(parseList(null)).toEqual([]);
  });

  it("builds a size chart from columns and pipe-separated rows", () => {
    const chart = toSizeChart([
      { key: "name", value: "Tops" },
      { key: "unit", value: "cm" },
      { key: "columns", value: '["Size","Width","Length"]' },
      { key: "rows", value: '["S | 50 | 68","M|53|70"]' },
    ]);
    expect(chart).toEqual({
      columns: ["Size", "Width", "Length"],
      name: "Tops",
      note: undefined,
      rows: [
        ["S", "50", "68"],
        ["M", "53", "70"],
      ],
      unit: "cm",
    });
    expect(toSizeChart([{ key: "columns", value: '["Size"]' }])).toBeNull();
  });

  it("converts numeric size chart cells between cm and inches", () => {
    expect(convertSizeChartRows([["M", "100", "70–72"]], "cm", "in")).toEqual([
      ["M", "39.4", "27.6–28.3"],
    ]);
    expect(convertSizeChartRows([["M", "40"]], "in", "cm")).toEqual([["M", "101.6"]]);
  });

  it("shows announcements only inside their window", () => {
    const announcement = {
      endsAt: "2026-12-01T00:00:00Z",
      id: "1",
      startsAt: "2026-11-01T00:00:00Z",
      text: "Sale",
    };
    expect(isAnnouncementLive(announcement, Date.parse("2026-10-31T23:59:00Z"))).toBe(false);
    expect(isAnnouncementLive(announcement, Date.parse("2026-11-15T00:00:00Z"))).toBe(true);
    expect(isAnnouncementLive(announcement, Date.parse("2026-12-01T00:00:00Z"))).toBe(false);
    expect(isAnnouncementLive({ id: "2", text: "Always" }, Date.now())).toBe(true);
    expect(nextAnnouncementChange([announcement], Date.parse("2026-11-15T00:00:00Z"))).toBe(
      Date.parse("2026-12-01T00:00:00Z"),
    );
    expect(toAnnouncement(metaobject({ text: "" }))).toBeNull();
  });

  it("drops home sections that have nothing to render", () => {
    expect(toHomeSection(metaobject({ type: "hero" }))).toBeNull();
    expect(toHomeSection(metaobject({ type: "featured_collection", heading: "New" }))).toBeNull();
    expect(toHomeSection(metaobject({ type: "unknown", heading: "x" }))).toBeNull();
    expect(
      toHomeSection(metaobject({ heading: "Hello", sort_order: "2", type: "hero" })),
    ).toMatchObject({
      heading: "Hello",
      sortOrder: 2,
      type: "hero",
    });
  });

  it("maps product metafields and treats missing ones as empty", () => {
    const content = toProductContent([
      {
        key: "badges",
        namespace: "custom",
        reference: null,
        type: "list.single_line_text_field",
        value: '["New"]',
      },
      { key: "preorder", namespace: "custom", reference: null, type: "boolean", value: "true" },
      null,
    ]);
    expect(content).toMatchObject({
      badges: ["New"],
      highlights: [],
      preorder: true,
      sizeChart: null,
    });
    expect(toProductContent([])).toMatchObject({ badges: [], preorder: false });
  });
});
