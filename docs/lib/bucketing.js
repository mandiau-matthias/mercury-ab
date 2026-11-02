/**
 * 32-bit FNV-1a. UTF-16 code units are folded byte-wise so the hash matches
 * across runtimes (Node + browser + edge). Result is unsigned via `>>> 0`.
 */
export function fnv1a32(input) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
        const code = input.charCodeAt(i);
        // Hash both bytes of the UTF-16 unit so non-ASCII IDs (e.g. emoji
        // distinct_ids from PostHog identify-merge) still bucket uniformly.
        hash ^= code & 0xff;
        hash = Math.imul(hash, 0x01000193);
        hash ^= (code >> 8) & 0xff;
        hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
}
/**
 * Map a hash to a `[0, 1)` float. Splitting hash space here (vs. a modulo
 * by total weight) keeps the bucket boundaries stable when an experiment
 * changes a variant's weight — only the users straddling the moved boundary
 * flip variants, instead of every user re-rolling.
 */
function hashToUnit(experiment, distinctId) {
    // Experiment key is salted in so the same user lands in different
    // buckets across experiments (independent assignments).
    const salted = `${experiment}::${distinctId}`;
    return fnv1a32(salted) / 0x100000000;
}
function saltedHashToUnit(salt, experiment, distinctId) {
    return fnv1a32(`${salt}\u0000${experiment}\u0000${distinctId}`) / 0x100000000;
}
/**
 * Mercury-owned assignment for future experiments. Enrollment and variant
 * selection use different salts, so changing rollout cannot correlate the
 * enrolled cohort with arm boundaries. PostHog never participates.
 */
export function bucketMercuryV2(entry, distinctId) {
    if (entry.status !== "running" || entry.variants.length === 0) {
        return { enrolled: false, variant: "control" };
    }
    const enrollmentPercent = Math.min(100, Math.max(0, entry.enrollmentPercent ?? 100));
    const enrolled = saltedHashToUnit("mercury-enrollment-v2", entry.key, distinctId) <
        enrollmentPercent / 100;
    if (!enrolled)
        return { enrolled: false, variant: "control" };
    const totalWeight = entry.variants.reduce((sum, variant) => sum + Math.max(0, variant.weight), 0);
    if (totalWeight <= 0)
        return { enrolled: false, variant: "control" };
    const target = saltedHashToUnit("mercury-variant-v2", entry.key, distinctId) * totalWeight;
    let cumulative = 0;
    for (const variant of entry.variants) {
        cumulative += Math.max(0, variant.weight);
        if (target < cumulative)
            return { enrolled: true, variant: variant.key };
    }
    return {
        enrolled: true,
        variant: entry.variants[entry.variants.length - 1]?.key ?? "control",
    };
}
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
export function bucketLocal(entry, distinctId) {
    if (entry.status === "draft" ||
        entry.status === "paused" ||
        entry.status === "shipped")
        return "control";
    if (!entry.variants || entry.variants.length === 0)
        return "control";
    const totalWeight = entry.variants.reduce((sum, v) => sum + Math.max(0, v.weight), 0);
    if (totalWeight <= 0)
        return "control";
    const u = hashToUnit(entry.key, distinctId);
    const target = u * totalWeight;
    let cumulative = 0;
    for (const variant of entry.variants) {
        cumulative += Math.max(0, variant.weight);
        if (target < cumulative)
            return variant.key;
    }
    // Floating-point edge: target equals totalWeight exactly. Last variant.
    return entry.variants[entry.variants.length - 1].key;
}
