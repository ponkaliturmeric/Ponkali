export default function Mandala2({ className }: { className?: string }) {
  const r8    = [0, 45, 90, 135, 180, 225, 270, 315];
  const r8off = r8.map(a => a + 22.5);
  const r16   = Array.from({ length: 16 }, (_, i) => i * 22.5);
  const r12   = Array.from({ length: 12 }, (_, i) => i * 30);

  return (
    <svg
      viewBox="0 0 600 600"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g transform="translate(300,300)" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Outer circle */}
        <circle r="288" strokeWidth="1.2" />
        <circle r="276" strokeWidth="0.6" />

        {/* 8 long sharp diamond petals */}
        {r8.map(a => (
          <g key={`outer-${a}`} transform={`rotate(${a})`}>
            <path d="M0,-178 L22,-226 L0,-282 L-22,-226 Z" strokeWidth="1.4" />
          </g>
        ))}

        {/* 16 small accent diamonds on outer ring */}
        {r16.map(a => (
          <g key={`dot16-${a}`} transform={`rotate(${a})`}>
            <path d="M0,-258 L5,-268 L0,-278 L-5,-268 Z" strokeWidth="1.0" />
          </g>
        ))}

        <circle r="170" strokeWidth="1.0" />

        {/* 8 medium open lotus petals (curved) */}
        {r8.map(a => (
          <g key={`mid-${a}`} transform={`rotate(${a})`}>
            <path d="M0,-118 C-28,-138 -26,-158 0,-168 C26,-158 28,-138 0,-118 Z" strokeWidth="1.3" />
          </g>
        ))}

        {/* 8 offset sharp petals */}
        {r8off.map(a => (
          <g key={`mid-off-${a}`} transform={`rotate(${a})`}>
            <path d="M0,-118 L12,-142 L0,-166 L-12,-142 Z" strokeWidth="1.0" />
          </g>
        ))}

        <circle r="108" strokeWidth="1.0" />

        {/* 16 dots on mid ring */}
        {r16.map(a => {
          const rad = (a * Math.PI) / 180;
          return (
            <circle
              key={`mid-dot-${a}`}
              cx={+(Math.sin(rad) * 108).toFixed(2)}
              cy={+(-Math.cos(rad) * 108).toFixed(2)}
              r="3"
              fill="currentColor"
              stroke="none"
            />
          );
        })}

        {/* 12 inner petals */}
        {r12.map(a => (
          <g key={`inner-${a}`} transform={`rotate(${a})`}>
            <path d="M0,-62 C-16,-74 -15,-86 0,-94 C15,-86 16,-74 0,-62 Z" strokeWidth="1.2" />
          </g>
        ))}

        <circle r="54" strokeWidth="1.0" />

        {/* 8 center star points */}
        {r8.map(a => (
          <g key={`star-${a}`} transform={`rotate(${a})`}>
            <path d="M0,-26 L7,-40 L0,-52 L-7,-40 Z" strokeWidth="1.1" />
          </g>
        ))}

        {/* 8 offset tiny diamonds */}
        {r8off.map(a => (
          <g key={`star-off-${a}`} transform={`rotate(${a})`}>
            <path d="M0,-28 L4,-36 L0,-44 L-4,-36 Z" strokeWidth="0.8" />
          </g>
        ))}

        <circle r="22" strokeWidth="1.1" />
        <circle r="10" strokeWidth="1.0" />
        <circle r="4" fill="currentColor" stroke="none" opacity="0.7" />
      </g>
    </svg>
  );
}
