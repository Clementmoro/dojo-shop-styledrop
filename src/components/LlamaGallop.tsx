// Scène animée aux couleurs eXalt : un cavalier sur un lama qui galope
const NAVY = "#0A0F5C";
const PINK = "#F0047F";
const YELLOW = "#FFD600";
const CREAM = "#FFF8EC";
const SKIN = "#F2C6A0";

// animations partagées par la scène et le mini-jeu (classes .llama-scene / .is-galloping)
export const LLAMA_STYLES = `
      .llama-scene { position: relative; width: 100%; height: 100%; overflow: hidden; }
      .llama-scene svg { width: 100%; height: 100%; display: block; }
      .llama-scene .ground { stroke-dasharray: 10 14; }
      .llama-scene .leg, .llama-scene .rider-arm { transform-box: fill-box; }
      .llama-scene .leg { transform-origin: 50% 0%; }
      .llama-scene .rider-arm { transform-origin: 100% 100%; }
      .llama-scene .puff { opacity: 0; }
      @media (prefers-reduced-motion: no-preference) {
        .llama-scene.is-galloping .runner { animation: llama-bounce .36s ease-in-out infinite alternate; }
        .llama-scene.is-galloping .leg-a { animation: llama-leg .36s ease-in-out infinite alternate; }
        .llama-scene.is-galloping .leg-b { animation: llama-leg .36s ease-in-out infinite alternate-reverse; }
        .llama-scene.is-galloping .ground { animation: llama-ground .5s linear infinite; }
        .llama-scene.is-galloping .rider-arm { animation: llama-wave .5s ease-in-out infinite alternate; }
        .llama-scene.is-galloping .scarf { animation: llama-scarf .3s ease-in-out infinite alternate; transform-origin: 100% 0%; transform-box: fill-box; }
        .llama-scene.is-galloping .puff { animation: llama-puff 1s ease-out infinite; }
        .llama-scene.is-galloping .puff-2 { animation-delay: .33s; }
        .llama-scene.is-galloping .puff-3 { animation-delay: .66s; }
        .llama-scene.is-galloping .star { animation: llama-twinkle 1.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .llama-scene.is-galloping .star-2 { animation-delay: .8s; }
      }
      @keyframes llama-bounce { from { transform: translateY(0); } to { transform: translateY(-5px); } }
      @keyframes llama-leg { from { transform: rotate(-28deg); } to { transform: rotate(28deg); } }
      @keyframes llama-ground { to { stroke-dashoffset: 24; } }
      @keyframes llama-wave { from { transform: rotate(-12deg); } to { transform: rotate(18deg); } }
      @keyframes llama-scarf { from { transform: rotate(-8deg); } to { transform: rotate(10deg); } }
      @keyframes llama-puff { 0% { opacity: .7; transform: translate(0, 0) scale(.6); } 100% { opacity: 0; transform: translate(-22px, -6px) scale(1.4); } }
      @keyframes llama-twinkle { 0%, 100% { opacity: .3; transform: scale(.7); } 50% { opacity: 1; transform: scale(1.1); } }
    `;

