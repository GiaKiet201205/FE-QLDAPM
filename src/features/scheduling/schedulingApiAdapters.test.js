import test from "node:test";
import assert from "node:assert/strict";
import { normalizeAvailability, workplaceForCampus } from "./schedulingApiAdapters.js";

test("availability campus resolves to the matching workplace without a default-center fallback", () => {
  assert.equal(workplaceForCampus("Cơ sở chính"), "center-01");
  assert.equal(workplaceForCampus(" Cơ sở Quận 1 "), "center-02");
  assert.equal(workplaceForCampus("Cơ sở Quận 3"), "center-03");
  assert.equal(workplaceForCampus("Unknown campus"), "");
  const available = normalizeAvailability({
    id: "a", day: "mon", start: "08:00", end: "12:00",
    status: "APPROVED", campus: "Cơ sở Quận 1"
  }, "CS");
  assert.equal(available.workplaceId, "center-02");
});
