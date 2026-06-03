'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

const SLIDES = [
  { src: '/images/har.jpeg',          caption: 'Harvest time in Perundurai, Erode' },
  { src: '/images/harvest.jpeg',      caption: 'Three generations of farming' },
  { src: '/images/plant.jpeg',        caption: 'Turmeric fields in full growth' },
  { src: '/images/turmeric-har.jpeg', caption: 'The roots that reach your kitchen' },
];

export default function FarmGallery() {
  const [active, setActive] = useState(0);

  const advance = useCallback(() => setActive(a => (a + 1) % SLIDES.length), []);

  useEffect(() => {
    const t = setInterval(advance, 4500);
    return () => clearInterval(t);
  }, [advance]);

  return (
    <section className="py-20 px-5 bg-white">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-12">
          <p className="text-gold text-[11px] font-semibold tracking-[0.3em] uppercase mb-3">From Our Fields</p>
          <h2 className="font-hero text-[32px] md:text-[42px] font-extrabold text-dark-brown tracking-tight mb-4 leading-[1.05]">
            Forty years of farming,<br className="hidden sm:block" /> in every packet
          </h2>
          <p className="text-gray-500 text-[16px] max-w-lg mx-auto leading-[1.75]">
            Our family has worked this same Erode land across three generations.
            When you open Ponkali, you hold that history.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative rounded-3xl overflow-hidden aspect-[4/3] md:aspect-[16/7] bg-dark-brown">

          {SLIDES.map(({ src, caption }, i) => (
            <div
              key={src}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                i === active ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <Image
                src={src}
                alt={caption}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1152px"
                priority={i === 0}
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(26,10,0,0.65) 0%, rgba(26,10,0,0.05) 45%, transparent 70%)' }}
              />
            </div>
          ))}

          {/* Caption + dot navigation */}
          <div className="absolute bottom-5 left-7 right-7 flex items-end justify-between z-10">
            <p className="text-cream/80 text-[13px] md:text-[15px] font-medium tracking-wide">
              {SLIDES[active].caption}
            </p>

            <div className="flex items-center gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-[5px] rounded-full transition-all duration-300 ${
                    i === active ? 'bg-gold w-8' : 'bg-cream/35 w-[5px] hover:bg-cream/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
