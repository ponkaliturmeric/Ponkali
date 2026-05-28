import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-dark-brown text-cream">
      <div className="max-w-6xl mx-auto px-5 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-12 border-b border-cream/8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-extrabold text-[18px] tracking-brand text-cream mb-4">PONKALI</h3>
            <p className="text-[13px] text-cream/50 leading-[1.8] mb-5">
              From Our Farm — Into Your Kitchen. Three generations of turmeric farming in Erode, Tamil Nadu.
            </p>
            <p className="text-[12px] text-cream/30 leading-[1.8]">
              The Native, Perundurai<br />
              Erode — 638055, Tamil Nadu
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[11px] tracking-[0.2em] uppercase text-cream/40 mb-5">Shop</h4>
            <ul className="space-y-3">
              {[
                ['Turmeric 100g', '/product/turmeric-100g'],
                ['Turmeric 250g', '/product/turmeric-250g'],
                ['Turmeric 500g', '/product/turmeric-500g'],
                ['Turmeric 1kg', '/product/turmeric-1kg'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-[14px] text-cream/50 hover:text-cream transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[11px] tracking-[0.2em] uppercase text-cream/40 mb-5">Company</h4>
            <ul className="space-y-3">
              {[
                ['Our Story', '/our-story'],
                ['All Products', '/shop'],
                ['Contact Us', '/contact'],
                ['Cart', '/cart'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-[14px] text-cream/50 hover:text-cream transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[11px] tracking-[0.2em] uppercase text-cream/40 mb-5">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:ponkaliturmeric@gmail.com" className="text-[14px] text-cream/50 hover:text-cream transition-colors">
                  ponkaliturmeric@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:9944033696" className="text-[14px] text-cream/50 hover:text-cream transition-colors">
                  +91 99440 33696
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/919944033696"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] text-cream/50 hover:text-cream transition-colors"
                >
                  WhatsApp Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-8">
          <p className="text-[11px] text-cream/25">
            FSSAI Lic. No. 22426064000154 · © {new Date().getFullYear()} Ponkali Masalas
          </p>
          <p className="text-[11px] text-cream/20">Made with care in Erode, Tamil Nadu</p>
        </div>
      </div>
    </footer>
  );
}
