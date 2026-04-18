import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

// ─── Types ─────────────────────────────────────────────────────────────────

interface Upgrade {
  id: string;
  name: string;
  description: string;
  costCoins: number;
  costCrystals?: number;
  cps: number;
  clickPower: number;
  owned: number;
  max?: number;
  icon: string;
  color: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (s: GameState) => boolean;
  unlocked: boolean;
}

interface FloatNum {
  id: number;
  x: number;
  y: number;
  value: number;
}

interface GameState {
  coins: number;
  crystals: number;
  totalCoins: number;
  totalClicks: number;
  cps: number;
  clickPower: number;
  autoClickerActive: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const INITIAL_UPGRADES: Upgrade[] = [
  { id: "cursor", name: "Кибер-курсор", description: "+1 к клику", costCoins: 10, cps: 0, clickPower: 1, owned: 0, icon: "MousePointer", color: "cyan" },
  { id: "bot", name: "Нано-бот", description: "+1 монета/сек", costCoins: 50, cps: 1, clickPower: 0, owned: 0, icon: "Cpu", color: "pink" },
  { id: "laser", name: "Лазерная пушка", description: "+3 к клику", costCoins: 120, cps: 0, clickPower: 3, owned: 0, icon: "Zap", color: "yellow" },
  { id: "miner", name: "Крипто-майнер", description: "+5 монет/сек", costCoins: 300, cps: 5, clickPower: 0, owned: 0, icon: "HardDrive", color: "green" },
  { id: "portal", name: "Нео-портал", description: "+10 к клику + 3/сек", costCoins: 800, cps: 3, clickPower: 10, owned: 0, icon: "Orbit", color: "purple" },
  { id: "quantum", name: "Квант-процессор", description: "+25 монет/сек", costCoins: 2000, cps: 25, clickPower: 0, owned: 0, icon: "Atom", color: "cyan" },
  { id: "neural", name: "Нейро-сеть", description: "+20 к клику + 10/сек", costCoins: 5000, cps: 10, clickPower: 20, owned: 0, icon: "Brain", color: "pink" },
  { id: "autoclicker", name: "Авто-кликер Mk.I", description: "Авто-клик 1/сек", costCoins: 200, cps: 0, clickPower: 0, owned: 0, icon: "RefreshCw", color: "green", max: 10 },
];

const ACHIEVEMENTS_DEF: Omit<Achievement, "unlocked">[] = [
  { id: "first_click", name: "Первый контакт", description: "Сделай первый клик", icon: "👾", condition: s => s.totalClicks >= 1 },
  { id: "clicks_100", name: "Ритм нашёл", description: "100 кликов", icon: "🖱️", condition: s => s.totalClicks >= 100 },
  { id: "clicks_1000", name: "Киберзависимость", description: "1000 кликов", icon: "⚡", condition: s => s.totalClicks >= 1000 },
  { id: "coins_100", name: "Первые монеты", description: "Заработай 100 монет", icon: "💰", condition: s => s.totalCoins >= 100 },
  { id: "coins_1k", name: "Нео-капитал", description: "Заработай 1 000 монет", icon: "🌐", condition: s => s.totalCoins >= 1000 },
  { id: "coins_10k", name: "Крипто-магнат", description: "Заработай 10 000 монет", icon: "👑", condition: s => s.totalCoins >= 10000 },
  { id: "coins_100k", name: "Мегакорп", description: "Заработай 100 000 монет", icon: "🚀", condition: s => s.totalCoins >= 100000 },
  { id: "crystal_1", name: "Кристальный рассвет", description: "Получи первый кристалл", icon: "💎", condition: s => s.crystals >= 1 },
  { id: "crystal_10", name: "Кристальная империя", description: "10 кристаллов", icon: "✨", condition: s => s.crystals >= 10 },
  { id: "auto_on", name: "Автопилот", description: "Включи авто-кликер", icon: "🤖", condition: s => s.autoClickerActive },
  { id: "cps_10", name: "Постоянный поток", description: "10+ монет в секунду", icon: "🔄", condition: s => s.cps >= 10 },
  { id: "cps_100", name: "Лавина данных", description: "100+ монет в секунду", icon: "🌊", condition: s => s.cps >= 100 },
];

const SAVE_KEY = "neon_clicker_save_v1";

const colorMap: Record<string, { text: string; border: string; bg: string; hex: string }> = {
  cyan:   { text: "text-cyan-400",   border: "border-cyan-500",   bg: "bg-cyan-400/10",   hex: "#00ffff" },
  pink:   { text: "text-pink-400",   border: "border-pink-500",   bg: "bg-pink-400/10",   hex: "#ff00ff" },
  yellow: { text: "text-yellow-400", border: "border-yellow-500", bg: "bg-yellow-400/10", hex: "#ffff00" },
  green:  { text: "text-green-400",  border: "border-green-500",  bg: "bg-green-400/10",  hex: "#00ff88" },
  purple: { text: "text-purple-400", border: "border-purple-500", bg: "bg-purple-400/10", hex: "#aa00ff" },
};

// ─── Sound ────────────────────────────────────────────────────────────────────

function playSound(type: "click" | "buy" | "achievement" | "auto") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    if (type === "click") {
      o.frequency.setValueAtTime(800, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
      g.gain.setValueAtTime(0.12, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      o.start(); o.stop(ctx.currentTime + 0.1);
    } else if (type === "buy") {
      o.type = "sine";
      o.frequency.setValueAtTime(500, ctx.currentTime);
      o.frequency.setValueAtTime(700, ctx.currentTime + 0.1);
      o.frequency.setValueAtTime(1000, ctx.currentTime + 0.2);
      g.gain.setValueAtTime(0.2, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      o.start(); o.stop(ctx.currentTime + 0.35);
    } else if (type === "achievement") {
      o.type = "sine";
      o.frequency.setValueAtTime(600, ctx.currentTime);
      o.frequency.setValueAtTime(900, ctx.currentTime + 0.1);
      o.frequency.setValueAtTime(1200, ctx.currentTime + 0.2);
      o.frequency.setValueAtTime(1600, ctx.currentTime + 0.3);
      g.gain.setValueAtTime(0.25, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      o.start(); o.stop(ctx.currentTime + 0.5);
    } else if (type === "auto") {
      o.frequency.setValueAtTime(400, ctx.currentTime);
      g.gain.setValueAtTime(0.04, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      o.start(); o.stop(ctx.currentTime + 0.06);
    }
  } catch (_e) { /* audio not supported */ }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNum(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return Math.floor(n).toString();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Index() {
  const [coins, setCoins] = useState(0);
  const [crystals, setCrystals] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(INITIAL_UPGRADES);
  const [achievements, setAchievements] = useState<Achievement[]>(
    ACHIEVEMENTS_DEF.map(a => ({ ...a, unlocked: false }))
  );
  const [activeTab, setActiveTab] = useState<"upgrades" | "achievements" | "stats">("upgrades");
  const [floatNums, setFloatNums] = useState<FloatNum[]>([]);
  const [clickPower, setClickPower] = useState(1);
  const [cps, setCps] = useState(0);
  const [autoClickers, setAutoClickers] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [sessionStart] = useState(Date.now());
  const [sessionMinutes, setSessionMinutes] = useState(0);

  const floatIdRef = useRef(0);
  const coinsRef = useRef(coins);
  const crystalsRef = useRef(crystals);
  const totalCoinsRef = useRef(totalCoins);
  const totalClicksRef = useRef(totalClicks);
  const clickPowerRef = useRef(clickPower);
  const cpsRef = useRef(cps);
  const autoClickersRef = useRef(autoClickers);
  const soundRef = useRef(soundOn);
  const achievementsRef = useRef(achievements);
  const notifTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const upgradesRef = useRef(upgrades);

  useEffect(() => { coinsRef.current = coins; }, [coins]);
  useEffect(() => { crystalsRef.current = crystals; }, [crystals]);
  useEffect(() => { totalCoinsRef.current = totalCoins; }, [totalCoins]);
  useEffect(() => { totalClicksRef.current = totalClicks; }, [totalClicks]);
  useEffect(() => { clickPowerRef.current = clickPower; }, [clickPower]);
  useEffect(() => { cpsRef.current = cps; }, [cps]);
  useEffect(() => { autoClickersRef.current = autoClickers; }, [autoClickers]);
  useEffect(() => { soundRef.current = soundOn; }, [soundOn]);
  useEffect(() => { achievementsRef.current = achievements; }, [achievements]);
  useEffect(() => { upgradesRef.current = upgrades; }, [upgrades]);

  // Session timer
  useEffect(() => {
    const t = setInterval(() => setSessionMinutes(Math.floor((Date.now() - sessionStart) / 60000)), 10000);
    return () => clearInterval(t);
  }, [sessionStart]);

  // Load save
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const save = JSON.parse(raw);
      setCoins(save.coins ?? 0);
      setCrystals(save.crystals ?? 0);
      setTotalCoins(save.totalCoins ?? 0);
      setTotalClicks(save.totalClicks ?? 0);
      setClickPower(save.clickPower ?? 1);
      setCps(save.cps ?? 0);
      setAutoClickers(save.autoClickers ?? 0);
      if (save.upgrades) setUpgrades(save.upgrades);
      if (save.achievements) setAchievements(save.achievements);
    } catch (_e) { /* no save found */ }
  }, []);

  // Auto-save every 5s
  useEffect(() => {
    const t = setInterval(() => {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        coins: coinsRef.current, crystals: crystalsRef.current,
        totalCoins: totalCoinsRef.current, totalClicks: totalClicksRef.current,
        clickPower: clickPowerRef.current, cps: cpsRef.current,
        autoClickers: autoClickersRef.current,
        upgrades: upgradesRef.current,
        achievements: achievementsRef.current,
      }));
    }, 5000);
    return () => clearInterval(t);
  }, []);

