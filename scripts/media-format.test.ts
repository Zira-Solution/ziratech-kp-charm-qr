import { test } from "node:test";
import assert from "node:assert/strict";
import { anniversaryText, formatDateVi, sortTimeline } from "../src/components/gift-templates/media/format.ts";

test("formatDateVi writes a saved date the way Vietnamese readers expect", () => {
  assert.equal(formatDateVi("2024-02-14"), "14/02/2024");
  assert.equal(formatDateVi("2025-10-20"), "20/10/2025");
  assert.equal(formatDateVi("nope"), "nope"); // never throws, never hides what was stored
  assert.equal(formatDateVi(""), "");
});

test("anniversaryText counts days together, to come, or today", () => {
  assert.equal(anniversaryText(365, "Ngày yêu"), "Ngày yêu: đã 365 ngày");
  assert.equal(anniversaryText(1, "Ngày yêu"), "Ngày yêu: đã 1 ngày");
  assert.equal(anniversaryText(0, "Ngày yêu"), "Ngày yêu: hôm nay");
  assert.equal(anniversaryText(-5, "Ngày yêu"), "Ngày yêu: còn 5 ngày nữa");
  assert.equal(anniversaryText(null, "Ngày yêu"), "Ngày yêu");
});

test("sortTimeline puts the earliest moment first and keeps a stable order for equal dates", () => {
  const items = [
    { date: "2024-05-01", title: "c", text: "" },
    { date: "2023-12-31", title: "a", text: "" },
    { date: "2024-05-01", title: "d", text: "" },
    { date: "2024-01-15", title: "b", text: "" },
  ];
  assert.deepEqual(sortTimeline(items).map((t) => t.title), ["a", "b", "c", "d"]);
  assert.deepEqual(items.map((t) => t.title), ["c", "a", "d", "b"]); // the input is not changed
});
