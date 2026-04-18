import { RefObject } from "react";
import { FloatNum, formatNum } from "@/game/gameTypes";

interface ClickZoneProps {
  btnRef: RefObject<HTMLButtonElement>;
  floatNums: FloatNum[];
  clickPower: number;
  totalClicks: number;
  totalCoins: number;
  autoClickers: number;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function ClickZone({
  btnRef,
  floatNums,
  clickPower,
  totalClicks,
  totalCoins,
  autoClickers,
  onClick,
}: ClickZoneProps) {
  return (
    <div className="flex flex-col items-center gap-5">

      {/* The big button */}
      <div className="relative flex items-center justify-center">
        {/* Outer pulse rings */}
        <div className="absolute w-56 h-56 rounded-full" style={{ border: "1px solid rgba(0,255,255,0.2)", animation: "pulse-ring 2s ease-in-out infinite" }} />
        <div className="absolute w-64 h-64 rounded-full" style={{ border: "1px solid rgba(0,255,255,0.08)", animation: "pulse-ring 2s ease-in-out infinite 0.5s" }} />

        <button
          ref={btnRef}
          onClick={onClick}
          className="relative w-48 h-48 rounded-full overflow-visible"
          style={{
            background: "radial-gradient(circle at 40% 35%, rgba(0,255,255,0.18) 0%, rgba(0,255,255,0.06) 50%, transparent 100%)",
            border: "3px solid #00ffff",
            boxShadow: "0 0 30px rgba(0,255,255,0.5), 0 0 60px rgba(0,255,255,0.2), inset 0 0 40px rgba(0,255,255,0.06)",
            cursor: "pointer",
            transition: "transform 0.08s ease, box-shadow 0.08s ease",
          }}
          onMouseDown={e => {
            e.currentTarget.style.transform = "scale(0.93)";
            e.currentTarget.style.boxShadow = "0 0 50px rgba(0,255,255,0.8), 0 0 80px rgba(0,255,255,0.4), inset 0 0 40px rgba(0,255,255,0.15)";
          }}
          onMouseUp={e => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 0 30px rgba(0,255,255,0.5), 0 0 60px rgba(0,255,255,0.2), inset 0 0 40px rgba(0,255,255,0.06)";
          }}
        >
          {/* Floating numbers */}
          {floatNums.map(fn => (
            <span
              key={fn.id}
              className="absolute text-base font-black pointer-events-none select-none"
              style={{
                left: fn.x,
                top: fn.y,
                color: "#00ffff",
                fontFamily: "'Orbitron', monospace",
                textShadow: "0 0 8px #00ffff",
                animation: "float-up 0.9s ease-out forwards",
                zIndex: 50,
              }}
            >
              +{fn.value}
            </span>
          ))}

          <div className="flex flex-col items-center justify-center h-full gap-1 select-none">
            <div className="text-5xl" style={{ filter: "drop-shadow(0 0 14px #00ffff) drop-shadow(0 0 28px #00ffff)" }}>⚡</div>
            <div className="text-xs font-black tracking-[0.2em]" style={{ fontFamily: "'Orbitron', monospace", color: "#00ffff" }}>КЛИК</div>
            <div className="text-xs" style={{ color: "rgba(0,255,255,0.5)", fontFamily: "'Rubik', sans-serif" }}>+{clickPower}</div>
          </div>
        </button>
      </div>

      {/* Mini stats grid */}
      <div className="w-full grid grid-cols-2 gap-2">
        {[
          { label: "КЛИКОВ",       value: formatNum(totalClicks), color: "#ffffff" },
          { label: "ВСЕГО",        value: formatNum(totalCoins),  color: "#ffffff" },
          { label: "СИЛА КЛИКА",   value: `+${clickPower}`,       color: "#00ff88" },
          {
            label: "АВТ. КЛИКЕРЫ",
            value: autoClickers > 0 ? `${autoClickers} 🤖` : "нет",
            color: autoClickers > 0 ? "#ff00ff" : "rgba(255,255,255,0.3)",
          },
        ].map((s, i) => (
          <div key={i} className="rounded-lg p-3 text-center" style={{ background: "#080d1a", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Rubik', sans-serif" }}>{s.label}</div>
            <div className="text-base font-black" style={{ fontFamily: "'Orbitron', monospace", color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
