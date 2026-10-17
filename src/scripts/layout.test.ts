import { test } from "node:test";
import assert from "node:assert/strict";
import { layoutFor, moveIndex, slideAnnouncement } from "../components/gift-templates/layout.ts";

test("layoutFor gives a portrait frame to phones and to a tablet held upright", () => {
  assert.equal(layoutFor(390, 844), "portrait"); // phone
  assert.equal(layoutFor(360, 640), "portrait");
  assert.equal(layoutFor(820, 1180), "portrait"); // iPad held upright
  assert.equal(layoutFor(768, 1024), "portrait");
});

test("layoutFor gives a landscape frame to a tablet held sideways and to computers", () => {
  assert.equal(layoutFor(1024, 768), "landscape"); // iPad sideways
  assert.equal(layoutFor(1180, 820), "landscape");
  assert.equal(layoutFor(1280, 720), "landscape"); // computer
  assert.equal(layoutFor(1440, 900), "landscape");
  assert.equal(layoutFor(1366, 768), "landscape");
});

test("layoutFor needs the box to be wide enough and clearly wider than tall", () => {
  assert.equal(layoutFor(639, 300), "portrait"); // too narrow for two halves
  assert.equal(layoutFor(640, 400), "landscape");
  assert.equal(layoutFor(1000, 1000), "portrait"); // square
  assert.equal(layoutFor(1149, 1000), "portrait"); // just under 1.15 x
  assert.equal(layoutFor(1150, 1000), "landscape");
});

test("layoutFor treats a box that is not measured yet as portrait", () => {
  for (const [w, h] of [[0, 0], [-5, 100], [NaN, NaN], [800, 0], [800, NaN]]) assert.equal(layoutFor(w, h), "portrait", `${w}x${h}`);
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
