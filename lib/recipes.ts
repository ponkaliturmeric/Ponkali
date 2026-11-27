import type { FaqItem } from './content';

/**
 * Recipes.
 *
 * Why this exists rather than more buying guides: recipe searches are the
 * largest category of turmeric query there is ("turmeric milk", "manjal paal",
 * "turmeric rice"), and a Recipe rich result shows a PHOTO, a cook time and a
 * rating in the search listing — which beats a plain blue link on click-through
 * by a wide margin. No other Erode turmeric seller is competing for them.
 *
 * They also sell honestly: someone looking up how to make manjal paal needs
 * turmeric, and the page can say "use a quarter teaspoon of a turmeric you
 * trust" without a word of sales copy.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TWO RULES FOR ANYTHING ADDED HERE
 *
 * 1. NO HEALTH CLAIMS. Not "boosts immunity", not "anti-inflammatory", not
 *    "cures" anything. These are food pages, and in India a health claim on a
 *    food product invites FSSAI trouble on top of being dishonest. Saying a
 *    drink is "traditionally taken at night" describes a custom; saying it
 *    "fights infection" is a medical claim. Stay on the first side of that
 *    line.
 *
 * 2. THE RECIPE MUST ACTUALLY WORK. Quantities, times and order are the point.
 *    A recipe page that ranks and then disappoints costs more than it earns.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface RecipeStep {
  /** One instruction. Kept short — schema.org renders these as a numbered list. */
  text: string;
}

export interface Recipe {
  slug: string;
  /** Search-intent title. */
  name: string;
  /** Tamil name, shown on the page and used as a schema keyword. */
  tamilName: string;
  /** ~150 chars for the meta description. */
  description: string;
  /** Lead paragraph. */
  intro: string;
  /** ISO 8601 durations, e.g. 'PT5M' — required by Recipe structured data. */
  prepTime: string;
  cookTime: string;
  /** Human-readable, e.g. '1 cup' or 'Serves 2'. */
  recipeYield: string;
  category: string;
  cuisine: string;
  /** How much of OUR product the recipe uses — the honest selling point. */
  turmericUsed: string;
  ingredients: string[];
  steps: RecipeStep[];
  /** Practical notes that stop the recipe going wrong. */
  tips: string[];
  faq?: FaqItem[];
  keywords: string[];
  published: string;
  updated: string;
  /**
   * Hero image. All four currently point at ingredient and farm photography
   * because there is no food photography on the site yet.
   *
   * A Recipe rich result is built around the dish photo, so these pages will
   * rank long before they look good in search. Four phone photos — the finished
   * glass of manjal paal, the bowl of turmeric rice, the strained kashayam, the
   * tumbler of buttermilk — are the single highest-value thing anyone can add
   * to this file. Drop them in /public/images/recipes/ and swap the paths.
   */
  image: string;
  imageAlt: string;
}

