import { MuscleCoverageData, MuscleId } from "@/lib/calculations/muscleHeatmap";
import { MuscleGroupRegion } from "./MuscleGroupRegion";

interface BodySvgProps {
  heatmapData: Record<MuscleId, MuscleCoverageData>;
  getFill: (muscleId: MuscleId) => string;
  onHover: (data: MuscleCoverageData | null) => void;
  onSelect: (muscleId: MuscleId) => void;
}

export function AnteriorBodySvg({ heatmapData, getFill, onHover, onSelect }: BodySvgProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-[230px] sm:max-w-[260px] md:max-w-[280px]">
      <span className="text-[11px] uppercase tracking-widest text-[#142746] font-bold mb-2 text-center">
        Anterior (Front View)
      </span>
      <div className="w-full aspect-[280/440] relative">
        <svg viewBox="0 0 280 440" className="w-full h-full">
          {/* Body Background Silhouette / Contours */}
          <g fill="none" stroke="#142746" strokeWidth="1.5">
            <ellipse cx="140" cy="35" rx="18" ry="24" stroke="#142746" strokeWidth="2" />
            <path d="M132 58 L130 75 M148 58 L150 75" />
            <path d="M105 85 L85 105 L65 170 L55 230 L70 232 L85 180 L95 190 L95 240 L105 320 L108 400 L125 405 L135 320 L140 250 L145 320 L155 405 L172 400 L175 320 L185 240 L185 190 L195 180 L210 232 L225 230 L215 170 L195 105 L175 85 Z" />
          </g>

          {/* 1. Front & Lateral Shoulders */}
          <MuscleGroupRegion muscleId="front_delts" heatmapData={heatmapData} onHover={onHover} onSelect={onSelect}>
            <path
              d="M105 85 C95 88 82 98 80 115 C78 128 82 142 90 148 C93 138 98 120 102 105 Z"
              fill={getFill("front_delts")}
              stroke="#1E1E1E"
              strokeWidth="1.5"
            />
            <path
              d="M175 85 C185 88 198 98 200 115 C202 128 198 142 190 148 C187 138 182 120 178 105 Z"
              fill={getFill("front_delts")}
              stroke="#1E1E1E"
              strokeWidth="1.5"
            />
          </MuscleGroupRegion>

          {/* 2. Chest */}
          <MuscleGroupRegion muscleId="chest" heatmapData={heatmapData} onHover={onHover} onSelect={onSelect}>
            <path
              d="M138 90 L112 92 C104 102 102 122 105 138 C115 145 132 146 138 140 Z"
              fill={getFill("chest")}
              stroke="#1E1E1E"
              strokeWidth="1.5"
            />
            <path
              d="M142 90 L168 92 C176 102 178 122 175 138 C165 145 148 146 142 140 Z"
              fill={getFill("chest")}
              stroke="#1E1E1E"
              strokeWidth="1.5"
            />
          </MuscleGroupRegion>

          {/* 3. Biceps */}
          <MuscleGroupRegion muscleId="biceps" heatmapData={heatmapData} onHover={onHover} onSelect={onSelect}>
            <path
              d="M86 145 C80 152 76 168 76 182 C82 184 88 182 92 175 C95 165 92 152 86 145 Z"
              fill={getFill("biceps")}
              stroke="#1E1E1E"
              strokeWidth="1.5"
            />
            <path
              d="M194 145 C200 152 204 168 204 182 C198 184 192 182 188 175 C185 165 188 152 194 145 Z"
              fill={getFill("biceps")}
              stroke="#1E1E1E"
              strokeWidth="1.5"
            />
          </MuscleGroupRegion>

          {/* 4. Forearms (Front) */}
          <MuscleGroupRegion muscleId="forearms" heatmapData={heatmapData} onHover={onHover} onSelect={onSelect}>
            <path
              d="M74 186 C68 195 62 215 58 230 L68 232 C74 218 82 200 86 186 Z"
              fill={getFill("forearms")}
              stroke="#1E1E1E"
              strokeWidth="1.5"
            />
            <path
              d="M206 186 C212 195 218 215 222 230 L212 232 C206 218 198 200 194 186 Z"
              fill={getFill("forearms")}
              stroke="#1E1E1E"
              strokeWidth="1.5"
            />
          </MuscleGroupRegion>

          {/* 5. Abs */}
          <MuscleGroupRegion muscleId="abs" heatmapData={heatmapData} onHover={onHover} onSelect={onSelect}>
            <path
              d="M128 148 H138 V165 H128 Z M142 148 H152 V165 H142 Z"
              fill={getFill("abs")}
              stroke="#1E1E1E"
              strokeWidth="1.2"
            />
            <path
              d="M128 168 H138 V186 H128 Z M142 168 H152 V186 H142 Z"
              fill={getFill("abs")}
              stroke="#1E1E1E"
              strokeWidth="1.2"
            />
            <path
              d="M129 189 H138 V212 L132 216 Z M142 189 H151 L148 216 L142 212 Z"
              fill={getFill("abs")}
              stroke="#1E1E1E"
              strokeWidth="1.2"
            />
          </MuscleGroupRegion>

          {/* 6. Obliques */}
          <MuscleGroupRegion muscleId="obliques" heatmapData={heatmapData} onHover={onHover} onSelect={onSelect}>
            <path
              d="M110 148 C108 165 110 190 114 212 L125 212 C122 190 122 165 125 148 Z"
              fill={getFill("obliques")}
              stroke="#1E1E1E"
              strokeWidth="1.5"
            />
            <path
              d="M170 148 C172 165 170 190 166 212 L155 212 C158 190 158 165 155 148 Z"
              fill={getFill("obliques")}
              stroke="#1E1E1E"
              strokeWidth="1.5"
            />
          </MuscleGroupRegion>

          {/* 7. Quadriceps */}
          <MuscleGroupRegion muscleId="quadriceps" heatmapData={heatmapData} onHover={onHover} onSelect={onSelect}>
            <path
              d="M106 230 C102 260 102 285 108 316 C114 318 126 318 134 314 C136 280 136 250 134 230 Z"
              fill={getFill("quadriceps")}
              stroke="#1E1E1E"
              strokeWidth="1.5"
            />
            <path
              d="M174 230 C178 260 178 285 172 316 C166 318 154 318 146 314 C144 280 144 250 146 230 Z"
              fill={getFill("quadriceps")}
              stroke="#1E1E1E"
              strokeWidth="1.5"
            />
          </MuscleGroupRegion>

          {/* 8. Calves (Anterior) */}
          <MuscleGroupRegion muscleId="calves" heatmapData={heatmapData} onHover={onHover} onSelect={onSelect}>
            <path
              d="M109 330 C106 350 108 375 112 396 C116 398 124 398 127 394 C129 375 128 350 126 330 Z"
              fill={getFill("calves")}
              stroke="#1E1E1E"
              strokeWidth="1.5"
            />
            <path
              d="M171 330 C174 350 172 375 168 396 C164 398 156 398 153 394 C151 375 152 350 154 330 Z"
              fill={getFill("calves")}
              stroke="#1E1E1E"
              strokeWidth="1.5"
            />
          </MuscleGroupRegion>
        </svg>
      </div>
    </div>
  );
}
