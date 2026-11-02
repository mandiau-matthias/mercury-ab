/**
 * Targeting predicates — declarative builders for `RegistryEntry.targeting`.
 *
 * Pure functions; same input → same output on server and client. This is the
 * non-negotiable property: if a server bootstrap enrolls a user but the
 * client targeting check excludes them, the variant flickers OR the
 * exposure event fires for a user who never saw the variant.
 *
 * Composition is via `target.all(...)` (AND) and `target.any(...)` (OR).
 * Negation via `target.not(rule)`. Anything more complex than this means
 * you're encoding business logic in the registry — push it back into a
 * named predicate so the registry stays declarative.
 */
import type { TargetingContext, TargetingRule } from "./types.js";
/** Include when the request locale matches one of `slugs` (case-insensitive). */
declare function locale(...slugs: string[]): TargetingRule;
/** Include when the role matches one of `slugs` (case-insensitive). */
declare function role(...slugs: string[]): TargetingRule;
/**
 * Sample-percentage holdout — include `pct`% of users (deterministic per
 * `distinctId`-equivalent salt). Works as a holdout: pass `pct: 90` to run
 * the experiment on 90% of traffic and leave 10% as a permanent control.
 *
 * `salt` namespaces the sampling so two `sample(50, 'foo')` calls in
 * different experiments select INDEPENDENT halves of the population — without
 * a salt, every 50% experiment would target the same users.
 *
 * Note: distinct ID isn't on the targeting context (which is by design — the
 * context is per-render, the ID is per-session). We salt with locale + role
 * to keep the bucket stable per user without dragging the ID into the
 * targeting surface. This means two experiments with the same `salt` and
 * the same user will share enrollment, which is usually what you want for
 * mutually exclusive experiment groups.
 */
declare function sample(pct: number, salt: string): TargetingRule;
/** Composition: AND. Empty list = include everyone (vacuous truth). */
declare function all(...rules: TargetingRule[]): TargetingRule;
/** Composition: OR. Empty list = exclude everyone (vacuous false). */
declare function any(...rules: TargetingRule[]): TargetingRule;
declare function not(rule: TargetingRule): TargetingRule;
/**
 * Builder API — re-exported as a single namespace so registry entries read
 * declaratively:
 *
 *   targeting: target.all(target.locale('nl', 'fr'), target.anonymous)
 */
export declare const target: {
    always: TargetingRule;
    never: TargetingRule;
    locale: typeof locale;
    authenticated: TargetingRule;
    anonymous: TargetingRule;
    role: typeof role;
    sample: typeof sample;
    all: typeof all;
    any: typeof any;
    not: typeof not;
};
/**
 * Default targeting context for environments where we can't build one
 * (server-side render with no request, isolated test, fallback layout
 * branches that lost the request scope).
 *
 * IMPORTANT — this is NOT fail-open for locale-restricted experiments.
 *
 * `target.locale('nl', 'be')` is a Set-membership check; `'unknown'` is
 * not in the set, so any experiment with a locale predicate will EXCLUDE
 * users evaluated against this default. Same goes for `target.role(...)`
 * and `target.authenticated`.
 *
 * In production, every code path mounts the provider with a real
 * `TargetingContext` derived from the request (see `buildTargetingContext`
 * in layout-helpers.ts). This default is only reached when:
 *   - A unit test calls a server helper without passing targeting.
 *   - A future caller of `resolveBootstrapFromCookies` forgets the second
 *     argument.
 *   - The layout's catch-block fallback runs (which still derives a real
 *     locale; only role + auth state are unknown).
 *
 * Predicate authors should keep this in mind when composing rules:
 *   `target.any(target.locale('nl'), target.always)`
 * fails open even if locale is unknown, while bare `target.locale('nl')`
 * fails closed.
 */
export declare const DEFAULT_TARGETING_CONTEXT: TargetingContext;
/** A broken predicate excludes the visitor from measurement. */
export declare function passesTargeting(entry: {
    targeting?: TargetingRule;
}, context: TargetingContext): boolean;
export {};