export const RECIPES: Recipe[] = [
  {
    slug: 'turmeric-milk-manjal-paal',
    name: 'Turmeric Milk (Manjal Paal)',
    tamilName: 'மஞ்சள் பால்',
    description:
      'How to make turmeric milk the South Indian way: the right quantity of turmeric, why it is simmered rather than stirred in cold, and how to keep it from tasting bitter or chalky.',
    intro:
      'Manjal paal is the oldest thing anyone does with turmeric in a Tamil kitchen, and the easiest to get slightly wrong. Too much turmeric and it turns bitter; stirred into cold milk and it stays gritty. A quarter teaspoon, simmered properly, is all it takes.',
    prepTime: 'PT2M',
    cookTime: 'PT6M',
    recipeYield: '1 cup (serves 1)',
    category: 'Drink',
    cuisine: 'South Indian',
    turmericUsed: '¼ teaspoon per cup — about 1g, so a 100g pack makes roughly 100 cups',
    ingredients: [
      '1 cup whole milk (or any milk you prefer)',
      '¼ teaspoon turmeric powder',
      '1 to 2 teaspoons jaggery, palm sugar or honey, to taste',
      '1 pinch freshly crushed black pepper (optional, traditional)',
      '¼ teaspoon dry ginger powder or 1 crushed cardamom pod (optional)',
    ],
    steps: [
      { text: 'Pour the milk into a small pan and warm it over a low flame until it is steaming but not yet boiling.' },
      { text: 'Add the turmeric powder and whisk briskly so no lumps sit on the surface. Add the pepper and ginger or cardamom now if using.' },
      { text: 'Keep it on the lowest flame for 4 to 5 minutes, stirring now and then. This is the step people skip, and it is what takes the raw edge off the turmeric and lets the colour bloom properly.' },
      { text: 'Take the pan off the heat. Let it sit for a minute, then stir in the jaggery or honey — adding sweetener off the heat keeps honey from turning harsh and stops jaggery splitting the milk.' },
      { text: 'Strain into a glass if you used whole spices. Drink it warm.' },
    ],
    tips: [
      'A quarter teaspoon per cup is the line. Half a teaspoon is where most people decide they dislike turmeric milk.',
      'If it tastes chalky, the turmeric did not get its few minutes of simmering. There is no shortcut for that step.',
      'Pure turmeric gives a deep yellow that develops as it heats. A powder that flashes bright orange the second it touches liquid usually has colour added — our guide on testing turmeric at home covers how to check.',
      'Add jaggery off the heat. Dropping it into simmering milk is the usual reason a batch curdles.',
    ],
    faq: [
      {
        question: 'How much turmeric powder should I use in one cup of milk?',
        answer:
          'A quarter teaspoon, roughly 1 gram, per cup. That is enough for full colour and flavour without bitterness. Going heavier does not make it better — it makes it sharp, and it is the most common reason people give up on manjal paal.',
      },
      {
        question: 'Why does my turmeric milk taste bitter?',
        answer:
          'Almost always too much turmeric, or turmeric added to milk that is already boiling hard. Keep to a quarter teaspoon and simmer it gently for four or five minutes on the lowest flame.',
      },
      {
        question: 'Can I make turmeric milk without sugar or jaggery?',
        answer:
          'Yes. Unsweetened manjal paal with a pinch of pepper is how it is often drunk at home. If it tastes flat, a crushed cardamom pod does more for it than extra sweetener.',
      },
      {
        question: 'Should I use fresh turmeric or turmeric powder?',
        answer:
          'Either works. Fresh rhizome gives a lighter, greener taste and needs about a one-inch piece, crushed, per cup. Powder is more consistent and keeps for months, which is why most households use it.',
      },
    ],
    keywords: [
      'turmeric milk recipe', 'manjal paal', 'golden milk recipe', 'how to make turmeric milk',
      'haldi doodh recipe', 'turmeric milk at night', 'manjal paal seimurai',
    ],
    published: '2026-11-27',
    updated: '2026-11-27',
    image: '/images/new-prd-img0.png',
    imageAlt: 'Ponkali Erode turmeric powder, the turmeric used for manjal paal',
  },

  {
    slug: 'turmeric-rice-manjal-sadam',
    name: 'Turmeric Rice (Manjal Sadam)',
    tamilName: 'மஞ்சள் சாதம்',
    description:
      'A 10-minute South Indian turmeric rice made from leftover cooked rice, with the one step that decides whether the turmeric tastes toasted or raw.',
    intro:
      'Manjal sadam is what a Tamil kitchen does with yesterday’s rice. It takes ten minutes, needs nothing unusual, and the whole dish turns on one detail: turmeric burns in seconds, so it goes in off the heat.',
    prepTime: 'PT5M',
    cookTime: 'PT8M',
    recipeYield: 'Serves 2',
    category: 'Main course',
    cuisine: 'South Indian',
    turmericUsed: '½ teaspoon for two servings',
    ingredients: [
      '2 cups cooked rice, cooled (day-old is better than fresh)',
      '½ teaspoon turmeric powder',
      '2 tablespoons groundnut oil, coconut oil or ghee',
      '1 teaspoon mustard seeds',
      '1 teaspoon split urad dal',
      '2 tablespoons raw peanuts or cashews',
      '1 sprig curry leaves',
      '1 to 2 green chillies, slit',
      '1 pinch asafoetida',
      'Salt, to taste',
      'Juice of ½ lemon (optional)',
    ],
    steps: [
      { text: 'Spread the cooked rice on a plate and separate the grains with a fork. Warm rice straight from the cooker will turn to paste when you mix it.' },
      { text: 'Heat the oil in a kadai over medium heat. Add the mustard seeds and wait until they finish popping.' },
      { text: 'Add the urad dal and peanuts and fry until both are golden. Add the curry leaves, green chillies and asafoetida and let them crackle for a few seconds.' },
      { text: 'Turn the heat OFF. Now add the turmeric powder and stir once in the hot oil. Off the heat it toasts; left on the flame it scorches and goes bitter within about ten seconds.' },
      { text: 'Add the rice and salt. Fold gently until every grain is evenly coloured — folding, not stirring, so the grains stay whole.' },
      { text: 'Squeeze over the lemon if using and serve warm, with curd or a fried papad.' },
    ],
    tips: [
      'Turning the heat off before the turmeric goes in is the whole recipe. Burnt turmeric is bitter and cannot be rescued.',
      'Day-old refrigerated rice behaves far better than fresh. Fresh rice is too moist and clumps.',
      'Fold from underneath rather than stirring in circles, or you will end up with yellow rice porridge.',
      'For a richer version, finish with a teaspoon of ghee off the heat.',
    ],
    faq: [
      {
        question: 'How much turmeric do I need for turmeric rice?',
        answer:
          'Half a teaspoon for two cups of cooked rice. That gives an even golden colour. More turns the dish bitter and muddies the look rather than brightening it.',
      },
      {
        question: 'Why did my turmeric rice turn bitter?',
        answer:
          'The turmeric was added while the pan was still on the flame. Turmeric powder scorches in about ten seconds in hot oil. Switch the heat off first, then add it.',
      },
      {
        question: 'Can I use freshly cooked rice?',
        answer:
          'You can, but spread it out and let it cool for ten minutes first. Hot, moist rice clumps as soon as you fold the tempering through it.',
      },
    ],
    keywords: [
      'turmeric rice recipe', 'manjal sadam', 'yellow rice recipe south indian',
      'turmeric rice with leftover rice', 'manjal sadam seimurai',
    ],
    published: '2026-11-27',
    updated: '2026-11-27',
    image: '/images/product-1.jpeg',
    imageAlt: 'Ponkali Erode turmeric powder used for South Indian turmeric rice',
  },

  {
    slug: 'turmeric-kashayam-turmeric-tea',
    name: 'Turmeric Kashayam (Turmeric Tea)',
    tamilName: 'மஞ்சள் கஷாயம்',
    description:
      'The South Indian turmeric kashayam: turmeric, ginger and pepper simmered in water, strained and sweetened with jaggery. Quantities, timings and how to keep it from going bitter.',
    intro:
      'Kashayam is the water-based cousin of manjal paal — turmeric, ginger and pepper simmered together and strained. It takes one pan and about eight minutes, and it is what gets made at home when nobody wants milk.',
    prepTime: 'PT3M',
    cookTime: 'PT8M',
    recipeYield: '1 cup (serves 1)',
    category: 'Drink',
    cuisine: 'South Indian',
    turmericUsed: '¼ teaspoon per cup',
    ingredients: [
      '1½ cups water (it reduces to about one cup)',
      '¼ teaspoon turmeric powder',
      '½ inch fresh ginger, crushed, or ¼ teaspoon dry ginger powder',
      '3 to 4 black peppercorns, crushed',
      '1 teaspoon jaggery or palm sugar, to taste',
      '2 or 3 tulsi leaves (optional)',
      'A squeeze of lemon, off the heat (optional)',
    ],
    steps: [
      { text: 'Bring the water to a boil in a small pan.' },
      { text: 'Add the crushed ginger and peppercorns, lower the flame and simmer for 3 minutes so they open up.' },
      { text: 'Add the turmeric powder and simmer for another 4 to 5 minutes on a low flame, until the water has reduced by about a third and turned deep gold.' },
      { text: 'Switch off the heat. Add the tulsi leaves if using and let it stand, covered, for 2 minutes.' },
      { text: 'Strain into a cup. Stir in the jaggery, and the lemon if you want it — both go in off the heat.' },
    ],
    tips: [
      'Simmer, never boil hard. A rolling boil makes turmeric taste harsh and dulls the colour.',
      'Crush the pepper rather than using it whole or ground — whole gives you nothing, ground makes it gritty.',
      'Add lemon only after straining and off the heat. Adding it while hot gives it a metallic edge.',
      'Make double and keep the second cup in a flask. It holds for a few hours, though it is best fresh.',
    ],
    faq: [
      {
        question: 'What is the difference between turmeric kashayam and turmeric milk?',
        answer:
          'Kashayam is simmered in water and strained, so it is lighter and sharper, with ginger and pepper leading. Manjal paal is made with milk and is rounder and sweeter. Same turmeric, same quarter teaspoon per cup.',
      },
      {
        question: 'How long should turmeric kashayam be simmered?',
        answer:
          'About eight minutes in total — three for the ginger and pepper, then four or five once the turmeric goes in. Enough to reduce by a third. Longer than that and it turns bitter rather than stronger.',
      },
      {
        question: 'Can I make kashayam without jaggery?',
        answer:
          'Yes, and plenty of households do. Unsweetened it is noticeably sharper; a little jaggery mostly rounds off the pepper.',
      },
    ],
    keywords: [
      'turmeric kashayam', 'turmeric tea recipe', 'manjal kashayam', 'turmeric water recipe',
      'how to make turmeric tea', 'kashayam seimurai',
    ],
    published: '2026-11-27',
    updated: '2026-11-27',
    image: '/images/turmeric-har.jpeg',
    imageAlt: 'Freshly harvested Erode turmeric, the source of the powder used in kashayam',
  },

  {
    slug: 'turmeric-buttermilk-neer-mor',
    name: 'Turmeric Buttermilk (Neer Mor)',
    tamilName: 'மஞ்சள் நீர் மோர்',
    description:
      'Spiced South Indian buttermilk with turmeric — a five-minute summer drink. How much turmeric to use so it stays savoury rather than turning bitter.',
    intro:
      'Neer mor is what gets handed to you at a Tamil Nadu house in April. Thin buttermilk, salt, curry leaves, ginger, green chilli, and a little turmeric for colour and a faint earthiness. Five minutes, no cooking, and it is better made an hour ahead.',
    prepTime: 'PT5M',
    cookTime: 'PT0M',
    recipeYield: '2 glasses',
    category: 'Drink',
    cuisine: 'South Indian',
    turmericUsed: '⅛ to ¼ teaspoon for two glasses — less than the hot drinks need',
    ingredients: [
      '½ cup thick curd, whisked smooth',
      '2 cups cold water',
      '⅛ to ¼ teaspoon turmeric powder',
      '½ inch ginger, finely grated',
      '1 green chilli, finely chopped or crushed',
      '1 sprig curry leaves, torn',
      '1 pinch asafoetida',
      'Salt, to taste',
      'Chopped coriander, to finish (optional)',
    ],
    steps: [
      { text: 'Whisk the curd in a jug until completely smooth, with no lumps left.' },
      { text: 'Add the cold water a little at a time, whisking, until it is thin and even.' },
      { text: 'Whisk in the turmeric. Start at an eighth of a teaspoon — in a cold, uncooked drink turmeric stays raw and asserts itself far more than it does in hot milk.' },
      { text: 'Stir in the ginger, green chilli, torn curry leaves, asafoetida and salt.' },
      { text: 'Chill for at least 30 minutes so the curry leaves and ginger infuse. Stir again, scatter over the coriander and serve cold.' },
    ],
    tips: [
      'Use less turmeric here than in a hot drink. Nothing cooks the raw edge off, so a quarter teaspoon is the ceiling for two glasses.',
      'Tear the curry leaves rather than dropping them in whole — torn leaves actually release something.',
      'Made an hour ahead it is a different drink. Straight away it tastes like salted curd water.',
      'If it separates in the fridge, that is normal. Whisk once before pouring.',
    ],
    faq: [
      {
        question: 'How much turmeric goes into buttermilk?',
        answer:
          'An eighth to a quarter teaspoon for two glasses — less than you would use in turmeric milk or kashayam. Buttermilk is never heated, so the turmeric stays raw and tastes stronger for the same quantity.',
      },
      {
        question: 'Can I make neer mor in advance?',
        answer:
          'Yes, and it improves. Make it up to half a day ahead and keep it refrigerated. Whisk before serving, since it separates as it stands.',
      },
    ],
    keywords: [
      'turmeric buttermilk', 'neer mor recipe', 'spiced buttermilk south indian',
      'manjal mor', 'summer buttermilk drink', 'neer mor seimurai',
    ],
    published: '2026-11-27',
    updated: '2026-11-27',
    image: '/images/product-2.jpeg',
    imageAlt: 'Ponkali Erode turmeric powder, used for South Indian spiced buttermilk',
  },
];

export function getRecipe(slug: string): Recipe | undefined {
  return RECIPES.find((r) => r.slug === slug);
}
