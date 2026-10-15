// Licorne illustrée qui danse : elle sautille, bouge les pattes, la tête, la crinière et la queue
const DancingUnicorn = ({ size = 160, flip = false }: { size?: number; flip?: boolean }) => (
  <svg
    viewBox="0 0 220 200"
    width={size}
    height={(size * 200) / 220}
    style={{ transform: flip ? "scaleX(-1)" : undefined, overflow: "visible" }}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="uni-horn" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#FFC93C" />
        <stop offset="1" stopColor="#FFF3B0" />
      </linearGradient>
      <linearGradient id="uni-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#F1ECFF" />
      </linearGradient>
    </defs>
    <g className="uni-hop">
      {/* Queue arc-en-ciel */}
      <g className="uni-tail">
        <path d="M58 92 C30 80 18 108 30 128 C38 140 26 150 18 152" stroke="#FF5FA2" strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M58 98 C36 92 30 116 40 132 C46 142 38 154 30 158" stroke="#B57BFF" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M58 104 C44 104 40 122 48 136 C52 146 48 156 42 162" stroke="#5FC8FF" strokeWidth="7" fill="none" strokeLinecap="round" />
      </g>
      {/* Pattes arrière et avant (deux paires qui alternent) */}
      <g className="uni-leg-a">
        <rect x="68" y="118" width="14" height="50" rx="7" fill="url(#uni-body)" stroke="#D9CFF5" strokeWidth="2" />
        <rect x="68" y="158" width="14" height="12" rx="4" fill="#FF5FA2" />
        <rect x="134" y="118" width="14" height="50" rx="7" fill="url(#uni-body)" stroke="#D9CFF5" strokeWidth="2" />
        <rect x="134" y="158" width="14" height="12" rx="4" fill="#FF5FA2" />
      </g>
      <g className="uni-leg-b">
        <rect x="86" y="118" width="14" height="50" rx="7" fill="url(#uni-body)" stroke="#D9CFF5" strokeWidth="2" />
        <rect x="86" y="158" width="14" height="12" rx="4" fill="#B57BFF" />
        <rect x="116" y="118" width="14" height="50" rx="7" fill="url(#uni-body)" stroke="#D9CFF5" strokeWidth="2" />
        <rect x="116" y="158" width="14" height="12" rx="4" fill="#B57BFF" />
      </g>
      {/* Corps */}
      <ellipse cx="108" cy="108" rx="56" ry="34" fill="url(#uni-body)" stroke="#D9CFF5" strokeWidth="2" />
      <circle cx="80" cy="112" r="5" fill="#FFD6EA" />
      <circle cx="96" cy="124" r="3.5" fill="#E3D6FF" />
      {/* Tête et cou */}
      <g className="uni-head">
        <path d="M140 96 C146 70 150 58 160 48 L178 62 C170 74 166 90 162 106 Z" fill="url(#uni-body)" stroke="#D9CFF5" strokeWidth="2" />
        <ellipse cx="174" cy="52" rx="26" ry="20" fill="url(#uni-body)" stroke="#D9CFF5" strokeWidth="2" />
        <ellipse cx="194" cy="60" rx="12" ry="10" fill="#FFE3F0" />
        <circle cx="198" cy="58" r="2" fill="#E26AA0" />
        <path d="M160 34 L156 18 L168 30 Z" fill="#FFFFFF" stroke="#D9CFF5" strokeWidth="2" />
        <path d="M170 33 L188 2 L180 36 Z" fill="url(#uni-horn)" stroke="#F0B429" strokeWidth="1.5" />
        <path d="M174 26 L183 22 M176 18 L185 14" stroke="#F0B429" strokeWidth="1.5" />
        <circle cx="176" cy="48" r="5" fill="#2B2350" />
        <circle cx="178" cy="46" r="1.6" fill="#FFFFFF" />
        <ellipse cx="182" cy="62" rx="5" ry="3" fill="#FFB3D1" opacity="0.8" />
        {/* Crinière */}
        <g className="uni-mane">
          <circle cx="156" cy="36" r="9" fill="#FF5FA2" />
          <circle cx="150" cy="50" r="9" fill="#B57BFF" />
          <circle cx="146" cy="65" r="9" fill="#5FC8FF" />
          <circle cx="143" cy="80" r="8" fill="#FF5FA2" />
          <circle cx="164" cy="30" r="7" fill="#FFC93C" />
        </g>
      </g>
    </g>
  </svg>
);
export default DancingUnicorn;
