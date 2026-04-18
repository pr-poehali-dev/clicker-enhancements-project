import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Upgrade, Achievement, colorMap, formatNum } from "@/game/gameTypes";

type Tab = "upgrades" | "achievements" | "stats";

interface SidePanelProps {
  coins: number;
  crystals: number;
  totalCoins: number;
  totalClicks: number;
  clickPower: number;
  cps: number;
  autoClickers: number;
  totalPerSec: number;
  sessionMinutes: number;
  upgrades: Upgrade[];
  achievements: Achievement[];
  onBuyUpgrade: (upg: Upgrade) => void;
}

export default function SidePanel({
  coins,
  crystals,
  totalCoins,
  totalClicks,
  clickPower,
  cps,
  autoClickers,
  totalPerSec,
  sessionMinutes,
  upgrades,
  achievements,
  onBuyUpgrade,
}: SidePanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("upgrades");

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{ background: "#080d1a", border: "1px solid rgba(0,255,255,0.12)" }}
    >
      {/* Tabs */}
      <div className="flex" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        {(["upgrades", "achievements", "stats"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-3 text-xs font-bold tracking-wider transition-all"
            style={{
              fontFamily: "'Rubik', sans-serif",
              color: activeTab === tab ? "#00ffff" : "rgba(255,255,255,0.3)",
              borderBottom: activeTab === tab ? "2px solid #00ffff" : "2px solid transparent",
              textShadow: activeTab === tab ? "0 0 8px #00ffff" : "none",
              background: "transparent",
            }}
          >
            {tab === "upgrades" && "УЛУЧШЕНИЯ"}
            {tab === "achievements" && `ДОСТИЖ. ${unlockedCount}/${achievements.length}`}
            {tab === "stats" && "СТАТИСТИКА"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="overflow-y-auto" style={{ maxHeight: "450px" }}>

        {/* UPGRADES */}
        {activeTab === "upgrades" && (
          <div className="p-3 space-y-2">
            {upgrades.map(upg => {
              const c = colorMap[upg.color] || colorMap.cyan;
              const canAfford = coins >= upg.costCoins;
              const maxed = !!(upg.max && upg.owned >= upg.max);
              return (
                <button
                  key={upg.id}
                  disabled={!canAfford || maxed}
                  onClick={() => onBuyUpgrade(upg)}
                  className="w-full rounded-lg p-3 flex items-center gap-3 text-left transition-all"
                  style={{
                    background: "#050810",
                    border: `1px solid ${canAfford && !maxed ? c.hex + "60" : "rgba(255,255,255,0.06)"}`,
                    boxShadow: canAfford && !maxed ? `0 0 10px ${c.hex}15` : "none",
                    opacity: maxed ? 0.35 : canAfford ? 1 : 0.45,
                    cursor: !canAfford || maxed ? "not-allowed" : "pointer",
                    transform: "translateY(0)",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={e => { if (canAfford && !maxed) e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: c.hex + "15" }}
                  >
                    <Icon name={upg.icon as never} size={18} fallback="Zap" style={{ color: c.hex }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-white/90" style={{ fontFamily: "'Rubik', sans-serif" }}>{upg.name}</span>
                      {upg.owned > 0 && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded font-black"
                          style={{ fontFamily: "'Orbitron', monospace", background: c.hex + "20", color: c.hex }}
                        >
                          ×{upg.owned}
                        </span>
                      )}
                      {maxed && <span className="text-xs text-yellow-400" style={{ fontFamily: "'Rubik', sans-serif" }}>MAX</span>}
                    </div>
                    <div className="text-xs text-white/35 mt-0.5" style={{ fontFamily: "'Rubik', sans-serif" }}>{upg.description}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div
                      className="text-sm font-black"
                      style={{
                        fontFamily: "'Orbitron', monospace",
                        color: maxed ? "rgba(255,255,255,0.2)" : canAfford ? c.hex : "rgba(255,255,255,0.25)",
                      }}
                    >
                      {maxed ? "—" : formatNum(upg.costCoins)}
                    </div>
                    {!maxed && <div className="text-xs text-white/25" style={{ fontFamily: "'Rubik', sans-serif" }}>монет</div>}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ACHIEVEMENTS */}
        {activeTab === "achievements" && (
          <div className="p-3 grid grid-cols-2 gap-2">
            {achievements.map(a => (
              <div
                key={a.id}
                className="rounded-lg p-3 transition-all"
                style={{
                  background: a.unlocked ? "rgba(255,200,0,0.05)" : "#050810",
                  border: `1px solid ${a.unlocked ? "rgba(255,200,0,0.4)" : "rgba(255,255,255,0.05)"}`,
                  opacity: a.unlocked ? 1 : 0.4,
                  boxShadow: a.unlocked ? "0 0 12px rgba(255,200,0,0.1)" : "none",
                }}
              >
                <div className="text-2xl mb-1">{a.icon}</div>
                <div
                  className="text-xs font-bold mb-0.5"
                  style={{ fontFamily: "'Rubik', sans-serif", color: a.unlocked ? "#ffcc00" : "rgba(255,255,255,0.5)" }}
                >
                  {a.name}
                </div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Rubik', sans-serif" }}>{a.description}</div>
              </div>
            ))}
          </div>
        )}

        {/* STATS */}
        {activeTab === "stats" && (
          <div className="p-4 space-y-0">
            {[
              { label: "Монет заработано всего", value: formatNum(totalCoins), color: "#00ffff" },
              { label: "Монет сейчас",           value: formatNum(coins),      color: "#00ffff" },
              { label: "Кристаллов",             value: `💎 ${crystals}`,      color: "#ff00ff" },
              { label: "Всего кликов",           value: formatNum(totalClicks), color: "#00ff88" },
              { label: "Сила клика",             value: `+${clickPower}`,      color: "#ffff00" },
              { label: "Пассивный доход",        value: `${cps}/сек`,          color: "#00ffff" },
              { label: "Авто-кликеры",           value: autoClickers > 0 ? `${autoClickers} шт.` : "нет", color: autoClickers > 0 ? "#00ff88" : "rgba(255,255,255,0.3)" },
              { label: "Итого в секунду",        value: `${totalPerSec}/сек`,  color: "#00ffff" },
              { label: "Достижения",             value: `${unlockedCount}/${achievements.length}`, color: "#ffcc00" },
              { label: "Время сессии",           value: `${sessionMinutes} мин`, color: "rgba(255,255,255,0.4)" },
            ].map((s, i) => (
              <div key={i} className="flex justify-between items-center py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Rubik', sans-serif" }}>{s.label}</span>
                <span className="font-black text-sm" style={{ fontFamily: "'Orbitron', monospace", color: s.color }}>{s.value}</span>
              </div>
            ))}

            <div className="pt-4">
              <div className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Rubik', sans-serif" }}>ПРОГРЕСС ДОСТИЖЕНИЙ</div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(unlockedCount / achievements.length) * 100}%`, background: "linear-gradient(90deg, #00ffff, #ff00ff)" }}
                />
              </div>
              <div className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Rubik', sans-serif" }}>
                {Math.round((unlockedCount / achievements.length) * 100)}% открыто
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
