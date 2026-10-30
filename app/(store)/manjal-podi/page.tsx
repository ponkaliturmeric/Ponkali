import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import JsonLd from '@/components/JsonLd';
import Faq from '@/components/Faq';
import { buildMetadata, breadcrumbJsonLd, LANGUAGE_ALTERNATES, BUSINESS } from '@/lib/seo';
import { getCatalog, getFromPrice } from '@/lib/catalog';
import type { FaqItem } from '@/lib/content';

/**
 * Tamil-language landing page.
 *
 * The customers nearest this farm search in Tamil — "மஞ்சள் பொடி",
 * "ஈரோடு மஞ்சள்", "விராலி மஞ்சள்" — and essentially nobody in the market
 * serves those queries with a real page. English-only sites simply do not
 * appear for them, so this is the least contested traffic available to Ponkali.
 *
 * NOTE FOR THE OWNER: you are a native speaker and I am not. Read this page
 * once and correct anything that sounds translated rather than spoken — the
 * facts are right, but the phrasing deserves your ear.
 *
 * hreflang pairs this page with the English homepage via LANGUAGE_ALTERNATES,
 * declared on BOTH pages because Google ignores one-way hreflang.
 */

export const metadata: Metadata = buildMetadata({
  title: 'ஈரோடு மஞ்சள் பொடி: பண்ணையிலிருந்து நேரடியாக | Erode Manjal Podi',
  description:
    'GI அங்கீகாரம் பெற்ற ஈரோடு மஞ்சள் பொடி, எங்கள் குடும்பப் பண்ணையிலிருந்து நேரடியாக. கலப்படம் இல்லை, நிறம் சேர்க்கப்படவில்லை, 2.5% முதல் 3.5% இயற்கையான குர்குமின். FSSAI அனுமதி பெற்றது. இந்தியா முழுவதும் டெலிவரி.',
  path: '/manjal-podi',
  languages: LANGUAGE_ALTERNATES,
});

export const revalidate = 60;

const TA_FAQ: FaqItem[] = [
  {
    question: 'ஈரோடு மஞ்சள் என்றால் என்ன? அது ஏன் சிறப்பு?',
    answer:
      'ஈரோடு மாவட்டத்தின் மண்ணும் காலநிலையும் மஞ்சள் சாகுபடிக்கு மிகவும் ஏற்றவை. அதனால்தான் ஈரோடு மஞ்சளுக்கு 2019 ஆம் ஆண்டு GI (புவிசார் குறியீடு) அங்கீகாரம் வழங்கப்பட்டது. அதே மண்ணில், மூன்று தலைமுறைகளாக எங்கள் குடும்பம் மஞ்சள் விளைவிக்கிறது.',
  },
  {
    question: 'இந்த மஞ்சள் பொடியில் குர்குமின் அளவு எவ்வளவு?',
    answer:
      'இயற்கையாகவே 2.5% முதல் 3.5% வரை குர்குமின் உள்ளது. இது செயற்கையாக சேர்க்கப்பட்டது அல்ல, மஞ்சளிலேயே இயற்கையாக இருப்பது. நிறத்திற்காக எந்த ரசாயனமும், மாவும், அரிசி மாவும் கலக்கப்படவில்லை.',
  },
  {
    question: 'மஞ்சள் பொடியில் கலப்படம் உள்ளதா என்று வீட்டிலேயே எப்படி சோதிக்கலாம்?',
    answer:
      'ஒரு டம்ளர் வெதுவெதுப்பான தண்ணீரில் அரை டீஸ்பூன் மஞ்சள் பொடியைப் போடுங்கள். கலக்காமல் அப்படியே வையுங்கள். தூய மஞ்சள் மெதுவாக அடியில் தங்கும், தண்ணீர் வெளிர் மஞ்சள் நிறமாக இருக்கும். தண்ணீர் உடனே கடும் மஞ்சள் நிறமாக மாறினால், அதில் செயற்கை நிறம் கலந்திருக்கலாம்.',
  },
  {
    question: 'மஞ்சள் பொடியை எப்படி சேமித்து வைக்க வேண்டும்?',
    answer:
      'காற்று புகாத டப்பாவில், வெயிலும் வெப்பமும் படாத இடத்தில் வையுங்கள். ஈரமான கரண்டியை உள்ளே விடாதீர்கள். அப்படிச் செய்தால் நிறமும் வாசனையும் நீண்ட நாட்கள் மாறாமல் இருக்கும்.',
  },
  {
    question: 'எப்படி ஆர்டர் செய்வது? பணம் எப்படி செலுத்துவது?',
    answer:
      'இந்த இணையதளத்திலேயே ஆர்டர் செய்யலாம், அல்லது வாட்ஸ்அப்பில் 99440 33696 என்ற எண்ணில் தொடர்பு கொள்ளலாம். UPI, கார்டு, நெட் பேங்கிங் மூலம் செலுத்தலாம், அல்லது பொருள் வந்த பிறகு பணம் செலுத்தும் (COD) வசதியும் உள்ளது.',
  },
  {
    question: 'டெலிவரி எவ்வளவு நாட்கள் ஆகும்?',
    answer:
      'ஈரோட்டிலிருந்து ஒன்று முதல் இரண்டு வேலை நாட்களுக்குள் அனுப்பப்படும். இந்தியாவின் பெரும்பாலான ஊர்களுக்கு மூன்று முதல் ஐந்து வேலை நாட்களில் கிடைக்கும். டெலிவரி கட்டணம் ஊருக்கும் எடைக்கும் ஏற்ப மாறும், அது கார்ட்டிலேயே தெரியும்.',
  },
];

