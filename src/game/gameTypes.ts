// ─── Types ─────────────────────────────────────────────────────────────────

export interface Upgrade {
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

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (s: GameState) => boolean;
  unlocked: boolean;
}

export interface FloatNum {
  id: number;
  x: number;
  y: number;
  value: number;
}

export interface GameState {
  coins: number;
  crystals: number;
  totalCoins: number;
  totalClicks: number;
  cps: number;
  clickPower: number;
  autoClickerActive: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const INITIAL_UPGRADES: Upgrade[] = [
  { id: "cursor", name: "Кибер-курсор", description: "+1 к клику", costCoins: 10, cps: 0, clickPower: 1, owned: 0, icon: "MousePointer", color: "cyan" },
  { id: "bot", name: "Нано-бот", description: "+1 монета/сек", costCoins: 50, cps: 1, clickPower: 0, owned: 0, icon: "Cpu", color: "pink" },
  { id: "laser", name: "Лазерная пушка", description: "+3 к клику", costCoins: 120, cps: 0, clickPower: 3, owned: 0, icon: "Zap", color: "yellow" },
  { id: "miner", name: "Крипто-майнер", description: "+5 монет/сек", costCoins: 300, cps: 5, clickPower: 0, owned: 0, icon: "HardDrive", color: "green" },
  { id: "portal", name: "Нео-портал", description: "+10 к клику + 3/сек", costCoins: 800, cps: 3, clickPower: 10, owned: 0, icon: "Orbit", color: "purple" },
  { id: "quantum", name: "Квант-процессор", description: "+25 монет/сек", costCoins: 2000, cps: 25, clickPower: 0, owned: 0, icon: "Atom", color: "cyan" },
  { id: "neural", name: "Нейро-сеть", description: "+20 к клику + 10/сек", costCoins: 5000, cps: 10, clickPower: 20, owned: 0, icon: "Brain", color: "pink" },
  { id: "autoclicker", name: "Авто-кликер Mk.I", description: "Авто-клик 1/сек", costCoins: 200, cps: 0, clickPower: 0, owned: 0, icon: "RefreshCw", color: "green", max: 10 },
];

export const ACHIEVEMENTS_DEF: Omit<Achievement, "unlocked">[] = [
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

export const SAVE_KEY = "neon_clicker_save_v1";

export const colorMap: Record<string, { text: string; border: string; bg: string; hex: string }> = {
  cyan:   { text: "text-cyan-400",   border: "border-cyan-500",   bg: "bg-cyan-400/10",   hex: "#00ffff" },
  pink:   { text: "text-pink-400",   border: "border-pink-500",   bg: "bg-pink-400/10",   hex: "#ff00ff" },
  yellow: { text: "text-yellow-400", border: "border-yellow-500", bg: "bg-yellow-400/10", hex: "#ffff00" },
  green:  { text: "text-green-400",  border: "border-green-500",  bg: "bg-green-400/10",  hex: "#00ff88" },
  purple: { text: "text-purple-400", border: "border-purple-500", bg: "bg-purple-400/10", hex: "#aa00ff" },
};

// ─── Sound ────────────────────────────────────────────────────────────────────

export function playSound(type: "click" | "buy" | "achievement" | "auto") {
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

export function formatNum(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return Math.floor(n).toString();
}
