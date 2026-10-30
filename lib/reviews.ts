/**
 * Real customer reviews, for the Product schema's aggregateRating.
 *
 * Star ratings in a Google result are the single biggest click-through lever a
 * small shop has — a 4.8★ line under your link typically beats a competitor
 * without one even from a lower position.
 *
 * This file is EMPTY ON PURPOSE. Review snippets are only legitimate when the
 * reviews are genuine and visibly published on the page they describe. Inventing
 * them is both against Google's policy (manual action: the whole site loses rich
 * results) and against consumer law in India. So the schema below activates
 * itself the moment you paste in real reviews, and emits nothing until then.
 *
 * How to collect them, in order of ease:
 *   1. Your WhatsApp conversations. When a repeat customer says the turmeric was
 *      good, ask "can I put that on the website with your first name?" — a yes
 *      in writing is consent. Paste it here verbatim.
 *   2. A line in the order-confirmation WhatsApp asking for one sentence back.
 *   3. Google Business Profile reviews (those show in Maps on their own; do not
 *      copy them here, Google already has them).
 *
 * Keep them verbatim, keep the consent, and remove any you cannot vouch for.
 */

export interface CustomerReview {
  /** First name is enough, and is what most customers agree to. */
  author: string;
  /** 1–5. */
  rating: number;
  /** The customer's own words. Do not polish them. */
  body: string;
  /** ISO date (YYYY-MM-DD) the review was given. */
  date: string;
  /** Which pack they bought, when known — e.g. 'turmeric-250g'. */
  slug?: string;
}

export const REVIEWS: CustomerReview[] = [
  // Example of the shape — delete this comment and add real ones:
  // { author: 'Priya', rating: 5, body: 'The colour is much deeper than the packet I used to buy.', date: '2026-10-21', slug: 'turmeric-250g' },
];

export interface ReviewAggregate {
  ratingValue: number;
  reviewCount: number;
}

/** Average rating across all reviews, or null when there are none. */
export function reviewAggregate(slug?: string): ReviewAggregate | null {
  const pool = slug ? REVIEWS.filter((r) => !r.slug || r.slug === slug) : REVIEWS;
  if (pool.length === 0) return null;
  const sum = pool.reduce((s, r) => s + r.rating, 0);
  return {
    ratingValue: Math.round((sum / pool.length) * 10) / 10,
    reviewCount: pool.length,
  };
}

/** The reviews to show on a given product page (most recent first). */
export function reviewsFor(slug?: string): CustomerReview[] {
  return REVIEWS.filter((r) => !slug || !r.slug || r.slug === slug)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
}
