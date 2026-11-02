import { bucketMercuryV2 } from './bucketing.js';
import { DEFAULT_TARGETING_CONTEXT, passesTargeting } from './targeting.js';
export * from './bucketing.js';
export * from './targeting.js';
export function assign(experiment, visitor, context = DEFAULT_TARGETING_CONTEXT) {
    if (!visitor || !passesTargeting(experiment, context))
        return { enrolled: false, variant: 'control' };
    return bucketMercuryV2(experiment, visitor);
}
/** Returns the existing list when a render or signup has already been counted. */
export function record(events, event, consent, enrolled) {
    if (!consent || !enrolled)
        return events;
    const sameVisitor = (row) => row.experiment === event.experiment && row.visitor === event.visitor && row.variant === event.variant;
    if (events.some(row => sameVisitor(row) && row.kind === event.kind))
        return events;
    if (event.kind === 'signup' && !events.some(row => sameVisitor(row) && row.kind === 'exposure'))
        return events;
    return [...events, event];
}