// le lama et son cavalier, dessinés pour un cadre de 160 × 120 (pattes au sol vers y = 107)
export const LlamaRider = () => (
  <g className="runner">
    {/* pattes */}
    <rect
      className="leg leg-a"
      x="58"
      y="80"
      width="6"
      height="27"
      rx="3"
      fill={CREAM}
      stroke={NAVY}
      strokeWidth="2"
    />
    <rect
      className="leg leg-b"
      x="69"
      y="80"
      width="6"
      height="27"
      rx="3"
      fill={CREAM}
      stroke={NAVY}
      strokeWidth="2"
    />
    <rect
      className="leg leg-b"
      x="91"
      y="80"
      width="6"
      height="27"
      rx="3"
      fill={CREAM}
      stroke={NAVY}
      strokeWidth="2"
    />
    <rect
      className="leg leg-a"
      x="102"
      y="80"
      width="6"
      height="27"
      rx="3"
      fill={CREAM}
      stroke={NAVY}
      strokeWidth="2"
    />

    {/* queue, corps, cou et tête du lama */}
    <circle cx="47" cy="68" r="6" fill={CREAM} stroke={NAVY} strokeWidth="2" />
    <ellipse
      cx="80"
      cy="72"
      rx="33"
      ry="15"
      fill={CREAM}
      stroke={NAVY}
      strokeWidth="2.5"
    />
    <path
      d="M100 70 L112 70 L121 32 L109 30 Z"
      fill={CREAM}
      stroke={NAVY}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path
      d="M110 24 L112 11 L116 22 Z M117 23 L121 10 L123 23 Z"
      fill={CREAM}
      stroke={NAVY}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <ellipse
      cx="117"
      cy="29"
      rx="11"
      ry="8"
      fill={CREAM}
      stroke={NAVY}
      strokeWidth="2.5"
    />
    <ellipse
      cx="127"
      cy="32"
      rx="6"
      ry="5"
      fill={CREAM}
      stroke={NAVY}
      strokeWidth="2.5"
    />
    <circle cx="119" cy="27" r="1.8" fill={NAVY} />
    <circle cx="130" cy="31" r="1" fill={NAVY} />
    <path
      d="M112 34 Q 115 37 118 35"
      stroke={PINK}
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />

    {/* couverture de selle rose */}
    <rect
      x="64"
      y="55"
      width="30"
      height="13"
      rx="3"
      fill={PINK}
      stroke={NAVY}
      strokeWidth="2"
    />
    <rect x="64" y="60" width="30" height="3" fill={YELLOW} />

    {/* cavalier */}
    <path
      d="M79 58 L88 68 L85 79"
      stroke={NAVY}
      strokeWidth="4.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M79 58 L77 38"
      stroke={PINK}
      strokeWidth="9"
      strokeLinecap="round"
    />
    <path
      d="M78 42 L94 48 L108 46"
      stroke={SKIN}
      strokeWidth="3.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line x1="108" y1="46" x2="114" y2="38" stroke={YELLOW} strokeWidth="1.5" />
    <g className="rider-arm">
      <path
        d="M77 41 L67 32 L63 22"
        stroke={SKIN}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <path className="scarf" d="M74 33 L60 36 L64 31 Z" fill={YELLOW} />
    <circle cx="76" cy="27" r="7" fill={SKIN} />
    <circle cx="78.5" cy="26" r="1.1" fill={NAVY} />
    <path
      d="M76 30.5 Q 78.5 32 80.5 30"
      stroke={NAVY}
      strokeWidth="1.2"
      fill="none"
      strokeLinecap="round"
    />
    {/* casquette jaune */}
    <path
      d="M69 25 Q 70 17 77 18 Q 83 19 83 24 Z"
      fill={YELLOW}
      stroke={NAVY}
      strokeWidth="1.5"
    />
    <path
      d="M81 23 L88 24"
      stroke={NAVY}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </g>
);

const LlamaGallop = ({ isGalloping = true }: { isGalloping?: boolean }) => (
  <div
    className={`llama-scene ${isGalloping ? "is-galloping" : ""}`}
    aria-hidden="true"
  >
    <style>{LLAMA_STYLES}</style>
    <svg viewBox="0 0 160 120">
      <defs>
        <linearGradient id="llama-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={NAVY} />
          <stop offset="1" stopColor="#1B2290" />
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill="url(#llama-sky)" />
      <circle cx="136" cy="20" r="9" fill={YELLOW} />
      <path
        className="star"
        d="M24 16 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z"
        fill={YELLOW}
      />
      <path
        className="star star-2"
        d="M58 10 l1.5 3.5 3.5 1.5 -3.5 1.5 -1.5 3.5 -1.5 -3.5 -3.5 -1.5 3.5 -1.5z"
        fill={PINK}
      />

      {/* sol qui défile */}
      <rect y="108" width="160" height="12" fill={PINK} opacity="0.9" />
      <line
        className="ground"
        x1="0"
        y1="113"
        x2="160"
        y2="113"
        stroke={YELLOW}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* poussière */}
      <circle className="puff" cx="50" cy="104" r="5" fill={CREAM} />
      <circle className="puff puff-2" cx="54" cy="106" r="4" fill={CREAM} />
      <circle className="puff puff-3" cx="46" cy="105" r="3.5" fill={CREAM} />

      <LlamaRider />
    </svg>
  </div>
);
export default LlamaGallop;

// Petit lama utilisé comme icône « retirer du panier »
export const LlamaIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M15.5 3.5 L16 1.8 L17 3.3 M17.6 3.3 L18.4 1.6 L18.9 3.6" />
    <path d="M15 5.2 Q15.3 3.4 17.4 3.4 Q19.6 3.5 19.8 5.3 L20.6 6 Q20.6 7.2 19.4 7.2 L18 7.2 L17.4 12.6 Q17 14.6 14.8 14.6 L7 14.6 Q4.3 14.6 4.3 12 Q4.3 10.2 6.4 9.8 L14.2 9.8 L15 5.2 Z" />
    <path d="M6.5 14.6 L6.2 21 M9 14.6 L9 21 M13 14.6 L13.2 21 M15.6 14.4 L16 21" />
    <circle cx="17.6" cy="5.2" r="0.4" fill="currentColor" />
  </svg>
);
