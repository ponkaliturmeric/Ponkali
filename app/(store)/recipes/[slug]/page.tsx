import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import Faq from '@/components/Faq';
import { breadcrumbJsonLd, buildMetadata, absoluteUrl, SITE_URL, BUSINESS } from '@/lib/seo';
import { RECIPES, getRecipe } from '@/lib/recipes';
import { getFromPrice } from '@/lib/catalog';

export function generateStaticParams() {
  return RECIPES.map((r) => ({ slug: r.slug }));
}
/** Fixed list of recipes — anything else is a true 404, not a soft one. */
export const dynamicParams = false;
export const revalidate = 60;

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const recipe = getRecipe(params.slug);
  if (!recipe) return buildMetadata({ title: 'Recipe', path: `/recipes/${params.slug}`, noindex: true });
  return buildMetadata({
    title: `${recipe.name} Recipe — Step by Step`,
    description: recipe.description,
    path: `/recipes/${recipe.slug}`,
    images: [{ url: recipe.image, alt: recipe.imageAlt }],
  });
}

export default async function RecipePage({ params }: { params: { slug: string } }) {
  const recipe = getRecipe(params.slug);
  if (!recipe) notFound();
  const fromPrice = await getFromPrice();
  const others = RECIPES.filter((r) => r.slug !== recipe.slug);

  return (
    <article className="min-h-screen bg-cream">
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Recipe',
            '@id': `${SITE_URL}/recipes/${recipe.slug}#recipe`,
            name: recipe.name,
            description: recipe.description,
            image: [absoluteUrl(recipe.image)],
            author: { '@id': `${SITE_URL}/#organization` },
            publisher: { '@id': `${SITE_URL}/#organization` },
            datePublished: recipe.published,
            dateModified: recipe.updated,
            prepTime: recipe.prepTime,
            cookTime: recipe.cookTime,
            // totalTime is required for the rich result; derived so it can
            // never contradict the two parts above.
            totalTime: `PT${
              (parseInt(recipe.prepTime.match(/(\d+)M/)?.[1] ?? '0', 10) +
                parseInt(recipe.cookTime.match(/(\d+)M/)?.[1] ?? '0', 10))
            }M`,
            recipeYield: recipe.recipeYield,
            recipeCategory: recipe.category,
            recipeCuisine: recipe.cuisine,
            recipeIngredient: recipe.ingredients,
            recipeInstructions: recipe.steps.map((s, i) => ({
              '@type': 'HowToStep',
              position: i + 1,
              text: s.text,
            })),
            keywords: recipe.keywords.join(', '),
            inLanguage: 'en-IN',
            // Deliberately NO nutrition block and no health claims: these are
            // food pages, and an unverified nutrition figure is worse than none.
          },
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Recipes', path: '/recipes' },
            { name: recipe.name, path: `/recipes/${recipe.slug}` },
          ]),
        ]}
      />

      <header className="bg-dark-brown py-16 px-5">
        <div className="max-w-3xl mx-auto">
          <nav aria-label="Breadcrumb" className="text-[12px] text-white/50 mb-6">
            <Link href="/" className="hover:text-white">Home</Link> <span className="mx-1.5">/</span>
            <Link href="/recipes" className="hover:text-white">Recipes</Link>
          </nav>
          <p className="text-gold/70 text-[11px] font-semibold tracking-[0.3em] uppercase mb-4">{recipe.tamilName}</p>
          <h1 className="font-hero text-[32px] md:text-[44px] font-extrabold text-white tracking-tight leading-[1.1] mb-5">
            {recipe.name}
          </h1>
          <p className="text-white/75 text-[17px] leading-[1.75]">{recipe.intro}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-7 text-[13px] text-white/60">
            <span>Prep {recipe.prepTime.replace('PT', '').toLowerCase()}</span>
            <span>Cook {recipe.cookTime.replace('PT', '').toLowerCase() || '0m'}</span>
            <span>{recipe.recipeYield}</span>
            <span>{recipe.cuisine}</span>
          </div>
          <p className="text-white/40 text-[12px] mt-6">
            By {BUSINESS.brand}, Erode · Updated{' '}
            {new Date(recipe.updated).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 py-14">
        <div className="relative aspect-[16/9] rounded-3xl overflow-hidden mb-12 bg-white">
          <Image
            src={recipe.image}
            alt={recipe.imageAlt}
            fill
            className="object-contain p-6"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>

        {/* Ingredients */}
        <section className="mb-12">
          <h2 className="font-hero text-[26px] md:text-[30px] font-extrabold text-dark-brown tracking-tight mb-6">
            Ingredients
          </h2>
          <ul className="bg-white rounded-2xl border border-black/6 divide-y divide-black/5">
            {recipe.ingredients.map((ing) => (
              <li key={ing} className="px-6 py-3.5 text-[16px] text-gray-700 leading-[1.6]">{ing}</li>
            ))}
          </ul>
          <p className="text-[14px] text-gray-500 mt-4 leading-[1.7]">
            <strong className="text-dark-brown">Turmeric:</strong> {recipe.turmericUsed}.{' '}
            <Link href="/shop" className="text-gold font-semibold hover:underline">
              Ponkali Erode turmeric from ₹{fromPrice}
            </Link>
          </p>
        </section>

        {/* Method */}
        <section className="mb-12">
          <h2 className="font-hero text-[26px] md:text-[30px] font-extrabold text-dark-brown tracking-tight mb-6">
            Method
          </h2>
          <ol className="space-y-5">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/20 text-dark-brown font-bold text-[14px] flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-[16px] text-gray-700 leading-[1.8] pt-1">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Tips */}
        <section className="mb-12">
          <h2 className="font-hero text-[26px] md:text-[30px] font-extrabold text-dark-brown tracking-tight mb-6">
            Getting it right
          </h2>
          <ul className="space-y-3">
            {recipe.tips.map((tip) => (
              <li key={tip} className="flex gap-3 text-[16px] text-gray-700 leading-[1.8]">
                <span className="text-gold flex-shrink-0" aria-hidden>·</span>
                {tip}
              </li>
            ))}
          </ul>
        </section>

        {/* Cross-links */}
        <section className="bg-dark-brown rounded-2xl p-8">
          <h2 className="font-hero text-[20px] font-extrabold text-white tracking-tight mb-5">More to cook and read</h2>
          <ul className="space-y-3 text-[15px]">
            {others.map((r) => (
              <li key={r.slug}>
                <Link href={`/recipes/${r.slug}`} className="text-gold font-medium hover:underline">{r.name}</Link>
              </li>
            ))}
            <li>
              <Link href="/guides/how-to-check-turmeric-purity-at-home" className="text-white/70 font-medium hover:underline">
                How to test turmeric purity at home
              </Link>
            </li>
            <li>
              <Link href="/guides/best-turmeric-powder-in-india-how-to-choose" className="text-white/70 font-medium hover:underline">
                Choosing a turmeric powder worth cooking with
              </Link>
            </li>
          </ul>
        </section>
      </div>

      {recipe.faq && recipe.faq.length > 0 && (
        <Faq items={recipe.faq} eyebrow="Questions" title={`${recipe.name}, answered`} />
      )}
    </article>
  );
}
