import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const SAVE_KEY = "neon_clicker_save_v1";

interface MenuProps {
  onPlay: () => void;
}

function hasSave(): boolean {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const s = JSON.parse(raw);
    return (s.totalClicks ?? 0) > 0;
  } catch {
    return false;
  }
}

function getSaveInfo(): { coins: number; totalClicks: number } {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { coins: 0, totalClicks: 0 };
    const s = JSON.parse(raw);
    return { coins: s.coins ?? 0, totalClicks: s.totalClicks ?? 0 };
  } catch {
    return { coins: 0, totalClicks: 0 };
  }
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return Math.floor(n).toString();
}

export default function Menu({ onPlay }: MenuProps) {
  const [showAbout, setShowAbout] = useState(false);
  const [saveExists, setSaveExists] = useState(false);
  const [saveInfo, setSaveInfo] = useState({ coins: 0, totalClicks: 0 });
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    setSaveExists(hasSave());
    setSaveInfo(getSaveInfo());
  }, []);

  // Periodic glitch on title
  useEffect(() => {
    const t = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const handleReset = () => {
    if (!confirm("Удалить сохранение и начать заново?")) return;
    localStorage.removeItem(SAVE_KEY);
    setSaveExists(false);
    setSaveInfo({ coins: 0, totalClicks: 0 });
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: "#050810",
        backgroundImage:
          "linear-gradient(rgba(0,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-80px] left-[10%] w-[500px] h-[500px] rounded-full opacity-[0.09]"
          style={{ background: "radial-gradient(circle, #00ffff 0%, transparent 70%)", filter: "blur(90px)" }}
        />
        <div
          className="absolute bottom-[-60px] right-[5%] w-[420px] h-[420px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #ff00ff 0%, transparent 70%)", filter: "blur(90px)" }}
        />
        <div
          className="absolute top-[40%] right-[15%] w-[280px] h-[280px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #aa00ff 0%, transparent 70%)", filter: "blur(70px)" }}
        />
        {/* Scanlines */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.01) 2px, rgba(0,255,255,0.01) 4px)",
          }}
        />
      </div>

      {/* Version badge */}
      <div
        className="fixed top-5 right-6 text-xs px-2 py-1 rounded"
        style={{
          fontFamily: "'Orbitron', monospace",
          color: "rgba(0,255,255,0.35)",
          border: "1px solid rgba(0,255,255,0.12)",
          background: "rgba(0,255,255,0.04)",
        }}
      >
        v1.0
      </div>

      {/* Main card */}
      <div className="relative z-10 flex flex-col items-center px-6 w-full max-w-sm">

        {/* Logo / Title */}
        <div className="mb-12 text-center select-none">
          {/* Decorative top line */}
          <div className="flex items-center gap-3 mb-6 justify-center">
            <div className="h-px w-16" style={{ background: "linear-gradient(90deg, transparent, #00ffff)" }} />
            <div className="text-xs tracking-[0.4em]" style={{ color: "rgba(0,255,255,0.5)", fontFamily: "'Orbitron', monospace" }}>
              CYBER IDLE
            </div>
            <div className="h-px w-16" style={{ background: "linear-gradient(90deg, #00ffff, transparent)" }} />
          </div>

          {/* Title with glitch */}
          <h1
            className="font-black text-5xl tracking-tight leading-none mb-2 transition-all"
            style={{
              fontFamily: "'Orbitron', monospace",
              color: "#00ffff",
              textShadow: glitch
                ? "3px 0 #ff00ff, -3px 0 #00ff88, 0 0 20px #00ffff"
                : "0 0 10px #00ffff, 0 0 30px #00ffff, 0 0 60px rgba(0,255,255,0.4)",
              letterSpacing: glitch ? "0.06em" : "0.02em",
              filter: glitch ? "brightness(1.3)" : "brightness(1)",
            }}
          >
            NEON
          </h1>
          <h1
            className="font-black text-5xl tracking-tight leading-none"
            style={{
              fontFamily: "'Orbitron', monospace",
              color: "#ff00ff",
              textShadow: glitch
                ? "-3px 0 #00ffff, 3px 0 #ffff00, 0 0 20px #ff00ff"
                : "0 0 10px #ff00ff, 0 0 30px #ff00ff, 0 0 60px rgba(255,0,255,0.4)",
            }}
          >
            CLICKER
          </h1>

          <div
            className="mt-4 text-sm"
            style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Rubik', sans-serif" }}
          >
            Кликай. Прокачивай. Доминируй.
          </div>
        </div>

        {/* Save info */}
        {saveExists && (
          <div
            className="w-full mb-6 rounded-xl p-4 flex items-center gap-4 animate-fade-in"
            style={{
              background: "rgba(0,255,136,0.05)",
              border: "1px solid rgba(0,255,136,0.25)",
              boxShadow: "0 0 20px rgba(0,255,136,0.08)",
            }}
          >
            <div
              className="text-2xl"
              style={{ filter: "drop-shadow(0 0 8px #00ff88)" }}
            >
              💾
            </div>
            <div className="flex-1">
              <div
                className="text-xs font-bold mb-1"
                style={{ color: "#00ff88", fontFamily: "'Rubik', sans-serif" }}
              >
                СОХРАНЕНИЕ НАЙДЕНО
              </div>
              <div
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Rubik', sans-serif" }}
              >
                {formatNum(saveInfo.coins)} монет · {formatNum(saveInfo.totalClicks)} кликов
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3">

          {/* Play / Continue */}
          <button
            onClick={onPlay}
            className="w-full py-4 rounded-xl font-black text-base tracking-widest relative overflow-hidden group"
            style={{
              fontFamily: "'Orbitron', monospace",
              background: "transparent",
              border: "2px solid #00ffff",
              color: "#00ffff",
              boxShadow: "0 0 20px rgba(0,255,255,0.3), inset 0 0 20px rgba(0,255,255,0.04)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(0,255,255,0.12)";
              e.currentTarget.style.boxShadow = "0 0 40px rgba(0,255,255,0.5), inset 0 0 30px rgba(0,255,255,0.08)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(0,255,255,0.3), inset 0 0 20px rgba(0,255,255,0.04)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <Icon name={saveExists ? "Play" : "Zap"} size={18} />
              {saveExists ? "ПРОДОЛЖИТЬ" : "НАЧАТЬ ИГРУ"}
            </span>
          </button>

          {/* New game (only if save exists) */}
          {saveExists && (
            <button
              onClick={handleReset}
              className="w-full py-3 rounded-xl font-bold text-sm tracking-widest"
              style={{
                fontFamily: "'Orbitron', monospace",
                background: "transparent",
                border: "1px solid rgba(255,0,255,0.3)",
                color: "rgba(255,0,255,0.6)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(255,0,255,0.7)";
                e.currentTarget.style.color = "#ff00ff";
                e.currentTarget.style.boxShadow = "0 0 16px rgba(255,0,255,0.2)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(255,0,255,0.3)";
                e.currentTarget.style.color = "rgba(255,0,255,0.6)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              НОВАЯ ИГРА
            </button>
          )}

          {/* About */}
          <button
            onClick={() => setShowAbout(v => !v)}
            className="w-full py-3 rounded-xl font-bold text-sm tracking-widest"
            style={{
              fontFamily: "'Orbitron', monospace",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.3)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
              e.currentTarget.style.color = "rgba(255,255,255,0.6)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "rgba(255,255,255,0.3)";
            }}
          >
            ОБ ИГРЕ
          </button>

          {/* About panel */}
          {showAbout && (
            <div
              className="rounded-xl p-4 animate-fade-in"
              style={{
                background: "#080d1a",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Rubik', sans-serif" }}
              >
                <p className="mb-2">
                  <span style={{ color: "#00ffff" }}>Neon Clicker</span> — киберпанк idle-игра с апгрейдами, достижениями и двумя валютами.
                </p>
                <ul className="space-y-1 text-xs">
                  <li>⚡ Кликай и прокачивай силу клика</li>
                  <li>🤖 Покупай авто-кликеры для пассивного дохода</li>
                  <li>💎 Собирай кристаллы каждые 500 кликов</li>
                  <li>🏆 Открывай 12 достижений</li>
                  <li>💾 Прогресс сохраняется автоматически</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Bottom decoration */}
        <div className="mt-12 flex items-center gap-3">
          <div className="h-px w-10" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1))" }} />
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.12)", fontFamily: "'Rubik', sans-serif" }}>
            NEON CLICKER © 2026
          </div>
          <div className="h-px w-10" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.1), transparent)" }} />
        </div>
      </div>
    </div>
  );
}
