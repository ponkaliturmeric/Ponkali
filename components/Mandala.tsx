export default function Mandala({ className }: { className?: string }) {
  const r8    = [0, 45, 90, 135, 180, 225, 270, 315];
  const r8off = r8.map(a => a + 22.5);
  const r16   = Array.from({ length: 16 }, (_, i) => i * 22.5);
  const dot   = (radius: number, angle: number) => ({
    cx: +(Math.sin((angle * Math.PI) / 180) * radius).toFixed(2),
    cy: +(-Math.cos((angle * Math.PI) / 180) * radius).toFixed(2),
  });

  return (
    <svg
      viewBox="0 0 600 600"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g transform="translate(300,300)" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle r="291" strokeWidth="0.5" />
        <circle r="272" strokeWidth="0.3" />

        {r8.map(a => { const d = dot(282, a); return <circle key={a} cx={d.cx} cy={d.cy} r="3.5" fill="currentColor" stroke="none" />; })}

        {r8.map(a => (
          <g key={a} transform={`rotate(${a})`}>
            <path d="M0,-178 C-44,-206 -44,-248 0,-270 C44,-248 44,-206 0,-178 Z" strokeWidth="0.8" />
          </g>
        ))}

        <circle r="170" strokeWidth="0.5" />

        {r8off.map(a => (
          <g key={a} transform={`rotate(${a})`}>
            <path d="M0,-124 C-30,-144 -30,-164 0,-174 C30,-164 30,-144 0,-124 Z" strokeWidth="0.7" />
          </g>
        ))}

        <circle r="114" strokeWidth="0.5" />

        {r16.map(a => { const d = dot(114, a); return <circle key={a} cx={d.cx} cy={d.cy} r="2" fill="currentColor" stroke="none" />; })}

        {r8.map(a => (
          <g key={a} transform={`rotate(${a})`}>
            <path d="M0,-74 C-22,-88 -22,-104 0,-114 C22,-104 22,-88 0,-74 Z" strokeWidth="0.7" />
          </g>
        ))}

        <circle r="66" strokeWidth="0.5" />

        {[0, 45, 90, 135].map(a => (
          <polygon key={a} points="0,-56 10,-10 0,56 -10,-10" transform={`rotate(${a})`} strokeWidth="0.6" />
        ))}

        {r8off.map(a => (
          <g key={a} transform={`rotate(${a})`}>
            <path d="M0,-30 C-12,-40 -12,-52 0,-62 C12,-52 12,-40 0,-30 Z" strokeWidth="0.7" />
          </g>
        ))}

        <circle r="28" strokeWidth="0.6" />
        <circle r="12" strokeWidth="0.5" />
        <circle r="4" fill="currentColor" stroke="none" opacity="0.6" />
      </g>
    </svg>
  );
}
