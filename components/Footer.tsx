import Link from 'next/link';
import Image from 'next/image';
import Mandala2 from './Mandala2';
import { InstagramIcon, FacebookIcon, YouTubeIcon } from './Icons';

export default function Footer() {
  return (
    <footer className="bg-dark-brown text-warm-white relative overflow-hidden">
      {/* Half-mandala peeking from right edge */}
      <Mandala2
        className="absolute right-[-350px] top-1/2 -translate-y-1/2 w-[700px] h-[700px] text-warm-white opacity-[0.18] pointer-events-none select-none"
      />
      {/* Small accent mandala — bottom-left corner */}
      <Mandala2
        className="absolute -bottom-24 -left-24 w-[280px] h-[280px] text-warm-white opacity-[0.12] pointer-events-none select-none"
      />

      <div className="max-w-6xl mx-auto px-5 pt-16 pb-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-12 border-b border-warm-white/10">

          {/* Brand column with logo */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <Image
                src="/images/logo.jpg"
                alt="Ponkali"
                width={64}
                height={64}
                className="rounded-full flex-shrink-0"
              />
              <span className="font-extrabold text-[22px] tracking-widest text-warm-white leading-none">PONKALI</span>
            </div>
            <p className="text-[14px] font-medium text-warm-white/75 leading-[1.8] mb-5">
              From Our Farm — Into Your Kitchen. Three generations of turmeric farming in Erode, Tamil Nadu.
            </p>
            <p className="text-[13px] font-medium text-warm-white/50 leading-[1.8] mb-6">
              The Native, Perundurai<br />
              Erode — 638055, Tamil Nadu
            </p>

            {/* Social media icons */}
            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-warm-white/35 mb-3">Follow Us</p>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.instagram.com/ponkali.turmeric"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Ponkali on Instagram"
                  className="w-9 h-9 rounded-full border border-warm-white/15 flex items-center justify-center text-warm-white/55 hover:text-warm-white hover:border-warm-white/40 transition-colors"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
                <a
                  href="https://www.facebook.com/ponkali.turmeric"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Ponkali on Facebook"
                  className="w-9 h-9 rounded-full border border-warm-white/15 flex items-center justify-center text-warm-white/55 hover:text-warm-white hover:border-warm-white/40 transition-colors"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
                <a
                  href="https://www.youtube.com/@ponkali"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Ponkali on YouTube"
                  className="w-9 h-9 rounded-full border border-warm-white/15 flex items-center justify-center text-warm-white/55 hover:text-warm-white hover:border-warm-white/40 transition-colors"
                >
                  <YouTubeIcon className="w-4 h-4" />
                </a>
                <a
                  href="https://wa.me/919944033696?text=Hi! I'd like to place an order for Ponkali Turmeric. Please help me."
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Order on WhatsApp"
                  className="w-9 h-9 rounded-full border border-warm-white/15 flex items-center justify-center text-warm-white/55 hover:text-warm-white hover:border-warm-white/40 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h4 className="font-semibold text-[11px] tracking-[0.2em] uppercase text-warm-white/40 mb-5">Shop</h4>
            <ul className="space-y-3">
              {[
                ['Turmeric 100g — ₹169', '/product/turmeric-100g'],
                ['Turmeric 250g — ₹329', '/product/turmeric-250g'],
                ['Turmeric 500g — ₹599', '/product/turmeric-500g'],
                ['Turmeric 1kg — ₹849',  '/product/turmeric-1kg'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-[14px] font-medium text-warm-white/60 hover:text-warm-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="font-semibold text-[11px] tracking-[0.2em] uppercase text-warm-white/40 mb-5">Company</h4>
            <ul className="space-y-3">
              {[
                ['Our Story', '/our-story'],
                ['From Our Farm', '/farm'],
                ['All Products', '/shop'],
                ['Contact Us', '/contact'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-[14px] font-medium text-warm-white/60 hover:text-warm-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-[11px] tracking-[0.2em] uppercase text-warm-white/40 mb-5">Contact</h4>
            <ul className="space-y-3 mb-6">
              <li>
                <a href="mailto:ponkaliturmeric@gmail.com" className="text-[14px] font-medium text-warm-white/60 hover:text-warm-white transition-colors">
                  ponkaliturmeric@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:9944033696" className="text-[14px] font-medium text-warm-white/60 hover:text-warm-white transition-colors">
                  +91 99440 33696
                </a>
              </li>
            </ul>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/919944033696?text=Hi! I'd like to place an order for Ponkali Turmeric. Please help me."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2.5 rounded-full text-[13px] font-semibold hover:bg-[#1ebe5a] transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
              Order on WhatsApp
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-8">
          <p className="text-[12px] font-medium text-warm-white/30">
            FSSAI Lic. No. 22426064000154 · © {new Date().getFullYear()} Ponkali Masalas
          </p>
          <p className="text-[12px] font-medium text-warm-white/25">Made with care in Erode, Tamil Nadu</p>
        </div>
      </div>
    </footer>
  );
}
