import type { RegistryEntry, TargetingContext } from './types.js';
export * from './bucketing.js';
export * from './targeting.js';
export type * from './types.js';
export declare function assign(experiment: RegistryEntry, visitor: string, context?: TargetingContext): import("./bucketing.js").MercuryV2Bucket;
export type Event = {
    experiment: string;
    visitor: string;
    variant: string;
    kind: 'exposure' | 'signup';
};
/** Returns the existing list when a render or signup has already been counted. */
export declare function record(events: Event[], event: Event, consent: boolean, enrolled: boolean): Event[];
