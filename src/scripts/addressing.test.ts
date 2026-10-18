import test from "node:test";
import assert from "node:assert/strict";
import {
  parseAddressing,
  formatSalutation,
  getDefaultLetterContent,
  getDefaultVoiceNote,
  getDefaultFinalMessage,
  adaptTextPronouns,
} from "../components/gift-templates/addressing.ts";

test("parseAddressing parses 'an-em' correctly", () => {
  const p = parseAddressing("an-em");
  assert.equal(p.sender, "anh");
  assert.equal(p.recipient, "em");
  assert.equal(p.Sender, "Anh");
  assert.equal(p.Recipient, "Em");
  assert.equal(p.senderUpper, "ANH");
  assert.equal(p.recipientUpper, "EM");
});

test("parseAddressing handles standard 'Anh - Em' and variants", () => {
  const p1 = parseAddressing("Anh - Em");
  assert.equal(p1.sender, "anh");
  assert.equal(p1.recipient, "em");

  const p2 = parseAddressing("anh - em");
  assert.equal(p2.sender, "anh");
  assert.equal(p2.recipient, "em");

  const p3 = parseAddressing("Anh/Em");
  assert.equal(p3.sender, "anh");
  assert.equal(p3.recipient, "em");

  const p4 = parseAddressing("anh và em");
  assert.equal(p4.sender, "anh");
  assert.equal(p4.recipient, "em");
});

test("parseAddressing handles 'to-cau', 'Tớ - Cậu', 'mình - bạn'", () => {
  const p1 = parseAddressing("to-cau");
  assert.equal(p1.sender, "tớ");
  assert.equal(p1.recipient, "cậu");

  const p2 = parseAddressing("Tớ - Cậu");
  assert.equal(p2.sender, "tớ");
  assert.equal(p2.recipient, "cậu");

  const p3 = parseAddressing("chi-em");
  assert.equal(p3.sender, "chị");
  assert.equal(p3.recipient, "em");
});

test("parseAddressing handles single pronoun auto-pairing", () => {
  const p1 = parseAddressing("anh");
  assert.equal(p1.sender, "anh");
  assert.equal(p1.recipient, "em");

  const p2 = parseAddressing("an");
  assert.equal(p2.sender, "anh");
  assert.equal(p2.recipient, "em");

  const p3 = parseAddressing("em");
  assert.equal(p3.sender, "em");
  assert.equal(p3.recipient, "anh");
});

test("parseAddressing falls back to 'mình - bạn' on empty/invalid", () => {
  const p1 = parseAddressing("");
  assert.equal(p1.sender, "mình");
  assert.equal(p1.recipient, "bạn");

  const p2 = parseAddressing(undefined);
  assert.equal(p2.sender, "mình");
  assert.equal(p2.recipient, "bạn");
});

test("formatSalutation formats greetings naturally", () => {
  assert.equal(formatSalutation("Bảo Ngọc", "em"), "Gửi em Bảo Ngọc,");
  assert.equal(formatSalutation("Em yêu", "em"), "Gửi Em yêu,");
  assert.equal(formatSalutation("", "em"), "Gửi em,");
  assert.equal(formatSalutation(undefined, "em"), "Gửi em,");
  assert.equal(formatSalutation("Lan", "bạn"), "Gửi Lan,");
  assert.equal(formatSalutation("", "bạn"), "Gửi bạn,");
});

test("adaptTextPronouns replaces 'mình' and 'bạn' accurately", () => {
  const pronouns = parseAddressing("an-em");
  const input = "Có vài điều mình muốn nói với bạn. Mình luôn nhớ bạn.";
  const output = adaptTextPronouns(input, pronouns);
  assert.equal(output, "Có vài điều anh muốn nói với em. Anh luôn nhớ em.");
});
