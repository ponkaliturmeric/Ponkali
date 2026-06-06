'use client';

import { useEffect, useState } from 'react';

/**
 * Decorative background video for the hero. It is ~1.7MB, so we only load it
 * when it's worth the bytes: on wider (desktop) viewports, and never when the
 * browser reports Data Saver or a slow (2g/3g) connection. On mobile / metered
 * connections it renders nothing and the hero keeps its dark-brown + gradient
 * background — saving every such visitor the full download.
 *
 * Because the decision needs the viewport + Network Information API, the element
 * is mounted client-side only; SSR renders nothing for it (it's purely visual).
 */
export default function HeroVideo() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');

    const decide = () => {
      const conn = (navigator as unknown as {
        connection?: { saveData?: boolean; effectiveType?: string };
      }).connection;
      const saveData = conn?.saveData === true;
      const slow = !!conn?.effectiveType && ['slow-2g', '2g', '3g'].includes(conn.effectiveType);
      setShow(mq.matches && !saveData && !slow);
    };

    decide();
    mq.addEventListener('change', decide);
    return () => mq.removeEventListener('change', decide);
  }, []);

  if (!show) return null;

  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      className="absolute inset-0 w-full h-full object-cover opacity-30"
    >
      <source src="/videos/farm-video.mp4" type="video/mp4" />
    </video>
  );
}
