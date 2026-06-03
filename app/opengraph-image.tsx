import { ImageResponse } from 'next/og';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/seo';

// Site-wide default social share image (used for Open Graph + Twitter).
export const runtime = 'edge';
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          backgroundColor: '#2C1000',
          backgroundImage:
            'radial-gradient(ellipse 60% 80% at 80% 50%, rgba(232,149,10,0.18) 0%, transparent 65%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            color: '#FDF3DC',
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          Ponkali
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: '28px',
            color: '#FDF3DC',
            fontSize: 78,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
          }}
        >
          <span>Pure Erode Turmeric,</span>
          <span style={{ color: '#E8950A' }}>Farm Direct.</span>
        </div>

        <div
          style={{
            marginTop: '32px',
            color: 'rgba(253,243,220,0.6)',
            fontSize: 30,
            maxWidth: '820px',
            lineHeight: 1.4,
          }}
        >
          GI-tagged · naturally grown · 2.5–3.5% natural curcumin · FSSAI certified
        </div>

        <div
          style={{
            display: 'flex',
            gap: '14px',
            marginTop: '44px',
          }}
        >
          {['GI Tagged', 'Naturally Grown', 'Farm Direct', 'FSSAI Certified'].map((t) => (
            <div
              key={t}
              style={{
                color: 'rgba(253,243,220,0.85)',
                fontSize: 22,
                border: '1px solid rgba(253,243,220,0.25)',
                borderRadius: '999px',
                padding: '8px 22px',
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
