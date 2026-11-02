/** Deterministic Mercury assignment. The same key, definition and visitor yield the same arm. */
import type { RegistryEntry, VariantKey } from "./types.js";
/**
 * 32-bit FNV-1a. UTF-16 code units are folded byte-wise so the hash matches
 * across runtimes (Node + browser + edge). Result is unsigned via `>>> 0`.
 */
export declare function fnv1a32(input: string): number;
export type MercuryV2Bucket = {
    enrolled: boolean;
    variant: VariantKey;
};
/**
 * Mercury-owned assignment for future experiments. Enrollment and variant
 * selection use different salts, so changing rollout cannot correlate the
 * enrolled cohort with arm boundaries. PostHog never participates.
 */
export declare function bucketMercuryV2(entry: RegistryEntry, distinctId: string): MercuryV2Bucket;
/**
 * Pick a variant from a registry entry using a stable hash of `distinctId`.
 *
 * - Returns `'control'` when status is `draft`, `paused`, or `shipped`.
 *   - `draft` / `paused`: experiment isn't live, everyone falls to control.
 *   - `shipped`: experiment has been decided; the winning variant (if any)
 *     should be hand-coded into the production component, and any straggler
 *     `useExperiment` calls must funnel users to control rather than keep
 *     splitting traffic. Without this clamp, a forgotten consumer would
 *     keep randomly assigning users for the lifetime of the registry entry.
 * - Returns `'control'` when the registry has no variants (defensive — should
 *   never happen because the registry is statically typed).
 * - Weights are normalized; they don't have to sum to 100.
 */
export declare function bucketLocal(entry: RegistryEntry, distinctId: string): VariantKey;
