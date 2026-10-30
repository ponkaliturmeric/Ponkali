import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

// Pages that are private or transactional — never useful in a search result.
const PRIVATE = ['/admin', '/api/', '/checkout', '/cart', '/order-confirmation/', '/account', '/login', '/register'];

/**
 * Crawlers that feed AI assistants' answers and search features. Listed
 * explicitly (not just under `*`) so there is no ambiguity that they are
 * welcome — being cited by ChatGPT / Perplexity / Google AI Overviews depends on
 * these bots being able to read the guides and FAQ.
 */
const AI_CRAWLERS = [
  'GPTBot',            // OpenAI training
  'OAI-SearchBot',     // ChatGPT search results
  'ChatGPT-User',      // ChatGPT browsing on a user's behalf
  'ClaudeBot',         // Anthropic
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',   // Gemini / AI Overviews grounding
  'Applebot-Extended',
  'Amazonbot',
  'meta-externalagent',
  'Bytespider',
  'CCBot',
  'DuckAssistBot',
  'YouBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE },
      { userAgent: AI_CRAWLERS, allow: '/', disallow: PRIVATE },
    ],
    // Both sitemaps: the page sitemap and the image sitemap (Next 14's typed
    // sitemap cannot carry <image:image>, so images live in their own file).
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/image-sitemap.xml`],
    host: SITE_URL,
  };
}
