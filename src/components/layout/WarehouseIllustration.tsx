export function WarehouseIllustration() {
  return (
    <div className="w-full flex items-center justify-center p-2">
      <svg
        viewBox="0 0 200 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-44 h-auto drop-shadow-md"
      >
        {/* Ground */}
        <ellipse cx="100" cy="112" rx="90" ry="6" fill="#04122b" opacity="0.6" />

        {/* Warehouse Building */}
        <polygon points="20,55 70,30 120,55 120,105 20,105" fill="#e2e8f0" />
        <polygon points="20,55 70,30 120,55" fill="#3b82f6" />
        <polygon points="20,55 22,57 70,33 118,57 120,55 70,30" fill="#60a5fa" />
        
        {/* Warehouse Gable Accent */}
        <polygon points="24,54 70,32 116,54" fill="#2563eb" />

        {/* Warehouse Roof window / logo circle */}
        <rect x="64" y="40" width="12" height="10" rx="1" fill="#ffffff" />
        <rect x="66" y="42" width="8" height="6" fill="#3b82f6" />

        {/* Roller Door Frame */}
        <rect x="42" y="65" width="56" height="40" rx="2" fill="#0f172a" />
        <rect x="46" y="68" width="48" height="37" fill="#0284c7" />
        
        {/* Shutter Slats */}
        <line x1="46" y1="73" x2="94" y2="73" stroke="#38bdf8" strokeWidth="1.5" />
        <line x1="46" y1="78" x2="94" y2="78" stroke="#38bdf8" strokeWidth="1.5" />
        <line x1="46" y1="83" x2="94" y2="83" stroke="#38bdf8" strokeWidth="1.5" />
        <line x1="46" y1="88" x2="94" y2="88" stroke="#38bdf8" strokeWidth="1.5" />
        <line x1="46" y1="93" x2="94" y2="93" stroke="#38bdf8" strokeWidth="1.5" />

        {/* Parcels on Ground */}
        <rect x="62" y="94" width="12" height="11" rx="1" fill="#d97706" />
        <line x1="62" y1="99" x2="74" y2="99" stroke="#b45309" strokeWidth="1" />
        <rect x="73" y="96" width="10" height="9" rx="1" fill="#f59e0b" />
        <rect x="67" y="86" width="9" height="8" rx="1" fill="#b45309" />

        {/* Delivery Truck */}
        <g transform="translate(115, 68)">
          {/* Cargo Container */}
          <rect x="0" y="8" width="42" height="26" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
          <line x1="38" y1="8" x2="38" y2="34" stroke="#e2e8f0" strokeWidth="1" />
          
          {/* Cabin */}
          <path d="M42 16 L52 16 L58 24 L58 34 L42 34 Z" fill="#f59e0b" />
          {/* Windshield */}
          <path d="M44 18 L50 18 L54 24 L44 24 Z" fill="#93c5fd" />
          {/* Cabin door line */}
          <line x1="48" y1="24" x2="48" y2="34" stroke="#d97706" strokeWidth="1" />
          {/* Headlight */}
          <rect x="56" y="28" width="2" height="4" rx="1" fill="#fef08a" />
          {/* Wheels */}
          <circle cx="10" cy="35" r="5" fill="#1e293b" />
          <circle cx="10" cy="35" r="2" fill="#94a3b8" />
          <circle cx="50" cy="35" r="5" fill="#1e293b" />
          <circle cx="50" cy="35" r="2" fill="#94a3b8" />
        </g>
      </svg>
    </div>
  );
}
