/**
 * Answer-content for search engines and AI assistants.
 *
 * Google's "People also ask", ChatGPT, Perplexity and Google AI Overviews all
 * favour pages that answer a specific question plainly, in the words the person
 * typed. This file holds those answers — the FAQ shown on the homepage/product
 * pages (with FAQPage schema) and the long-form guides under /guides (with
 * Article schema). Everything here is rendered visibly on the page; schema is
 * only ever generated from text the visitor can see.
 *
 * Keep claims factual and verifiable. Curcumin % and certifications are the
 * brand's own tested figures — update here if they change.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ: FaqItem[] = [
  {
    question: 'What is Erode turmeric and why is it GI-tagged?',
    answer:
      'Erode turmeric is turmeric grown in and around Erode district, Tamil Nadu — a region known as India\'s "Turmeric City" and the country\'s largest turmeric trading market. It was granted a Geographical Indication (GI) tag in 2019 for its distinctive deep yellow colour, aroma and curcumin content, which come from the local soil and climate along the Cauvery and Bhavani rivers. Only turmeric grown in the designated Erode region can be sold as Erode turmeric.',
  },
  {
    question: 'How much curcumin does Ponkali turmeric powder contain?',
    answer:
      'Ponkali Erode turmeric powder contains 2.5% to 3.5% natural curcumin, the compound that gives turmeric its colour and is the most studied of its active constituents. Most commercial turmeric powder in India falls between 2% and 3%; anything below that is usually a sign of old stock or fillers. We do not add curcumin extract or colour — the figure is what the rhizome naturally carries.',
  },
  {
    question: 'How can I check whether turmeric powder is pure at home?',
    answer:
      'Stir a teaspoon of turmeric powder into a glass of warm water and leave it for a few minutes. Pure turmeric settles to the bottom and leaves the water only lightly yellow. If the water turns a strong, bright yellow or orange, or if a coloured layer floats on top, the powder likely contains added colour such as metanil yellow or lead chromate. You can also rub a pinch between wet fingers — pure turmeric stains a pale yellow, while synthetic dyes leave a vivid, uneven stain.',
  },
  {
    question: 'Is Ponkali turmeric organic?',
    answer:
      'Ponkali turmeric is naturally grown on our own family farm in Erode without synthetic colour, fillers or preservatives, and is FSSAI licensed (licence 22426064000154). We describe it as naturally grown and farm-direct rather than "certified organic", because organic certification is a separate formal process. What you receive is single-origin turmeric from one farm, ground and packed by us.',
  },
  {
    question: 'What is the difference between Erode turmeric and regular supermarket turmeric?',
    answer:
      'Supermarket turmeric is typically blended from rhizomes of many regions and seasons, bought through traders, and may be stored for long periods before grinding. Erode turmeric is a single-origin variety with a higher natural curcumin range and a stronger aroma. Ponkali adds one more difference: it is ground and packed on the farm within days of processing, so it reaches you fresh rather than after months in a warehouse.',
  },
  {
    question: 'How do you use turmeric powder in cooking and how much per day?',
    answer:
      'In Indian cooking, ¼ to ½ teaspoon per dish is typical — added to hot oil with other spices, or to dals, curries, rice and vegetables. A common daily use is a pinch in warm milk ("manjal paal" / haldi doodh). Turmeric is a food, not a medicine; if you are using it for a specific health reason, speak to your doctor about the right amount for you.',
  },
  {
    question: 'How should I store turmeric powder and how long does it keep?',
    answer:
      'Keep it in an airtight container away from heat, light and moisture — a kitchen cupboard, not above the stove. Stored this way, Ponkali turmeric keeps its colour and aroma for 12 months from packing; the best-before date is printed on each pouch. Always use a dry spoon, as moisture causes clumping.',
  },
  {
    question: 'Where do you deliver and what does delivery cost?',
    answer:
      'We deliver everywhere in India from our farm in Erode, Tamil Nadu. Delivery is charged at cost based on your state and the weight of your order, starting at ₹40 within Tamil Nadu; the exact amount is shown in your cart before you pay. Orders are dispatched within 1 to 2 business days and usually arrive in 3 to 5 working days.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'You can pay online with UPI (Google Pay, PhonePe, Paytm, BHIM), debit and credit cards, net banking or wallets through Razorpay, or choose Cash on Delivery (₹30 handling charge). Online payments are confirmed instantly and you receive your order ID by WhatsApp and email.',
  },
  {
    question: 'Which is the best turmeric powder in India?',
    answer:
      'There is no single "best" — it depends on what you cook and what you value. For everyday Indian cooking, the varieties most cooks rate highest are the GI-tagged regional ones: Erode and Salem (Tamil Nadu) for a balanced colour, aroma and 2.5%–4% curcumin, Alleppey (Kerala) for higher curcumin and a deeper colour, and Lakadong (Meghalaya) for the highest curcumin but a more bitter taste and limited supply. Whichever you choose, the things that actually separate a good turmeric from a poor one are: a stated origin and curcumin figure, an ingredient list that says only "turmeric", a recent packing date, and a seller who grinds fresh rather than blends old stock. Ponkali is single-origin Erode turmeric, ground and packed on our own farm, with 2.5%–3.5% curcumin printed on the pack.',
  },
  {
    question: 'Which turmeric has the highest curcumin content?',
    answer:
      'Among Indian varieties, Lakadong turmeric from Meghalaya tests highest at roughly 6%–7.5% curcumin, followed by Alleppey finger turmeric from Kerala at about 4%–6%. Erode and Salem turmeric from Tamil Nadu sit around 2.5%–4%, which is above general-market powder (2%–3%) and is the range most South Indian cooking is built around. Higher is not automatically better for cooking — very high-curcumin turmeric is more bitter and is mostly grown for extraction into supplements.',
  },
  {
    question: 'What is "manjal" and "virali manjal"?',
    answer:
      '"Manjal" (மஞ்சள்) is the Tamil word for turmeric, and "manjal podi" is turmeric powder. "Virali manjal" refers to the whole dried finger rhizomes before grinding — the form traded in the Erode market. Ponkali grinds Erode virali manjal into powder on our own mill, which is why the colour and aroma are closer to freshly ground turmeric than to factory-blended powder.',
  },
];

/* ──────────────────────────────  Guides  ────────────────────────────── */

