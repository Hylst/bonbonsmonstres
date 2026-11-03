import { sfx } from "./sound";

/* ================= DONNÉES ================= */
export interface CandyDef {
  id: string;
  name: string;
  price: number; // prix de vente
  cost: number; // coût de réassort
  unlock: number; // nuit de déblocage
}
export const CANDIES: CandyDef[] = [
  { id: "pumpkin", name: "Citrouille givrée", price: 5, cost: 2, unlock: 1 },
  { id: "ghost", name: "Guimauve fantôme", price: 4, cost: 1, unlock: 1 },
  { id: "eye", name: "Œil de gelée", price: 7, cost: 3, unlock: 1 },
  { id: "lolly", name: "Sucette ensorcelée", price: 10, cost: 4, unlock: 2 },
  { id: "bone", name: "Os de nougat", price: 13, cost: 5, unlock: 3 },
  { id: "wrap", name: "Papillote mystère", price: 18, cost: 7, unlock: 4 },
];

export interface CustomerDef {
  id: string;
  name: string;
  unlock: number;
  patience: number;
  pay: number;
}
export const CUSTOMERS: CustomerDef[] = [
  { id: "witch", name: "Sorcière", unlock: 1, patience: 1, pay: 1.15 },
  { id: "skeleton", name: "Squelette", unlock: 1, patience: 1.1, pay: 1 },
  { id: "ghost", name: "Fantôme", unlock: 1, patience: 1.25, pay: 0.9 },
  { id: "vampire", name: "Vampire", unlock: 3, patience: 0.8, pay: 1.5 },
  { id: "mummy", name: "Momie", unlock: 5, patience: 1.4, pay: 1.2 },
];

export interface UpgradeDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  max: number;
  base: number;
  growth: number;
}
export const UPGRADES: UpgradeDef[] = [
  { id: "jars", name: "Bocaux géants", desc: "+4 de capacité par bocal", icon: "🫙", max: 5, base: 30, growth: 1.7 },
  { id: "lantern", name: "Lanterne apaisante", desc: "+15% de patience des clients", icon: "🏮", max: 6, base: 40, growth: 1.6 },
  { id: "sign", name: "Enseigne ensorcelée", desc: "Les clients arrivent plus vite", icon: "🪧", max: 6, base: 50, growth: 1.6 },
  { id: "price", name: "Étiquettes gourmandes", desc: "+10% sur les prix de vente", icon: "💰", max: 8, base: 60, growth: 1.7 },
  { id: "bat", name: "Chauve-souris assistante", desc: "Sert un bonbon toute seule", icon: "🦇", max: 5, base: 120, growth: 1.9 },
];

export const upgradeCost = (u: UpgradeDef, lvl: number) => Math.round(u.base * Math.pow(u.growth, lvl));
export const batInterval = (lvl: number) => Math.max(2.5, 9 - 1.4 * lvl);
export const nightLength = (n: number) => Math.min(150, 75 + n * 6);

/* ================= ÉTAT ================= */
export interface OrderItem {
  candy: string;
  done: boolean;
}
export interface Customer {
  id: number;
  type: string;
  order: OrderItem[];
  patience: number;
  max: number;
  leaving: null | "happy" | "angry";
  leaveT: number;
}
export interface Float {
  id: number;
  slot: number;
  text: string;
  kind: "gain" | "bad" | "info";
  t: number;
}
export interface Summary {
  night: number;
  served: number;
  lost: number;
  earned: number;
  bonus: number;
  stars: number;
  unlocks: string[];
}
export type Phase = "title" | "playing" | "paused" | "summary";

export interface Game {
  coins: number;
  night: number;
  rep: number;
  stock: Record<string, number>;
  up: Record<string, number>;
  totalServed: number;
  phase: Phase;
  timeLeft: number;
  duration: number;
  slots: (Customer | null)[];
  spawnT: number;
  batT: number;
  batFlash: number;
  stats: { served: number; lost: number; earned: number };
  floats: Float[];
  nextId: number;
  clock: number;
  msg: { text: string; t: number } | null;
  summary: Summary | null;
  shake: Record<string, number>;
}

const SAVE_KEY = "candy-monsters-v1";

export function newGame(): Game {
  return {
    coins: 15,
    night: 1,
    rep: 50,
    stock: { pumpkin: 6, ghost: 6, eye: 6 },
    up: {},
    totalServed: 0,
    phase: "title",
    timeLeft: 0,
    duration: 0,
    slots: [null, null, null],
    spawnT: 0,
    batT: 5,
    batFlash: -10,
    stats: { served: 0, lost: 0, earned: 0 },
    floats: [],
    nextId: 1,
    clock: 0,
    msg: null,
    summary: null,
    shake: {},
  };
}

