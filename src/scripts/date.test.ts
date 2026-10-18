import { test } from "node:test";
import assert from "node:assert/strict";
import { parseUserDate, isoToDisplay, isValidDate } from "../lib/date-utils.ts";

test("isValidDate accurately validates calendar dates", () => {
  assert.equal(isValidDate(2024, 2, 29), true, "Leap year Feb 29 is valid");
  assert.equal(isValidDate(2023, 2, 29), false, "Non leap year Feb 29 is invalid");
  assert.equal(isValidDate(2024, 4, 31), false, "April 31 is invalid");
  assert.equal(isValidDate(2024, 10, 20), true, "Oct 20 is valid");
  assert.equal(isValidDate(1899, 1, 1), false, "Below 1900 is invalid");
  assert.equal(isValidDate(2101, 1, 1), false, "Above 2100 is invalid");
});

test("parseUserDate handles all common Vietnamese typing formats", () => {
  // DD/MM/YYYY
  assert.equal(parseUserDate("20/10/2024"), "2024-10-20");
  assert.equal(parseUserDate("01/01/2023"), "2023-01-01");
  assert.equal(parseUserDate("1/2/2024"), "2024-02-01");

  // DD-MM-YYYY
  assert.equal(parseUserDate("20-10-2024"), "2024-10-20");

  // DD.MM.YYYY
  assert.equal(parseUserDate("20.10.2024"), "2024-10-20");

  // DDMMYYYY (8 consecutive digits)
  assert.equal(parseUserDate("20102024"), "2024-10-20");
  assert.equal(parseUserDate("14022023"), "2023-02-14");

  // YYYY-MM-DD (ISO)
  assert.equal(parseUserDate("2024-10-20"), "2024-10-20");
  assert.equal(parseUserDate("2024/10/20"), "2024-10-20");

  // Invalid dates
  assert.equal(parseUserDate(""), null);
  assert.equal(parseUserDate("abc"), null);
  assert.equal(parseUserDate("31/02/2024"), null);
  assert.equal(parseUserDate("99/99/9999"), null);
});

test("isoToDisplay formats ISO YYYY-MM-DD to DD/MM/YYYY", () => {
  assert.equal(isoToDisplay("2024-10-20"), "20/10/2024");
  assert.equal(isoToDisplay("2023-02-14"), "14/02/2023");
  assert.equal(isoToDisplay(""), "");
});
