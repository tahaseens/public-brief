import assert from "node:assert/strict";
import test from "node:test";
import { analysisRequestSchema, isOversizedSource } from "../lib/analysis-request.ts";
import { publicBriefSchema } from "../lib/brief.ts";
import { InMemoryRateLimiter } from "../lib/rate-limit.ts";
import { normalizeMonthDateFormatting } from "../lib/date-format.ts";

const validRequest = {
  text: "A public body will consider this agenda item at a future meeting. This sentence supplies enough source text.",
  perspective: "Resident",
  concern: "Meeting access",
};

test("analysis requests reject malformed and unknown input", () => {
  assert.equal(analysisRequestSchema.safeParse({ ...validRequest, perspective: "Campaign" }).success, false);
  assert.equal(analysisRequestSchema.safeParse({ ...validRequest, unexpected: true }).success, false);
  assert.equal(analysisRequestSchema.safeParse({ ...validRequest, text: "too short" }).success, false);
});

test("oversized source text is identifiable for a 413 response", () => {
  assert.equal(isOversizedSource({ ...validRequest, text: "x".repeat(15_001) }), true);
  assert.equal(isOversizedSource(validRequest), false);
});

test("rate limiter rejects the sixth request in ten minutes", () => {
  const limiter = new InMemoryRateLimiter(5, 600_000);
  for (let attempt = 0; attempt < 5; attempt += 1) assert.equal(limiter.check("203.0.113.1", 1_000).allowed, true);
  const limited = limiter.check("203.0.113.1", 1_000);
  assert.equal(limited.allowed, false);
  assert.equal(limited.retryAfterSeconds, 600);
});

test("malformed model output is rejected by the response schema", () => {
  assert.equal(publicBriefSchema.safeParse({ plainLanguageSummary: "Partial arbitrary output" }).success, false);
});

test("generated month and day punctuation is normalized without changing other text", () => {
  assert.equal(normalizeMonthDateFormatting("March: 18, 2025: Board action"), "March 18, 2025: Board action");
  assert.equal(normalizeMonthDateFormatting("February: 12, 2025"), "February 12, 2025");
  assert.equal(normalizeMonthDateFormatting("The source quotes March: 18 as written"), "The source quotes March: 18 as written");
});