export function loadGame(): Game {
  const g = newGame();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      g.coins = Number(s.coins) || 0;
      g.night = Math.max(1, Number(s.night) || 1);
      g.rep = Math.min(100, Math.max(0, typeof s.rep === "number" ? s.rep : 50));
      g.stock = { ...g.stock, ...(s.stock || {}) };
      g.up = s.up || {};
      g.totalServed = Number(s.totalServed) || 0;
    }
  } catch {
    /* ignore */
  }
  return g;
}

export function saveGame(g: Game) {
  try {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        coins: g.coins,
        night: g.night,
        rep: g.rep,
        stock: g.stock,
        up: g.up,
        totalServed: g.totalServed,
      }),
    );
  } catch {
    /* ignore */
  }
}

export function resetSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}

/* ================= HELPERS ================= */
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const maxStock = (g: Game) => 10 + 4 * (g.up.jars || 0);
export const unlockedCandies = (night: number) => CANDIES.filter((c) => c.unlock <= night);
export const candyById = (id: string) => CANDIES.find((c) => c.id === id)!;
export const customerById = (id: string) => CUSTOMERS.find((c) => c.id === id)!;

function say(g: Game, text: string) {
  g.msg = { text, t: g.clock };
}
function float(g: Game, slot: number, text: string, kind: Float["kind"]) {
  g.floats.push({ id: g.nextId++, slot, text, kind, t: g.clock });
}

function nextSpawn(g: Game) {
  const sign = g.up.sign || 0;
  const base = 6 * Math.pow(0.9, sign) * (1.25 - g.rep / 200) * Math.max(0.6, 1 - 0.04 * (g.night - 1));
  return Math.max(1.8, base * rand(0.7, 1.3));
}

function spawn(g: Game): boolean {
  const empty: number[] = [];
  g.slots.forEach((c, i) => {
    if (!c) empty.push(i);
  });
  if (!empty.length) return false;
  const slot = pick(empty);
  const type = pick(CUSTOMERS.filter((c) => c.unlock <= g.night));
  const candies = unlockedCandies(g.night);
  let n = 1;
  const p2 = g.night >= 3 ? Math.min(0.6, (g.night - 2) * 0.15) : 0;
  const p3 = g.night >= 6 ? Math.min(0.4, (g.night - 5) * 0.1) : 0;
  if (Math.random() < p2) {
    n++;
    if (Math.random() < p3) n++;
  }
  const order: OrderItem[] = [];
  for (let i = 0; i < n; i++) order.push({ candy: pick(candies).id, done: false });
  const max =
    (16 + n * 6) * type.patience * (1 + 0.15 * (g.up.lantern || 0)) * Math.max(0.7, 1 - 0.02 * g.night);
  g.slots[slot] = { id: g.nextId++, type: type.id, order, patience: max, max, leaving: null, leaveT: 0 };
  sfx("arrive");
  return true;
}

/* ================= ACTIONS ================= */
export function startNight(g: Game) {
  g.phase = "playing";
  g.duration = g.timeLeft = nightLength(g.night);
  g.slots = [null, null, null];
  g.spawnT = 0.8;
  g.batT = batInterval(g.up.bat || 0);
  g.stats = { served: 0, lost: 0, earned: 0 };
  g.floats = [];
  g.summary = null;
  g.msg = null;
}

export function serve(g: Game, candyId: string, slot?: number, auto = false): boolean {
  if (g.phase !== "playing") return false;
  const def = candyById(candyId);
  if ((g.stock[candyId] || 0) <= 0) {
    if (!auto) {
      say(g, `Plus de ${def.name} ! Remplis le bocal.`);
      g.shake[candyId] = g.clock;
      sfx("error");
    }
    return false;
  }
  let best = -1;
  let bestRatio = 2;
  g.slots.forEach((c, i) => {
    if (!c || c.leaving) return;
    if (slot !== undefined && slot !== i) return;
    if (!c.order.some((o) => o.candy === candyId && !o.done)) return;
    const r = c.patience / c.max;
    if (r < bestRatio) {
      bestRatio = r;
      best = i;
    }
  });
  if (best < 0) {
    if (!auto) {
      say(g, "Personne ne veut ça pour le moment…");
      g.shake[candyId] = g.clock;
      sfx("error");
    }
    return false;
  }
  const c = g.slots[best]!;
  const item = c.order.find((o) => o.candy === candyId && !o.done)!;
  item.done = true;
  g.stock[candyId]--;

  if (c.order.every((o) => o.done)) {
    const t = customerById(c.type);
    const base = c.order.reduce((s, o) => s + candyById(o.candy).price, 0);
    const mult = (1 + 0.1 * (g.up.price || 0)) * t.pay;
    const tip = Math.round(base * 0.6 * (c.patience / c.max) * (0.6 + g.rep / 100));
    const total = Math.round(base * mult) + tip;
    g.coins += total;
    g.stats.earned += total;
    g.stats.served++;
    g.totalServed++;
    g.rep = Math.min(100, g.rep + 4);
    c.leaving = "happy";
    c.leaveT = 0.9;
    float(g, best, `+${total}`, "gain");
    if (tip > 0) float(g, best, `dont ${tip} de pourboire`, "info");
    sfx("coin");
  } else {
    float(g, best, "✓", "info");
    sfx("pop");
  }
  saveGame(g);
  return true;
}

