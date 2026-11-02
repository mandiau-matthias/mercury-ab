import { bucketMercuryV2 } from "./bucketing.js";
import { DEFAULT_TARGETING_CONTEXT, passesTargeting } from "./targeting.js";
import type { RegistryEntry, TargetingContext } from "./types.js";
export * from "./bucketing.js";
export * from "./targeting.js";
export type * from "./types.js";

export function assign(
	experiment: RegistryEntry,
	visitor: string,
	context: TargetingContext = DEFAULT_TARGETING_CONTEXT,
) {
	if (!visitor || !passesTargeting(experiment, context))
		return { enrolled: false, variant: "control" };
	return bucketMercuryV2(experiment, visitor);
}

export type Event = {
	experiment: string;
	visitor: string;
	variant: string;
	kind: "exposure" | "signup";
};

/** Returns the existing list when a render or signup has already been counted. */
export function record(
	events: Event[],
	event: Event,
	consent: boolean,
	enrolled: boolean,
): Event[] {
	if (!consent || !enrolled) return events;
	const sameVisitor = (row: Event) =>
		row.experiment === event.experiment &&
		row.visitor === event.visitor &&
		row.variant === event.variant;
	if (events.some((row) => sameVisitor(row) && row.kind === event.kind))
		return events;
	if (
		event.kind === "signup" &&
		!events.some((row) => sameVisitor(row) && row.kind === "exposure")
	)
		return events;
	return [...events, event];
}
