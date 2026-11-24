import { MuscleCoverageData, MuscleId } from "@/lib/calculations/muscleHeatmap";
import { MuscleGroupRegion } from "./MuscleGroupRegion";

interface BodySvgProps {
  heatmapData: Record<MuscleId, MuscleCoverageData>;
  getFill: (muscleId: MuscleId) => string;
  onHover: (data: MuscleCoverageData | null) => void;
  onSelect: (muscleId: MuscleId) => void;
}

export function PosteriorBodySvg({ heatmapData, getFill, onHover, onSelect }: BodySvgProps) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[11px] font-mono uppercase tracking-widest text-dark font-black mb-2">
        Posterior (Back View)
      </span>
      <div className="w-56 sm:w-64 md:w-72 h-[420px] relative">
        <svg viewBox="0 0 280 440" className="w-full h-full drop-shadow-sm">
          {/* Body Background Silhouette / Contours */}
          <g fill="none" stroke="#171717" strokeWidth="1.5">
            <ellipse cx="140" cy="35" rx="18" ry="24" stroke="#171717" strokeWidth="2" />
            <path d="M132 58 L128 75 M148 58 L152 75" />
            <path d="M105 85 L85 105 L65 170 L55 230 L70 232 L85 180 L95 190 L95 240 L105 320 L108 400 L125 405 L135 320 L140 250 L145 320 L155 405 L172 400 L175 320 L185 240 L185 190 L195 180 L210 232 L225 230 L215 170 L195 105 L175 85 Z" />
          </g>

          {/* 1. Upper Back */}
          <MuscleGroupRegion muscleId="upper_back" heatmapData={heatmapData} onHover={onHover} onSelect={onSelect}>
            <path
              d="M140 75 L160 85 L168 115 L140 148 L112 115 L120 85 Z"
              fill={getFill("upper_back")}
              stroke="#1E1E1E"
              strokeWidth="1.5"
            />
          </MuscleGroupRegion>

          {/* 2. Rear Shoulders */}
          <MuscleGroupRegion muscleId="rear_delts" heatmapData={heatmapData} onHover={onHover} onSelect={onSelect}>
            <path
              d="M104 88 C94 92 82 102 80 118 C83 130 92 138 98 135 C104 125 106 108 108 96 Z"
              fill={getFill("rear_delts")}
              stroke="#1E1E1E"
              strokeWidth="1.5"
            />
            <path
              d="M176 88 C186 92 198 102 200 118 C197 130 188 138 182 135 C176 125 174 108 172 96 Z"
              fill={getFill("rear_delts")}
              stroke="#1E1E1E"
              strokeWidth="1.5"
            />
          </MuscleGroupRegion>

          {/* 3. Triceps */}
          <MuscleGroupRegion muscleId="triceps" heatmapData={heatmapData} onHover={onHover} onSelect={onSelect}>
            <path
              d="M84 140 C78 150 74 166 74 180 C80 182 86 180 90 174 C93 162 90 150 84 140 Z"
              fill={getFill("triceps")}
              stroke="#1E1E1E"
              strokeWidth="1.5"
            />
            <path
              d="M196 140 C202 150 206 166 206 180 C200 182 194 180 190 174 C187 162 190 150 196 140 Z"
              fill={getFill("triceps")}
              stroke="#1E1E1E"
              strokeWidth="1.5"
            />
          </MuscleGroupRegion>

          {/* 4. Lats */}
          <MuscleGroupRegion muscleId="lats" heatmapData={heatmapData} onHover={onHover} onSelect={onSelect}>
            <path
              d="M112 120 C105 135 106 160 114 180 L132 175 L138 148 Z"
              fill={getFill("lats")}
              stroke="#1E1E1E"
              strokeWidth="1.5"
            />
            <path
              d="M168 120 C175 135 174 160 166 180 L148 175 L142 148 Z"
              fill={getFill("lats")}
              stroke="#1E1E1E"
              strokeWidth="1.5"
            />
          </MuscleGroupRegion>

          {/* 5. Lower Back */}
          <MuscleGroupRegion muscleId="lower_back" heatmapData={heatmapData} onHover={onHover} onSelect={onSelect}>
            <path
              d="M132 178 H148 L152 216 H128 Z"
              fill={getFill("lower_back")}
              stroke="#1E1E1E"
              strokeWidth="1.5"
            />
          </MuscleGroupRegion>

          {/* 6. Forearms (Back) */}
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

          {/* 7. Glutes */}
          <MuscleGroupRegion muscleId="glutes" heatmapData={heatmapData} onHover={onHover} onSelect={onSelect}>
            <path
              d="M106 218 C104 235 106 255 114 266 C124 268 135 264 139 252 L138 218 Z"
              fill={getFill("glutes")}
              stroke="#1E1E1E"
              strokeWidth="1.5"
            />
            <path
              d="M174 218 C176 235 174 255 166 266 C156 268 145 264 141 252 L142 218 Z"
              fill={getFill("glutes")}
              stroke="#1E1E1E"
              strokeWidth="1.5"
            />
          </MuscleGroupRegion>

          {/* 8. Hamstrings */}
          <MuscleGroupRegion muscleId="hamstrings" heatmapData={heatmapData} onHover={onHover} onSelect={onSelect}>
            <path
              d="M112 270 C108 285 108 305 110 320 C118 322 128 322 134 318 C136 295 135 280 134 270 Z"
              fill={getFill("hamstrings")}
              stroke="#1E1E1E"
              strokeWidth="1.5"
            />
            <path
              d="M168 270 C172 285 172 305 170 320 C162 322 152 322 146 318 C144 295 145 280 146 270 Z"
              fill={getFill("hamstrings")}
              stroke="#1E1E1E"
              strokeWidth="1.5"
            />
          </MuscleGroupRegion>

          {/* 9. Calves (Posterior) */}
          <MuscleGroupRegion muscleId="calves" heatmapData={heatmapData} onHover={onHover} onSelect={onSelect}>
            <path
              d="M108 326 C104 345 106 370 110 395 C116 398 125 398 128 394 C132 370 130 345 128 326 Z"
              fill={getFill("calves")}
              stroke="#1E1E1E"
              strokeWidth="1.5"
            />
            <path
              d="M172 326 C176 345 174 370 170 395 C164 398 155 398 152 394 C148 370 150 345 152 326 Z"
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