export function restock(g: Game, candyId: string) {
  const def = candyById(candyId);
  const missing = maxStock(g) - (g.stock[candyId] || 0);
  if (missing <= 0) {
    say(g, "Ce bocal est déjà plein !");
    return;
  }
  const n = Math.min(missing, Math.floor(g.coins / def.cost));
  if (n <= 0) {
    say(g, "Pas assez de pièces…");
    sfx("error");
    return;
  }
  g.coins -= n * def.cost;
  g.stock[candyId] = (g.stock[candyId] || 0) + n;
  sfx("buy");
  saveGame(g);
}

export function buyUpgrade(g: Game, id: string) {
  const u = UPGRADES.find((x) => x.id === id)!;
  const lvl = g.up[id] || 0;
  if (lvl >= u.max) return;
  const cost = upgradeCost(u, lvl);
  if (g.coins < cost) {
    say(g, "Pas assez de pièces…");
    sfx("error");
    return;
  }
  g.coins -= cost;
  g.up[id] = lvl + 1;
  sfx("buy");
  saveGame(g);
}

function endNight(g: Game) {
  const { served, lost, earned } = g.stats;
  const total = served + lost;
  const ratio = total ? served / total : 1;
  const stars = ratio >= 0.95 ? 5 : ratio >= 0.8 ? 4 : ratio >= 0.6 ? 3 : ratio >= 0.4 ? 2 : 1;
  const bonus = stars * (5 + g.night * 2);
  g.coins += bonus;
  const done = g.night;
  g.night++;
  const unlocks: string[] = [];
  CANDIES.filter((c) => c.unlock === g.night).forEach((c) => {
    g.stock[c.id] = Math.max(g.stock[c.id] || 0, 6);
    unlocks.push(`Nouveau bonbon : ${c.name}`);
  });
  CUSTOMERS.filter((c) => c.unlock === g.night).forEach((c) => unlocks.push(`Nouveau client : ${c.name}`));
  g.summary = { night: done, served, lost, earned, bonus, stars, unlocks };
  g.phase = "summary";
  sfx("night");
  saveGame(g);
}

export function togglePause(g: Game) {
  if (g.phase === "playing") g.phase = "paused";
  else if (g.phase === "paused") g.phase = "playing";
}

/* ================= BOUCLE ================= */
export function step(g: Game, dt: number) {
  if (g.phase !== "playing") return;
  g.clock += dt;
  g.timeLeft = Math.max(0, g.timeLeft - dt);
  g.floats = g.floats.filter((f) => g.clock - f.t < 1.4);
  if (g.msg && g.clock - g.msg.t > 2.4) g.msg = null;

  if (g.timeLeft > 0) {
    g.spawnT -= dt;
    if (g.spawnT <= 0) g.spawnT = spawn(g) ? nextSpawn(g) : 1;
  }

  g.slots.forEach((c, i) => {
    if (!c) return;
    if (c.leaving) {
      c.leaveT -= dt;
      if (c.leaveT <= 0) g.slots[i] = null;
      return;
    }
    c.patience -= dt;
    if (c.patience <= 0) {
      c.leaving = "angry";
      c.leaveT = 0.9;
      g.stats.lost++;
      g.rep = Math.max(0, g.rep - 8);
      float(g, i, "💢", "bad");
      sfx("angry");
    }
  });

  // Chauve-souris assistante
  const bat = g.up.bat || 0;
  if (bat > 0) {
    g.batT -= dt;
    if (g.batT <= 0) {
      let done = false;
      const cands: { slot: number; candy: string; r: number }[] = [];
      g.slots.forEach((c, i) => {
        if (!c || c.leaving) return;
        c.order.forEach((o) => {
          if (!o.done && (g.stock[o.candy] || 0) > 0) cands.push({ slot: i, candy: o.candy, r: c.patience / c.max });
        });
      });
      cands.sort((a, b) => a.r - b.r);
      if (cands.length) {
        done = serve(g, cands[0].candy, cands[0].slot, true);
        if (done) g.batFlash = g.clock;
      }
      g.batT = done ? batInterval(bat) : 1;
    }
  }

  // Petit coup de pouce si on est complètement à sec
  const allEmpty = unlockedCandies(g.night).every((c) => (g.stock[c.id] || 0) <= 0);
  if (allEmpty && g.coins < 3) {
    g.coins += 6;
    say(g, "Un fantôme généreux te laisse 6 pièces 👻");
    sfx("coin");
  }

  if (g.timeLeft <= 0 && g.slots.every((s) => !s)) endNight(g);
}
