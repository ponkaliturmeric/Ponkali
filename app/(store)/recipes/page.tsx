import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, buildMetadata, absoluteUrl, SITE_URL } from '@/lib/seo';
import { RECIPES } from '@/lib/recipes';
import { getFromPrice } from '@/lib/catalog';

export const metadata: Metadata = buildMetadata({
  title: 'Turmeric Recipes: Manjal Paal, Turmeric Rice, Kashayam & More',
  description:
    'South Indian turmeric recipes with exact quantities and timings — turmeric milk (manjal paal), turmeric rice, kashayam and spiced buttermilk, from a third-generation Erode turmeric farm.',
  path: '/recipes',
});

export const revalidate = 3600;

export default async function RecipesPage() {
  const fromPrice = await getFromPrice();

  return (
    <div className="min-h-screen bg-cream">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Recipes', path: '/recipes' },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            '@id': `${SITE_URL}/recipes#collection`,
            name: 'Turmeric Recipes',
            description:
              'South Indian turmeric recipes with exact quantities and timings, from the Ponkali family farm in Erode, Tamil Nadu.',
            url: absoluteUrl('/recipes'),
            inLanguage: 'en-IN',
            isPartOf: { '@id': `${SITE_URL}/#website` },
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: RECIPES.length,
              itemListElement: RECIPES.map((r, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: absoluteUrl(`/recipes/${r.slug}`),
                name: r.name,
              })),
            },
          },
        ]}
      />

      <header className="bg-dark-brown py-16 px-5">
        <div className="max-w-3xl mx-auto">
          <nav aria-label="Breadcrumb" className="text-[12px] text-white/50 mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-1.5">/</span>
            <span className="text-white/70">Recipes</span>
          </nav>
          <h1 className="font-hero text-[32px] md:text-[44px] font-extrabold text-white tracking-tight leading-[1.1] mb-5">
            Turmeric recipes, with the quantities that actually work
          </h1>
          <p className="text-white/75 text-[17px] leading-[1.8]">
            Most turmeric recipes online tell you to add turmeric and leave you guessing how much.
            Too much is bitter, too little is pointless, and in hot oil it burns in ten seconds.
            These are the quantities and timings used in our own kitchen in Erode.
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 py-14">
        <div className="grid sm:grid-cols-2 gap-6">
          {RECIPES.map((r) => (
            <Link
              key={r.slug}
              href={`/recipes/${r.slug}`}
              className="group bg-white rounded-2xl border border-black/6 overflow-hidden hover:border-gold/50 transition-colors"
            >
              <div className="relative aspect-[16/10] bg-cream">
                <Image
                  src={r.image}
                  alt={r.imageAlt}
                  fill
                  className="object-contain p-5"
                  sizes="(max-width: 640px) 100vw, 400px"
                />
              </div>
              <div className="p-6">
                <p className="text-gold text-[11px] font-semibold tracking-[0.25em] uppercase mb-2">{r.tamilName}</p>
                <h2 className="font-bold text-dark-brown text-[18px] mb-2 group-hover:text-gold transition-colors">
                  {r.name}
                </h2>
                <p className="text-gray-600 text-[14px] leading-[1.7] mb-3">{r.description}</p>
                <p className="text-gray-400 text-[12px]">
                  {r.recipeYield} · prep {r.prepTime.replace('PT', '').toLowerCase()}
                  {r.cookTime !== 'PT0M' && ` · cook ${r.cookTime.replace('PT', '').toLowerCase()}`}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-dark-brown rounded-2xl p-8 md:p-10 text-center">
          <h2 className="font-hero text-[24px] md:text-[28px] font-extrabold text-white tracking-tight mb-3">
            All of these need one thing
          </h2>
          <p className="text-white/70 text-[15px] leading-[1.75] mb-7 max-w-lg mx-auto">
            Turmeric you can taste the difference in. Ours is grown, ground and packed on one family
            farm in the GI-tagged Erode belt — no added colour, nothing to mask.
          </p>
          <Link
            href="/shop"
            className="bg-gold text-dark-brown px-9 py-3.5 rounded-full font-bold text-[15px] inline-block hover:bg-yellow-500 transition-colors"
          >
            Shop from ₹{fromPrice}
          </Link>
        </div>
      </div>
    </div>
  );
}
