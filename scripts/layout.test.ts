import { test } from "node:test";
import assert from "node:assert/strict";
import { layoutFor, moveIndex, slideAnnouncement } from "../src/components/gift-templates/layout.ts";

test("layoutFor picks phone, tablet or desktop from the width of the container", () => {
  assert.equal(layoutFor(320), "phone");
  assert.equal(layoutFor(390), "phone");
  assert.equal(layoutFor(639), "phone");
  assert.equal(layoutFor(640), "tablet");
  assert.equal(layoutFor(768), "tablet");
  assert.equal(layoutFor(1023), "tablet");
  assert.equal(layoutFor(1024), "desktop");
  assert.equal(layoutFor(1440), "desktop");
});

test("layoutFor treats a width that is not known yet as a phone", () => {
  for (const w of [0, -5, NaN]) assert.equal(layoutFor(w), "phone");
});

test("moveIndex steps through the slides and stops at both ends", () => {
  assert.equal(moveIndex(0, 1, 5), 1);
  assert.equal(moveIndex(4, 1, 5), 4);
  assert.equal(moveIndex(0, -1, 5), 0);
  assert.equal(moveIndex(3, -1, 5), 2);
  assert.equal(moveIndex(2, 0, 5), 2);
  assert.equal(moveIndex(9, 0, 5), 4); // a stale index is pulled back in range
  assert.equal(moveIndex(0, 1, 0), 0); // no slides at all
});

test("slideAnnouncement says where the visitor is for a screen reader", () => {
  const slides = [{ label: "Mở quà" }, { label: "Thư tay" }, { label: "Lời cảm ơn" }];
  assert.equal(slideAnnouncement(1, slides), "Trang 2 trên 3: Thư tay");
  assert.equal(slideAnnouncement(0, slides), "Trang 1 trên 3: Mở quà");
  assert.equal(slideAnnouncement(0, []), "");
});