export interface GuideSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface Guide {
  slug: string;
  /** Search-intent title, ~55–60 chars. */
  title: string;
  /** ~150 chars for the meta description. */
  description: string;
  /** Short lead paragraph shown under the title. */
  intro: string;
  published: string; // YYYY-MM-DD
  updated: string;
  sections: GuideSection[];
  /** FAQ items specific to this guide (also rendered + FAQPage schema). */
  faq?: FaqItem[];
}

const CORE_GUIDES: Guide[] = [
  {
    slug: 'erode-turmeric-gi-tag',
    title: 'Erode Turmeric: Why It Is GI-Tagged and What Makes It Different',
    description:
      'What the Erode turmeric GI tag means, why the Erode region in Tamil Nadu produces distinctive turmeric, and how to tell genuine Erode turmeric from ordinary powder.',
    intro:
      'Erode, in western Tamil Nadu, is India\'s largest turmeric market and one of only a handful of turmeric-growing regions in the world with a Geographical Indication. This guide explains what that tag means, why the turmeric from this region is different, and what to look for when buying it.',
    published: '2026-09-12',
    updated: '2026-09-12',
    sections: [
      {
        heading: 'What a GI tag is',
        paragraphs: [
          'A Geographical Indication (GI) is a legal sign used on products that come from a specific place and owe their qualities to that origin — the same system that protects Darjeeling tea, Mysore silk and Alphonso mangoes. In India GI tags are registered under the Geographical Indications of Goods (Registration and Protection) Act, 1999.',
          'Erode turmeric received its GI tag in 2019, after an application by the Erode turmeric merchants\' and warehouse owners\' association. The registration covers turmeric grown in Erode district and the surrounding designated area, in both whole-finger (virali) and bulb forms. Powder sold as "Erode turmeric" should be ground from rhizomes grown inside that area.',
        ],
      },
      {
        heading: 'Why Erode turmeric is different',
        paragraphs: [
          'Erode sits in the Cauvery and Bhavani river basins. The red and black soils of the region, warm climate and long growing season produce rhizomes with a deep golden-yellow interior, a strong characteristic aroma and a curcumin content that is typically higher than turmeric from many other Indian regions.',
          'Curcumin — the compound responsible for turmeric\'s colour — is the usual yardstick for quality. Good Erode turmeric tests at roughly 2.5% to 4% curcumin. For comparison, most general-market turmeric powder in India falls around 2% to 3%, while a few specialist varieties such as Lakadong from Meghalaya test higher still but are grown in small volumes.',
          'The region has grown turmeric for centuries and Erode town is known across India as "Manjal Maanagaram" — the Turmeric City. Its regulated market and network of warehouses are where much of the country\'s turmeric is priced and traded.',
        ],
      },
      {
        heading: 'How to tell genuine Erode turmeric',
        paragraphs: [
          'Because the name carries a premium, it is also misused. These are the practical checks:',
        ],
        bullets: [
          'Origin stated plainly — the seller should name the farm or district, not just say "South Indian turmeric".',
          'Colour — a deep, warm golden yellow, not a bright lemon or orange (those shades often indicate added dye).',
          'Aroma — earthy and slightly bitter, noticeable as soon as you open the pack. Stale or blended powder smells faint.',
          'Curcumin figure — a reputable seller will state a tested range rather than a vague "high curcumin".',
          'The water test — pure turmeric settles and leaves the water only lightly tinted; dyed powder colours the water strongly. See our guide on checking turmeric purity.',
        ],
      },
      {
        heading: 'Ponkali and Erode turmeric',
        paragraphs: [
          'Ponkali turmeric is grown on our own family farm in Erode, the same land our grandparents Ponnamal and Kaaliappa farmed for over sixty years. We harvest, boil, dry and grind the rhizomes ourselves and pack within days of grinding, so nothing is blended in and nothing sits in a warehouse. Our turmeric tests at 2.5% to 3.5% curcumin and is FSSAI licensed.',
          'You can buy it in 100 g, 250 g, 500 g and 1 kg packs, delivered anywhere in India.',
        ],
      },
    ],
    faq: [
      {
        question: 'When did Erode turmeric get its GI tag?',
        answer: 'Erode turmeric was granted its Geographical Indication in 2019 by the Geographical Indications Registry, Chennai.',
      },
      {
        question: 'Is Erode turmeric the same as Salem turmeric?',
        answer: 'No. Salem is a neighbouring district in Tamil Nadu that also grows turmeric, but the GI tag applies specifically to turmeric from the designated Erode region. The two are traded separately in the Erode market.',
      },
    ],
  },
  {
    slug: 'how-to-check-turmeric-purity-at-home',
    title: 'How to Check Turmeric Powder Purity at Home (5 Simple Tests)',
    description:
      'Five kitchen tests to detect adulterated turmeric powder — added colour, chalk, starch and lead chromate — using water, a glass and your hands. No lab needed.',
    intro:
      'Turmeric is one of the most commonly adulterated spices in India. Bright dyes, chalk, starch and even lead chromate are mixed in to stretch volume or fake a "rich" colour. Here are the tests you can do in your own kitchen in a few minutes, and what each result means.',
    published: '2026-09-12',
    updated: '2026-09-12',
    sections: [
      {
        heading: 'Why turmeric is adulterated',
        paragraphs: [
          'Turmeric is judged by eye — the brighter the yellow, the more "premium" it looks — so dyes are added to make dull or old powder appear fresh. Cheap fillers like chalk powder, rice flour and tapioca starch are added to increase weight. The most dangerous adulterants are metanil yellow (a textile dye banned in food) and lead chromate, both of which are toxic with regular consumption. FSSAI lists all of these as common adulterants and publishes home tests under its DART (Detect Adulteration with Rapid Test) guidance.',
        ],
      },
      {
        heading: 'Test 1 — The water test (for added colour)',
        paragraphs: [
          'Put a teaspoon of turmeric powder into a glass of warm water and let it stand for 5 to 10 minutes without stirring again.',
          'Pure turmeric sinks and settles at the bottom, leaving the water only faintly yellow. If the water turns a strong, bright yellow or orange, or you see a coloured film on the surface, the powder contains a water-soluble dye such as metanil yellow.',
        ],
      },
      {
        heading: 'Test 2 — The palm test (for synthetic dye)',
        paragraphs: [
          'Rub a pinch of powder between your wet palm and thumb for 20 seconds. Natural turmeric leaves a soft, even pale-yellow stain that washes off with soap. Synthetic dyes leave a vivid, blotchy stain that is hard to remove.',
        ],
      },
      {
        heading: 'Test 3 — The acid test (for lead chromate and metanil yellow)',
        paragraphs: [
          'Add a few drops of concentrated hydrochloric acid — or, more safely at home, a few drops of lemon juice or vinegar — to a pinch of turmeric in a spoon.',
          'If the mixture turns pink, violet or magenta, metanil yellow is likely present. If it fizzes and the colour changes sharply, lead chromate or chalk may be present. Pure turmeric shows no dramatic colour change.',
        ],
      },
      {
        heading: 'Test 4 — The iodine test (for starch fillers)',
        paragraphs: [
          'Mix a pinch of turmeric with a little water and add a drop of tincture of iodine (sold at pharmacies). A blue-black colour means starch — usually rice, wheat or tapioca flour — has been added as a filler. Turmeric itself contains only a little natural starch and gives at most a faint reaction.',
        ],
      },
      {
        heading: 'Test 5 — Look, smell and feel',
        paragraphs: [
          'Genuine turmeric powder is a deep golden yellow, not neon. It smells earthy, warm and slightly bitter the moment the pack opens. Between the fingers it feels fine but very slightly gritty — not silky like flour or talc. Stale powder looks dull and smells of almost nothing.',
        ],
      },
      {
        heading: 'Buying turmeric you do not need to test',
        paragraphs: [
          'The simplest protection is to buy from a source that tells you exactly where the turmeric was grown and who ground it. Single-origin, farm-direct turmeric has no trader in the chain with an incentive to stretch it. Ponkali turmeric is grown, ground and packed on our own farm in Erode — the GI-tagged turmeric region of Tamil Nadu — with nothing added, and we state our tested curcumin range (2.5% to 3.5%) on every pack.',
        ],
      },
    ],
    faq: [
      {
        question: 'Is very bright yellow turmeric better?',
        answer: 'Usually the opposite. Natural turmeric is a deep golden yellow. A neon or lemon-bright powder is a common sign of added dye.',
      },
      {
        question: 'What is metanil yellow?',
        answer: 'Metanil yellow is a synthetic industrial dye that is not permitted in food in India. It is one of the most common turmeric adulterants and is harmful with regular consumption.',
      },
    ],
  },
  {
    slug: 'curcumin-content-in-turmeric-powder',
    title: 'Curcumin Content in Turmeric Powder: What the Percentage Means',
    description:
      'What curcumin is, typical curcumin percentages in Indian turmeric varieties including Erode, Salem, Alleppey and Lakadong, and why "high curcumin" claims need a number.',
    intro:
      'Turmeric packs increasingly advertise "high curcumin", but few say how much. This guide explains what curcumin is, what percentages are normal, how regional varieties compare, and what the number does and does not tell you.',
    published: '2026-09-12',
    updated: '2026-09-12',
    sections: [
      {
        heading: 'What curcumin is',
        paragraphs: [
          'Curcumin is the main curcuminoid in turmeric rhizomes — the yellow pigment that gives the spice its colour, and the compound most studied in research on turmeric. It typically makes up 2% to 5% of turmeric powder by weight, alongside essential oils, starch, fibre and other curcuminoids.',
          'Curcumin content is measured in a laboratory, usually by spectrophotometry or HPLC, and expressed as a percentage of dry weight. Colour alone is not a reliable guide, because dyes can imitate it.',
        ],
      },
      {
        heading: 'Typical curcumin levels by variety',
        paragraphs: [
          'Curcumin varies with the variety of turmeric, the soil and climate where it is grown, how it is cured and dried, and how long it has been stored. Broad, commonly quoted ranges:',
        ],
        bullets: [
          'General-market blended turmeric powder: about 2% to 3%.',
          'Erode turmeric (Tamil Nadu, GI-tagged): about 2.5% to 4%.',
          'Salem turmeric (Tamil Nadu): about 3% to 4%.',
          'Alleppey finger turmeric (Kerala): about 4% to 6%, prized for export.',
          'Lakadong turmeric (Meghalaya): about 6% to 7.5%, grown in small volumes.',
        ],
      },
      {
        heading: 'Why higher is not automatically better for cooking',
        paragraphs: [
          'In the kitchen, turmeric is valued for colour, aroma and flavour together. Very high-curcumin varieties can taste more bitter and are often sold for extraction into supplements rather than for daily cooking. A turmeric in the 2.5% to 4% range, freshly ground, gives the balance most South Indian cooking expects.',
          'Freshness matters as much as the starting figure. Curcumin and the volatile oils degrade with heat, light, humidity and time, so a 4% turmeric stored for two years in a warehouse may deliver less than a 3% turmeric ground last month.',
        ],
      },
      {
        heading: 'How to read a "high curcumin" label',
        paragraphs: [
          'Look for a stated range, not a slogan. A seller who has tested their turmeric will say "2.5% to 3.5%" or similar. Be cautious of packs claiming "95% curcumin" — that describes a purified extract used in capsules, not a cooking powder. And check the origin: a specific district and farm is a better sign than "Indian turmeric".',
        ],
      },
      {
        heading: 'Ponkali\'s curcumin content',
        paragraphs: [
          'Ponkali Erode turmeric tests at 2.5% to 3.5% natural curcumin. Nothing is added to reach that figure — no extract, no colour. It is grown on our farm in Erode, ground on our own mill and packed within days, so the curcumin and aroma you get are those of fresh turmeric, not a blend. Available in 100 g to 1 kg packs, delivered across India.',
        ],
      },
    ],
    faq: [
      {
        question: 'Does curcumin percentage show on the pack?',
        answer: 'It is not legally required on a spice pack in India, so many brands omit it. Ponkali prints its tested range, 2.5% to 3.5%, on every pouch.',
      },
      {
        question: 'Is 3% curcumin good?',
        answer: 'Yes. Around 3% is a good figure for cooking turmeric and above the typical general-market range of 2% to 3%.',
      },
    ],
  },
];

