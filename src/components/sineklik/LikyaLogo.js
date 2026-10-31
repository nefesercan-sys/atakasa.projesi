// Likya Home logosu (orijinal): kemerli pencere; sol yarı lamelli panjur, sağ yarı sineklik tülü.
export function LikyaMark({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Likya Home" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#0f3d3e" />
      {/* kemerli pencere çerçevesi */}
      <path d="M14 52V28a18 18 0 0 1 36 0v24z" fill="none" stroke="#d9a441" strokeWidth="3" strokeLinejoin="round" />
      {/* sol: panjur lamelleri */}
      <g stroke="#d9a441" strokeWidth="2" strokeLinecap="round">
        <line x1="19" y1="28" x2="31" y2="28" />
        <line x1="19" y1="33" x2="31" y2="33" />
        <line x1="19" y1="38" x2="31" y2="38" />
        <line x1="19" y1="43" x2="31" y2="43" />
        <line x1="19" y1="48" x2="31" y2="48" />
      </g>
      {/* sağ: sineklik tülü */}
      <g stroke="#9fd8d0" strokeWidth="1.2" opacity="0.9">
        <line x1="34" y1="22" x2="34" y2="49" />
        <line x1="37.5" y1="19" x2="37.5" y2="49" />
        <line x1="41" y1="19" x2="41" y2="49" />
        <line x1="44.5" y1="22" x2="44.5" y2="49" />
        <line x1="34" y1="30" x2="45" y2="30" />
        <line x1="34" y1="38" x2="45" y2="38" />
      </g>
      <line x1="32.5" y1="20" x2="32.5" y2="50" stroke="#d9a441" strokeWidth="2" />
    </svg>
  );
}

export default function LikyaLogo({ size = 40 }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LikyaMark size={size} />
      <span className="leading-none">
        <span className="block font-black tracking-[0.18em] text-white text-base">LIKYA</span>
        <span className="block font-light tracking-[0.42em] text-[#d9a441] text-[11px] mt-1">HOME</span>
      </span>
    </span>
  );
}