export default async function ManjalPodiPage() {
  const [catalog, fromPrice] = await Promise.all([getCatalog(), getFromPrice()]);

  return (
    // lang="ta" tells crawlers and screen readers this subtree is Tamil, even
    // though the document root is en.
    <div lang="ta" className="min-h-screen bg-cream">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'மஞ்சள் பொடி', path: '/manjal-podi' },
        ])}
      />

      {/* Hero */}
      <section className="bg-dark-brown py-16 md:py-20 px-5">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_300px] gap-10 items-center">
          <div>
            <p className="text-gold/70 text-[11px] font-semibold tracking-[0.3em] uppercase mb-4">
              ஈரோடு · தமிழ்நாடு
            </p>
            <h1 className="font-hero text-[30px] md:text-[42px] font-extrabold text-white tracking-tight leading-[1.25] mb-5">
              ஈரோடு மஞ்சள் பொடி,<br />
              <span className="text-gold">எங்கள் பண்ணையிலிருந்து நேரடியாக</span>
            </h1>
            <p className="text-white/75 text-[17px] leading-[1.9] mb-8 max-w-xl">
              GI அங்கீகாரம் பெற்ற ஈரோடு மஞ்சள், மூன்று தலைமுறைகளாக எங்கள் குடும்பப் பண்ணையில்
              விளைகிறது. கலப்படம் இல்லை, நிறம் சேர்க்கப்படவில்லை, இயற்கையாகவே 2.5% முதல் 3.5%
              குர்குமின். இடைத்தரகர்கள் இல்லாமல், பண்ணையிலிருந்து உங்கள் சமையலறைக்கு.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/shop"
                className="bg-gold text-dark-brown px-9 py-4 rounded-full font-bold text-[15px] text-center hover:bg-yellow-500 transition-colors"
              >
                ஆர்டர் செய்யுங்கள், ₹{fromPrice} முதல்
              </Link>
              <a
                href={`https://wa.me/${BUSINESS.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/20 text-white/80 px-9 py-4 rounded-full font-semibold text-[15px] text-center hover:border-white/50 hover:text-white transition-colors"
              >
                வாட்ஸ்அப்பில் பேசுங்கள்
              </a>
            </div>
            <p className="text-white/40 text-[13px] mt-5">
              FSSAI உரிமம் {BUSINESS.fssai} · இந்தியா முழுவதும் டெலிவரி
            </p>
          </div>
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white/5">
            <Image
              src="/images/new-prd-img0.png"
              alt="பொன்காளி ஈரோடு மஞ்சள் பொடி பொட்டலம்"
              fill
              className="object-contain p-4"
              sizes="(max-width: 768px) 100vw, 300px"
            />
          </div>
        </div>
      </section>

      {/* Why Erode */}
      <section className="bg-white py-16 px-5">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-hero text-[26px] md:text-[32px] font-extrabold text-dark-brown tracking-tight mb-6 leading-[1.35]">
            ஈரோடு மஞ்சள் ஏன் தரமானது?
          </h2>
          <div className="space-y-5 text-[16px] text-gray-700 leading-[1.95]">
            <p>
              ஈரோடு மாவட்டம் &ldquo;இந்தியாவின் மஞ்சள் நகரம்&rdquo; என்று அழைக்கப்படுகிறது. இங்குள்ள
              மண்ணும், தண்ணீரும், காலநிலையும் மஞ்சள் சாகுபடிக்கு மிகவும் ஏற்றவை. இதை அங்கீகரித்து,
              2019 ஆம் ஆண்டு ஈரோடு மஞ்சளுக்கு GI (புவிசார் குறியீடு) அங்கீகாரம் வழங்கப்பட்டது.
            </p>
            <p>
              எங்கள் தாத்தா <strong className="text-dark-brown">காளியப்பா</strong>, பாட்டி{' '}
              <strong className="text-dark-brown">பொன்னம்மாள்</strong> — இவர்கள் பெயர்களைச் சேர்த்தே{' '}
              <strong className="text-dark-brown">பொன்காளி</strong> என்ற பெயர் வந்தது. அவர்கள்
              அறுபது ஆண்டுகளுக்கு மேல் பயிரிட்ட அதே நிலத்தில், அதே விதையில், இன்றும் நாங்கள் மஞ்சள்
              விளைவிக்கிறோம்.
            </p>
            <p>
              அறுவடை செய்த மஞ்சளை எங்கள் சொந்த மில்லிலேயே அரைக்கிறோம். அரைத்த 24 மணி நேரத்திற்குள்
              பொட்டலம் போடப்படுகிறது. கிடங்கில் மாதங்கள் தங்குவதில்லை, அதனால் வாசனையும் நிறமும்
              புதிதாகவே இருக்கும்.
            </p>
          </div>
        </div>
      </section>

      {/* Prices */}
      <section className="bg-cream py-16 px-5">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-hero text-[26px] md:text-[32px] font-extrabold text-dark-brown tracking-tight mb-3 leading-[1.35]">
            மஞ்சள் பொடி விலை
          </h2>
          <p className="text-gray-600 text-[15px] leading-[1.9] mb-8">
            அதிக அளவு எடுக்கும்போது கிராமுக்கான விலை குறையும். எல்லா பொட்டலங்களிலும் உள்ளது ஒரே
            மஞ்சள் தான்.
          </p>
          <ul className="space-y-3">
            {catalog.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/product/${p.slug}`}
                  className="flex items-center justify-between gap-4 bg-white rounded-2xl border border-black/6 px-6 py-5 hover:border-gold/50 transition-colors"
                >
                  <span className="font-semibold text-dark-brown text-[16px]">
                    {p.weight} பொட்டலம்
                    {!p.in_stock && <span className="text-[13px] text-gray-400 font-normal"> · தற்போது இல்லை</span>}
                  </span>
                  <span className="font-extrabold text-dark-brown text-[18px]">₹{p.price}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-gray-500 text-[14px] mt-6 leading-[1.8]">
            மொத்தமாக (bulk) வாங்க வேண்டுமா? ஹோட்டல், கேட்டரிங், கடை வைத்திருப்பவர்களுக்கு{' '}
            <Link href="/bulk-orders" className="text-gold font-semibold hover:underline">
              மொத்த விற்பனை பக்கத்தைப்
            </Link>{' '}
            பாருங்கள்.
          </p>
        </div>
      </section>

      {/* Link back to the English content */}
      <section className="bg-white py-14 px-5">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-hero text-[22px] font-extrabold text-dark-brown tracking-tight mb-5">
            மேலும் படிக்க
          </h2>
          <ul className="space-y-3 text-[15px]">
            <li>
              <Link href="/guides/how-to-check-turmeric-purity-at-home" className="text-gold font-medium hover:underline">
                வீட்டிலேயே மஞ்சள் தூய்மையைச் சோதிக்கும் 5 முறைகள் (ஆங்கிலம்)
              </Link>
            </li>
            <li>
              <Link href="/guides/erode-turmeric-gi-tag" className="text-gold font-medium hover:underline">
                ஈரோடு மஞ்சளுக்கு GI அங்கீகாரம் எப்படி கிடைத்தது (ஆங்கிலம்)
              </Link>
            </li>
            <li>
              <Link href="/farm" className="text-gold font-medium hover:underline">
                எங்கள் பண்ணைப் படங்கள்
              </Link>
            </li>
            <li>
              <Link href="/" className="text-gray-500 font-medium hover:underline">
                English version of this page
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <Faq items={TA_FAQ} eyebrow="கேள்விகள்" title="அடிக்கடி கேட்கப்படும் கேள்விகள்" />
    </div>
  );
}