  // CPS ticker
  useEffect(() => {
    const t = setInterval(() => {
      const gain = cpsRef.current;
      if (gain <= 0) return;
      setCoins(c => c + gain);
      setTotalCoins(c => {
        const next = c + gain;
        if (Math.floor(next / 1000) > Math.floor(c / 1000)) setCrystals(cr => cr + 1);
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-clicker ticker
  useEffect(() => {
    const t = setInterval(() => {
      const ac = autoClickersRef.current;
      if (ac <= 0) return;
      const power = clickPowerRef.current * ac;
      setCoins(c => c + power);
      setTotalCoins(c => c + power);
      if (soundRef.current) playSound("auto");
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    if (notifTimeoutRef.current) clearTimeout(notifTimeoutRef.current);
    notifTimeoutRef.current = setTimeout(() => setNotification(null), 3000);
  }, []);

  const checkAchievements = useCallback((state: GameState) => {
    setAchievements(prev => {
      let changed = false;
      const next = prev.map(a => {
        if (!a.unlocked && a.condition(state)) {
          changed = true;
          if (soundRef.current) playSound("achievement");
          setTimeout(() => showNotification("🏆 " + a.name), 0);
          return { ...a, unlocked: true };
        }
        return a;
      });
      return changed ? next : prev;
    });
  }, [showNotification]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const power = clickPowerRef.current;
    const newCoins = coinsRef.current + power;
    const newTotal = totalCoinsRef.current + power;
    const newClicks = totalClicksRef.current + 1;

    setCoins(newCoins);
    setTotalCoins(newTotal);
    setTotalClicks(newClicks);

    let newCrystals = crystalsRef.current;
    if (newClicks % 500 === 0) {
      newCrystals += 1;
      setCrystals(newCrystals);
      showNotification("💎 +1 кристалл!");
    }

    if (soundRef.current) playSound("click");

    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      const id = floatIdRef.current++;
      const x = e.clientX - rect.left + (Math.random() * 40 - 20);
      const y = e.clientY - rect.top - 20;
      setFloatNums(prev => [...prev, { id, x, y, value: power }]);
      setTimeout(() => setFloatNums(prev => prev.filter(f => f.id !== id)), 900);
    }

    checkAchievements({
      coins: newCoins, crystals: newCrystals, totalCoins: newTotal,
      totalClicks: newClicks, cps: cpsRef.current,
      clickPower: power, autoClickerActive: autoClickersRef.current > 0,
    });
  }, [checkAchievements, showNotification]);

  const buyUpgrade = useCallback((upg: Upgrade) => {
    if (coinsRef.current < upg.costCoins) return;
    if (upg.max && upg.owned >= upg.max) return;

    setCoins(c => c - upg.costCoins);

    let newCps = cpsRef.current;
    let newClickPower = clickPowerRef.current;
    let newAuto = autoClickersRef.current;

    if (upg.id === "autoclicker") {
      newAuto += 1;
      setAutoClickers(newAuto);
    } else {
      newClickPower += upg.clickPower;
      newCps += upg.cps;
      if (upg.clickPower > 0) setClickPower(newClickPower);
      if (upg.cps > 0) setCps(newCps);
    }

    setUpgrades(prev => prev.map(u =>
      u.id === upg.id
        ? { ...u, owned: u.owned + 1, costCoins: Math.ceil(u.costCoins * 1.5) }
        : u
    ));

    if (soundRef.current) playSound("buy");

    checkAchievements({
      coins: coinsRef.current - upg.costCoins, crystals: crystalsRef.current,
      totalCoins: totalCoinsRef.current, totalClicks: totalClicksRef.current,
      cps: newCps, clickPower: newClickPower, autoClickerActive: newAuto > 0,
    });
  }, [checkAchievements]);

  const resetGame = () => {
    if (!confirm("Сбросить весь прогресс?")) return;
    localStorage.removeItem(SAVE_KEY);
    setCoins(0); setCrystals(0); setTotalCoins(0); setTotalClicks(0);
    setClickPower(1); setCps(0); setAutoClickers(0);
    setUpgrades(INITIAL_UPGRADES);
    setAchievements(ACHIEVEMENTS_DEF.map(a => ({ ...a, unlocked: false })));
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPerSec = cps + autoClickers * clickPower;

  return (
    <div className="min-h-screen" style={{ background: "#050810", backgroundImage: "linear-gradient(rgba(0,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }}>

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #00ffff 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #ff00ff 0%, transparent 70%)", filter: "blur(80px)" }} />
        {/* Scanlines */}
        <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.012) 2px, rgba(0,255,255,0.012) 4px)" }} />
      </div>

      {/* Notification */}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="px-6 py-3 rounded-lg border border-cyan-400 text-cyan-400 font-medium text-sm"
            style={{ background: "#050810", boxShadow: "0 0 20px rgba(0,255,255,0.3)", fontFamily: "'Rubik', sans-serif" }}>
            {notification}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-6 relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-black tracking-widest text-2xl" style={{ fontFamily: "'Orbitron', monospace", color: "#00ffff", textShadow: "0 0 7px #00ffff, 0 0 21px #00ffff" }}>
              NEON<span style={{ color: "#ff00ff", textShadow: "0 0 7px #ff00ff, 0 0 21px #ff00ff" }}>CLICKER</span>
            </h1>
            <div className="text-xs mt-0.5" style={{ color: "rgba(0,255,255,0.4)", fontFamily: "'Rubik', sans-serif" }}>
              Сохранение каждые 5 сек ✓
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSoundOn(s => !s)}
              className="px-3 py-2 rounded border border-white/10 text-white/50 hover:text-white/80 hover:border-white/30 transition-all text-sm">
              {soundOn ? "🔊" : "🔇"}
            </button>
            <button onClick={resetGame}
              className="px-3 py-2 rounded border border-red-900/40 text-red-500/50 hover:text-red-400 hover:border-red-400/60 transition-all text-xs"
              style={{ fontFamily: "'Rubik', sans-serif" }}>
              СБРОС
            </button>
          </div>
        </div>

        {/* Currency strip */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 rounded-xl border p-4" style={{ borderColor: "rgba(0,255,255,0.4)", background: "#080d1a", boxShadow: "0 0 16px rgba(0,255,255,0.08)" }}>
            <div className="text-xs mb-1" style={{ color: "rgba(0,255,255,0.5)", fontFamily: "'Rubik', sans-serif" }}>МОНЕТЫ</div>
            <div className="text-3xl font-black" style={{ fontFamily: "'Orbitron', monospace", color: "#00ffff", textShadow: "0 0 10px #00ffff" }}>
              {formatNum(coins)}
            </div>
            {totalPerSec > 0 && (
              <div className="text-xs mt-1" style={{ color: "rgba(0,255,255,0.5)", fontFamily: "'Rubik', sans-serif" }}>
                +{totalPerSec}/сек
              </div>
            )}
          </div>
          <div className="rounded-xl border p-4 min-w-[120px]" style={{ borderColor: "rgba(255,0,255,0.4)", background: "#080d1a", boxShadow: "0 0 16px rgba(255,0,255,0.08)" }}>
            <div className="text-xs mb-1" style={{ color: "rgba(255,0,255,0.5)", fontFamily: "'Rubik', sans-serif" }}>КРИСТАЛЛЫ</div>
            <div className="text-2xl font-black" style={{ fontFamily: "'Orbitron', monospace", color: "#ff00ff", textShadow: "0 0 10px #ff00ff" }}>
              💎 {crystals}
            </div>
            <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "'Rubik', sans-serif" }}>раз в 500 кликов</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* LEFT: Click zone */}
          <div className="flex flex-col items-center gap-5">

            {/* The big button */}
            <div className="relative flex items-center justify-center">
              {/* Outer pulse ring */}
              <div className="absolute w-56 h-56 rounded-full" style={{ border: "1px solid rgba(0,255,255,0.2)", animation: "pulse-ring 2s ease-in-out infinite" }} />
              <div className="absolute w-64 h-64 rounded-full" style={{ border: "1px solid rgba(0,255,255,0.08)", animation: "pulse-ring 2s ease-in-out infinite 0.5s" }} />

              <button
                ref={btnRef}
                onClick={handleClick}
                className="relative w-48 h-48 rounded-full overflow-visible"
                style={{
                  background: "radial-gradient(circle at 40% 35%, rgba(0,255,255,0.18) 0%, rgba(0,255,255,0.06) 50%, transparent 100%)",
                  border: "3px solid #00ffff",
                  boxShadow: "0 0 30px rgba(0,255,255,0.5), 0 0 60px rgba(0,255,255,0.2), inset 0 0 40px rgba(0,255,255,0.06)",
                  cursor: "pointer",
                  transition: "transform 0.08s ease, box-shadow 0.08s ease",
                }}
                onMouseDown={e => { e.currentTarget.style.transform = "scale(0.93)"; e.currentTarget.style.boxShadow = "0 0 50px rgba(0,255,255,0.8), 0 0 80px rgba(0,255,255,0.4), inset 0 0 40px rgba(0,255,255,0.15)"; }}
                onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(0,255,255,0.5), 0 0 60px rgba(0,255,255,0.2), inset 0 0 40px rgba(0,255,255,0.06)"; }}
              >
                {/* Float numbers */}
                {floatNums.map(fn => (
                  <span key={fn.id}
                    className="absolute text-base font-black pointer-events-none select-none"
                    style={{ left: fn.x, top: fn.y, color: "#00ffff", fontFamily: "'Orbitron', monospace", textShadow: "0 0 8px #00ffff", animation: "float-up 0.9s ease-out forwards", zIndex: 50 }}>
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

            {/* Stats grid */}
            <div className="w-full grid grid-cols-2 gap-2">
              {[
                { label: "КЛИКОВ", value: formatNum(totalClicks), color: "#ffffff" },
                { label: "ВСЕГО", value: formatNum(totalCoins), color: "#ffffff" },
                { label: "СИЛА КЛИКА", value: `+${clickPower}`, color: "#00ff88" },
                { label: "АВТ. КЛИКЕРЫ", value: autoClickers > 0 ? `${autoClickers} 🤖` : "нет", color: autoClickers > 0 ? "#ff00ff" : "rgba(255,255,255,0.3)" },
              ].map((s, i) => (
                <div key={i} className="rounded-lg p-3 text-center" style={{ background: "#080d1a", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Rubik', sans-serif" }}>{s.label}</div>
                  <div className="text-base font-black" style={{ fontFamily: "'Orbitron', monospace", color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Panel */}
          <div className="rounded-xl overflow-hidden flex flex-col" style={{ background: "#080d1a", border: "1px solid rgba(0,255,255,0.12)" }}>

            {/* Tabs */}
            <div className="flex" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {(["upgrades", "achievements", "stats"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="flex-1 py-3 text-xs font-bold tracking-wider transition-all"
                  style={{
                    fontFamily: "'Rubik', sans-serif",
                    color: activeTab === tab ? "#00ffff" : "rgba(255,255,255,0.3)",
                    borderBottom: activeTab === tab ? "2px solid #00ffff" : "2px solid transparent",
                    textShadow: activeTab === tab ? "0 0 8px #00ffff" : "none",
                    background: "transparent",
                  }}>
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
                      <button key={upg.id}
                        disabled={!canAfford || maxed}
                        onClick={() => buyUpgrade(upg)}
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
                        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: c.hex + "15" }}>
                          <Icon name={upg.icon as never} size={18} fallback="Zap" style={{ color: c.hex }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-white/90" style={{ fontFamily: "'Rubik', sans-serif" }}>{upg.name}</span>
                            {upg.owned > 0 && (
                              <span className="text-xs px-1.5 py-0.5 rounded font-black" style={{ fontFamily: "'Orbitron', monospace", background: c.hex + "20", color: c.hex }}>
                                ×{upg.owned}
                              </span>
                            )}
                            {maxed && <span className="text-xs text-yellow-400" style={{ fontFamily: "'Rubik', sans-serif" }}>MAX</span>}
                          </div>
                          <div className="text-xs text-white/35 mt-0.5" style={{ fontFamily: "'Rubik', sans-serif" }}>{upg.description}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-black" style={{ fontFamily: "'Orbitron', monospace", color: maxed ? "rgba(255,255,255,0.2)" : canAfford ? c.hex : "rgba(255,255,255,0.25)" }}>
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
                    <div key={a.id} className="rounded-lg p-3 transition-all"
                      style={{
                        background: a.unlocked ? "rgba(255,200,0,0.05)" : "#050810",
                        border: `1px solid ${a.unlocked ? "rgba(255,200,0,0.4)" : "rgba(255,255,255,0.05)"}`,
                        opacity: a.unlocked ? 1 : 0.4,
                        boxShadow: a.unlocked ? "0 0 12px rgba(255,200,0,0.1)" : "none",
                      }}>
                      <div className="text-2xl mb-1">{a.icon}</div>
                      <div className="text-xs font-bold mb-0.5" style={{ fontFamily: "'Rubik', sans-serif", color: a.unlocked ? "#ffcc00" : "rgba(255,255,255,0.5)" }}>
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
                    { label: "Монет сейчас", value: formatNum(coins), color: "#00ffff" },
                    { label: "Кристаллов", value: `💎 ${crystals}`, color: "#ff00ff" },
                    { label: "Всего кликов", value: formatNum(totalClicks), color: "#00ff88" },
                    { label: "Сила клика", value: `+${clickPower}`, color: "#ffff00" },
                    { label: "Пассивный доход", value: `${cps}/сек`, color: "#00ffff" },
                    { label: "Авто-кликеры", value: autoClickers > 0 ? `${autoClickers} шт.` : "нет", color: autoClickers > 0 ? "#00ff88" : "rgba(255,255,255,0.3)" },
                    { label: "Итого в секунду", value: `${totalPerSec}/сек`, color: "#00ffff" },
                    { label: "Достижения", value: `${unlockedCount}/${achievements.length}`, color: "#ffcc00" },
                    { label: "Время сессии", value: `${sessionMinutes} мин`, color: "rgba(255,255,255,0.4)" },
                  ].map((s, i) => (
                    <div key={i} className="flex justify-between items-center py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span className="text-sm" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Rubik', sans-serif" }}>{s.label}</span>
                      <span className="font-black text-sm" style={{ fontFamily: "'Orbitron', monospace", color: s.color }}>{s.value}</span>
                    </div>
                  ))}

                  <div className="pt-4">
                    <div className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Rubik', sans-serif" }}>ПРОГРЕСС ДОСТИЖЕНИЙ</div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(unlockedCount / achievements.length) * 100}%`, background: "linear-gradient(90deg, #00ffff, #ff00ff)" }} />
                    </div>
                    <div className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Rubik', sans-serif" }}>
                      {Math.round((unlockedCount / achievements.length) * 100)}% открыто
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}