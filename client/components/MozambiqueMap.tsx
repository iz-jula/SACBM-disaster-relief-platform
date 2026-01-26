interface MozambiqueMapProps {
  selectedRegion?: string;
  onRegionSelect: (region: string) => void;
}

export default function MozambiqueMap({ selectedRegion, onRegionSelect }: MozambiqueMapProps) {
  const regions = [
    { name: "Inhambane", x: 75, y: 85 },
    { name: "Gaza", x: 65, y: 75 },
    { name: "Sofala", x: 60, y: 50 },
    { name: "Tete", x: 50, y: 30 },
    { name: "Manica", x: 55, y: 45 },
    { name: "Maputo", x: 80, y: 95 },
    { name: "Matola", x: 82, y: 93 },
    { name: "Xai-Xai", x: 70, y: 80 },
    { name: "Quelimane", x: 55, y: 55 },
    { name: "Chimoio", x: 58, y: 40 },
    { name: "Beira", x: 62, y: 52 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Mozambique Regions</h2>

      <div className="relative w-full" style={{ paddingBottom: "133%" }}>
        <svg
          viewBox="0 0 100 133"
          className="absolute inset-0 w-full h-full rounded-lg border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100"
        >
          {/* Simplified Mozambique outline */}
          <defs>
            <linearGradient id="mzGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#e0f2fe", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#cffafe", stopOpacity: 1 }} />
            </linearGradient>
          </defs>

          {/* Main country outline (simplified) */}
          <path
            d="M 50 5 L 85 15 L 90 25 L 88 35 L 85 50 L 87 70 L 85 90 L 80 105 L 75 125 L 70 130 L 60 128 L 55 125 L 50 120 L 45 125 L 40 128 L 35 130 L 30 125 L 25 110 L 20 100 L 15 85 L 12 70 L 10 50 L 8 35 L 10 25 L 15 15 Z"
            fill="url(#mzGradient)"
            stroke="#64748b"
            strokeWidth="0.5"
          />

          {/* Indian Ocean label */}
          <text
            x="92"
            y="70"
            fontSize="3"
            fill="#64748b"
            opacity="0.5"
            textAnchor="middle"
          >
            Indian Ocean
          </text>

          {/* Region markers and labels */}
          {regions.map((region) => {
            const isSelected = selectedRegion === region.name;
            return (
              <g key={region.name}>
                {/* Circle marker */}
                <circle
                  cx={region.x}
                  cy={region.y}
                  r={isSelected ? 2.5 : 1.8}
                  fill={isSelected ? "#FF8800" : "#3b82f6"}
                  stroke={isSelected ? "#ea580c" : "#1e40af"}
                  strokeWidth={isSelected ? 0.5 : 0.3}
                  opacity={0.8}
                  style={{ cursor: "pointer" }}
                  onClick={() => onRegionSelect(region.name)}
                />
                {/* Label */}
                <text
                  x={region.x}
                  y={region.y + 4}
                  fontSize={isSelected ? "2.2" : "1.8"}
                  fill={isSelected ? "#FF8800" : "#1e40af"}
                  textAnchor="middle"
                  fontWeight={isSelected ? "bold" : "normal"}
                  style={{ cursor: "pointer", pointerEvents: "none" }}
                >
                  {region.name.split(" ")[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Region List */}
      <div className="mt-6">
        <p className="text-sm font-medium text-slate-700 mb-3">
          Click on map or select a region:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {regions.map((region) => (
            <button
              key={region.name}
              onClick={() => onRegionSelect(region.name)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedRegion === region.name
                  ? "bg-primary text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {region.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
