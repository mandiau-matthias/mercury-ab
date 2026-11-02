import { test } from "node:test";
import assert from "node:assert/strict";
import { assign, record, target } from "../docs/lib/index.js";
import { experiment } from "../docs/experiment.js";
test("stable assignment covers both arms", () => {
	const arms = new Set();
	for (let i = 1; i <= 100; i++) {
		const id = "visitor-" + i;
		const v = assign(experiment, id);
		assert.deepEqual(assign(experiment, id), v);
		arms.add(v.variant);
	}
	assert.equal(arms.size, 2);
});
test("ineligible and paused visitors stay out", () => {
	for (const ex of [
		{ ...experiment, enrollmentPercent: 0 },
		{ ...experiment, status: "paused" },
		{ ...experiment, targeting: target.never },
	])
		assert.equal(assign(ex, "visitor").enrolled, false);
});
test("exposure precedes conversion and both deduplicate", () => {
	const event = {
		kind: "exposure",
		experiment: "signup-v1",
		visitor: "v",
		variant: "control",
	};
	const signup = { ...event, kind: "signup" };
	assert.deepEqual(record([], event, false, true), []);
	assert.deepEqual(record([], event, true, false), []);
	assert.deepEqual(record([], signup, true, true), []);
	const once = record([], event, true, true);
	assert.equal(record(once, event, true, true), once);
	const both = record(once, signup, true, true);
	assert.equal(both.length, 2);
	assert.equal(record(both, signup, true, true), both);
});