const BUYERS_GUIDES: Guide[] = [
  {
    slug: 'best-turmeric-powder-in-india-how-to-choose',
    title: 'Best Turmeric Powder in India: How to Choose (Buyer\'s Guide)',
    description:
      'An honest buyer\'s guide to choosing turmeric powder in India — which varieties are best for cooking, what curcumin figure to expect, how to read a label, and the red flags that mean adulteration or old stock.',
    intro:
      'Search "best turmeric powder in India" and you get lists of brands ranked by people who have not opened the packs. This is a different kind of guide: written by a family that has grown turmeric in Erode for three generations, it tells you what actually separates good turmeric from poor turmeric, so you can judge any pack — including ours — for yourself.',
    published: '2026-09-12',
    updated: '2026-09-12',
    sections: [
      {
        heading: 'What "best" means for turmeric',
        paragraphs: [
          'Turmeric powder is judged on four things: colour (a deep golden yellow, not neon), aroma (earthy and slightly bitter, obvious when the pack opens), curcumin content (the compound behind the colour, usually 2%–5% by weight), and freshness (how long ago it was ground). A pack can score well on one and badly on another — a very high-curcumin turmeric can taste harsh in dal, and a beautifully aromatic one can be adulterated with dye. The best turmeric for you is the one that scores well on all four for the way you cook.',
        ],
      },
      {
        heading: 'The Indian varieties worth knowing',
        paragraphs: [
          'India grows around 80% of the world\'s turmeric, and a few regions are recognised for quality — several with a Geographical Indication (GI) tag, which legally ties the name to the place.',
        ],
        bullets: [
          'Erode turmeric (Tamil Nadu, GI 2019): deep colour, strong aroma, about 2.5%–4% curcumin. Erode is India\'s largest turmeric market. Balanced for everyday cooking.',
          'Salem turmeric (Tamil Nadu): a close neighbour of Erode with similar character, about 3%–4% curcumin.',
          'Alleppey finger turmeric (Kerala): about 4%–6% curcumin, a darker orange-yellow, historically the export grade.',
          'Lakadong turmeric (Meghalaya): the highest curcumin in India at roughly 6%–7.5%, more bitter, small harvests and premium prices; often bought for extraction rather than cooking.',
          'Sangli / Rajapuri (Maharashtra) and Nizamabad (Telangana): large trading centres for bulb turmeric, generally 2%–3.5% curcumin, common in blended commercial powders.',
        ],
      },
      {
        heading: 'How to read a turmeric label',
        paragraphs: ['Most of what you need to know is on the pack — or conspicuously missing from it.'],
        bullets: [
          'Ingredients: should say "turmeric" and nothing else. No "permitted colour", no "anti-caking agent".',
          'Origin: a district or farm ("Erode, Tamil Nadu"), not just "Product of India". Blended powder cannot name a place.',
          'Curcumin: a tested range ("2.5%–3.5%"), not a slogan ("high curcumin"). Be wary of "95% curcumin" — that is an extract for capsules, not a cooking powder.',
          'FSSAI licence number: mandatory on any packaged food sold in India. Its absence is disqualifying.',
          'Packing date: turmeric loses aroma and curcumin over 12–18 months. A pack with only a distant "best before" and no packing date is hiding its age.',
          'Packaging: opaque or foil, properly sealed. Light and air degrade curcumin; a clear plastic pouch on a sunny shelf is a bad sign.',
        ],
      },
      {
        heading: 'Red flags for adulteration',
        paragraphs: [
          'Turmeric is one of the most adulterated spices in India. Dyes (metanil yellow, lead chromate) are added for colour, and chalk, rice flour or tapioca starch for weight. The warning signs: a lemon-bright or orange colour, a price far below the market (good turmeric costs money to grow, cure and grind), a silky talc-like feel instead of a slightly gritty one, and water that turns strongly yellow when a spoon of powder is stirred in. Our guide on checking turmeric purity at home walks through five tests.',
        ],
      },
      {
        heading: 'Farm-direct vs. brand vs. loose market turmeric',
        paragraphs: [
          'Loose turmeric from a spice shop is the cheapest and the riskiest — no label, no origin, no accountability. Packaged national brands are safer and consistent, but they blend rhizomes from many regions and seasons and hold stock for months, so the aroma is muted and the origin is unknowable. Farm-direct turmeric — bought from the grower who cured, ground and packed it — is the only option where the person selling it knows exactly what is in the pack. It costs more than loose turmeric and about the same as a premium brand.',
        ],
      },
      {
        heading: 'A simple checklist',
        paragraphs: ['If a pack passes all six, it is good turmeric regardless of the brand name:'],
        bullets: [
          'Single named origin',
          'Stated curcumin range',
          'Ingredients: turmeric only',
          'FSSAI licence printed',
          'Packing date within the last few months',
          'Passes the water test at home',
        ],
      },
      {
        heading: 'Where Ponkali fits',
        paragraphs: [
          'Ponkali is Erode turmeric from one farm, ours, in the GI-tagged region. We grow, cure, grind and pack it ourselves, print the tested curcumin range (2.5%–3.5%) and FSSAI licence on every pouch, and ship within days of grinding. It passes the checklist above — and we would rather you check than take our word for it. Available in 100 g to 1 kg, delivered across India.',
        ],
      },
    ],
    faq: [
      {
        question: 'Is expensive turmeric better?',
        answer: 'Not automatically, but very cheap turmeric is almost always a bad sign: growing, curing, drying and grinding turmeric properly has a real cost, and prices far below the market are usually met by adding fillers or dye.',
      },
      {
        question: 'Is Erode turmeric the best turmeric in India?',
        answer: 'It is one of the best-regarded for cooking, which is why it carries a GI tag — balanced colour, aroma and curcumin. Lakadong and Alleppey have higher curcumin; Erode is generally preferred for everyday South Indian food.',
      },
    ],
  },
  {
    slug: 'erode-vs-salem-vs-alleppey-vs-lakadong-turmeric',
    title: 'Erode vs Salem vs Alleppey vs Lakadong Turmeric: Which Is Best?',
    description:
      'A side-by-side comparison of India\'s best-known turmeric varieties — Erode, Salem, Alleppey and Lakadong — by curcumin content, colour, taste, price and what each is best used for.',
    intro:
      'Four names come up whenever people argue about the best turmeric in India. They are genuinely different — in curcumin, in taste, in price and in what they are grown for. Here is how they compare, without a sales pitch.',
    published: '2026-09-12',
    updated: '2026-09-12',
    sections: [
      {
        heading: 'At a glance',
        paragraphs: ['Typical figures; curcumin varies with season, curing and storage.'],
        bullets: [
          'Erode (Tamil Nadu) — curcumin ~2.5%–4% · deep golden yellow · earthy, balanced · GI-tagged 2019 · best for everyday cooking.',
          'Salem (Tamil Nadu) — curcumin ~3%–4% · golden yellow · similar to Erode, slightly bolder · best for everyday cooking.',
          'Alleppey (Kerala) — curcumin ~4%–6% · orange-yellow · stronger, slightly bitter · historically the export grade · good for colour-heavy dishes and extraction.',
          'Lakadong (Meghalaya) — curcumin ~6%–7.5% · bright orange · noticeably bitter · very limited supply, premium price · mostly bought for health use and extraction.',
        ],
      },
      {
        heading: 'Curcumin: the number everyone quotes',
        paragraphs: [
          'Lakadong wins on raw curcumin, Alleppey second, then Salem and Erode close together. But curcumin is the pigment, not the flavour, and at 6%+ it makes food bitter enough that many cooks dilute it. For a kadai of vegetables or a pot of sambar, 2.5%–4% gives full colour without harshness — which is why the Tamil Nadu varieties dominate South Indian kitchens.',
        ],
      },
      {
        heading: 'Aroma and taste',
        paragraphs: [
          'Erode and Salem turmeric are prized for aroma — the warm, earthy smell that hits when the pack opens and blooms in hot oil. Alleppey is more pungent; Lakadong is sharper and more medicinal. If you cook Indian food daily, aroma matters more than a percentage point of curcumin.',
        ],
      },
      {
        heading: 'Price and availability',
        paragraphs: [
          'Erode and Salem are widely grown, so genuine single-origin powder is available at fair prices. Alleppey is a smaller crop and costs more. Lakadong is grown in a few districts of Meghalaya in small quantities; genuine Lakadong is expensive, and the name is heavily misused on ordinary turmeric.',
        ],
      },
      {
        heading: 'Which should you buy?',
        paragraphs: [
          'For cooking: Erode or Salem. Balanced, aromatic, affordable, and — when bought from a named farm — traceable.',
          'For colour-intensive dishes or homemade extracts: Alleppey.',
          'For the highest curcumin regardless of taste and price: Lakadong, if you can verify it is genuine.',
          'Whatever the variety, the same rules apply: named origin, stated curcumin, turmeric-only ingredients, recent packing date, and a water test at home.',
        ],
      },
      {
        heading: 'About Ponkali',
        paragraphs: [
          'Ponkali is Erode turmeric, grown and ground on our own farm in the GI-tagged region and packed within days of grinding. It tests at 2.5%–3.5% curcumin. If you want an Erode turmeric you can trace to one field, that is what we sell. Delivered anywhere in India.',
        ],
      },
    ],
    faq: [
      {
        question: 'Is Lakadong turmeric better than Erode turmeric?',
        answer: 'Lakadong has roughly double the curcumin, but it is more bitter, far more expensive, and frequently counterfeited. For everyday cooking most people prefer Erode; for maximum curcumin, genuine Lakadong.',
      },
      {
        question: 'Is Salem turmeric the same as Erode turmeric?',
        answer: 'They are neighbouring Tamil Nadu districts with very similar turmeric. The GI tag applies to the Erode region specifically; both are excellent cooking varieties.',
      },
    ],
  },
];

/** All guides, in display order. */
export const GUIDES: Guide[] = [...CORE_GUIDES, ...BUYERS_GUIDES];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
