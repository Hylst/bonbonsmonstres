import { InfoModal } from './components/InfoModal';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sprite } from "./Sprite";
import {
  BAT,
  CANDY_SPRITES,
  COIN,
  CUSTOMER_SPRITES,
  MOON,
  TOMB,
  silhouette,
} from "./sprites";
import {
  CANDIES,
  CUSTOMERS,
  UPGRADES,
  buyUpgrade,
  candyById,
  customerById,
  loadGame,
  maxStock,
  newGame,
  nightLength,
  resetSave,
  restock,
  serve,
  startNight,
  step,
  togglePause,
  unlockedCandies,
  upgradeCost,
  type Customer,
  type Game,
} from "./game";
import { isMuted, setMuted, unlockAudio } from "./sound";

function useIsSmall() {
  const [small, setSmall] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const on = () => setSmall(window.innerWidth < 640);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return small;
}

const fmtTime = (g: Game) => {
  const prog = g.duration ? 1 - g.timeLeft / g.duration : 0;
  const hour = 20 + prog * 10;
  const h = Math.floor(hour) % 24;
  const m = Math.floor((hour % 1) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const patienceColor = (r: number) => (r > 0.5 ? "#5fd35f" : r > 0.25 ? "#ffc531" : "#ff4d4d");

export default function App() {
  const [showInfo, setShowInfo] = useState(false);
  const gRef = useRef<Game>(null as unknown as Game);
  if (!gRef.current) gRef.current = loadGame();
  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick((t) => t + 1), []);
  const [muted, setMutedState] = useState(isMuted());
  const small = useIsSmall();
  const g = gRef.current;

  // Boucle de jeu
  useEffect(() => {
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const dt = Math.min(0.5, (now - last) / 1000);
      last = now;
      step(gRef.current, dt);
      setTick((t) => t + 1);
    }, 100);
    return () => clearInterval(id);
  }, []);

  // Raccourcis clavier
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const cur = gRef.current;
      if (e.key.toLowerCase() === "p" || e.key === "Escape") {
        togglePause(cur);
        rerender();
        return;
      }
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 6) {
        const list = unlockedCandies(cur.night);
        const candy = CANDIES[n - 1];
        if (candy && list.includes(candy)) {
          serve(cur, candy.id);
          rerender();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rerender]);

  const act = (fn: (g: Game) => void) => {
    unlockAudio();
    fn(gRef.current);
    rerender();
  };

  const stars = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        x: (i * 37.7) % 100,
        y: (i * 23.3) % 58,
        s: i % 7 === 0 ? 4 : 2,
        d: (i % 9) * 0.35,
      })),
    [],
  );

  const resetAll = () => {
    if (window.confirm("Effacer ta sauvegarde et recommencer à zéro ?")) {
      resetSave();
      gRef.current = newGame();
      rerender();
    }
  };

  const started = g.totalServed > 0 || g.night > 1;
  const repStars = Math.round(g.rep / 20);
  const prog = g.duration ? 1 - g.timeLeft / g.duration : 0;
  const customerScale = small ? 4 : 6;
  const sceneH = small ? 360 : 460;
  const batRecent = g.clock - g.batFlash < 0.7;

  return (
    <div className="min-h-screen bg-[#0d0820] pb-10 text-[#f4e9ff]">
      <div className="mx-auto max-w-6xl space-y-3 p-2 sm:p-4">
        {/* ============ HUD ============ */}
        <header className="px-box flex flex-wrap items-center gap-x-5 gap-y-2 bg-[#1b1038] p-3">
          <h1 className="font-title text-[10px] leading-relaxed text-orange-300 sm:text-xs">
            🎃 Le Marchand de Bonbons
            <br />
            des Monstres
          </h1>
          <div className="flex-1" />

          <div className="flex items-center gap-2" title="Pièces">
            <Sprite def={COIN} scale={3} />
            <span className="font-title text-sm text-yellow-300">{g.coins}</span>
          </div>

          <div className="flex min-w-[170px] flex-col gap-1">
            <div className="flex items-center justify-between font-title text-[9px] text-violet-200">
              <span>NUIT {g.night}</span>
              <span>{g.phase === "playing" || g.phase === "paused" ? fmtTime(g) : "--:--"}</span>
            </div>
            <div className="relative h-3 border-2 border-[#07040f] bg-[#0a0620]">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-400"
                style={{ width: `${(g.phase === "playing" || g.phase === "paused" ? prog : 0) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1" title={`Réputation : ${Math.round(g.rep)}/100`}>
            <span className="font-title text-[9px] text-violet-200">RÉPUTATION</span>
            <div className="flex gap-0.5 text-base leading-none">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={i < repStars ? "" : "opacity-25 grayscale"}>
                  ⭐
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="px-btn ghost"
              onClick={() => act(togglePause)}
              disabled={g.phase !== "playing" && g.phase !== "paused"}
              title="Pause (P)"
            >
              {g.phase === "paused" ? "▶" : "❚❚"}
            </button>
            <button
              className="px-btn ghost"
              onClick={() => {
                unlockAudio();
                setMuted(!muted);
                setMutedState(!muted);
              }}
              title="Son"
            >
              {muted ? "🔇" : "🔊"}
            </button>
            <button className="px-btn ghost" onClick={resetAll} title="Nouvelle partie">
              ↺
            </button>
          </div>
        </header>

        <div className="grid gap-3 lg:grid-cols-[1fr_330px]">
          <div className="min-w-0 space-y-3">
            {/* ============ SCÈNE ============ */}
            <section
              className="px-box sky relative overflow-hidden"
              style={{ height: sceneH }}
              aria-label="Le stand de bonbons"
            >
              {/* étoiles */}
              {stars.map((s, i) => (
                <span
                  key={i}
                  className="twinkle absolute bg-yellow-100"
                  style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }}
                />
              ))}
              {/* lune */}
              <div className="absolute right-4 top-14 sm:right-10" style={{ filter: "drop-shadow(0 0 16px #fff3c477)" }}>
                <Sprite def={MOON} scale={small ? 5 : 7} />
              </div>
              {/* chauves-souris du décor */}
              <div className="pointer-events-none absolute left-0 top-16" style={{ animation: "flyAcross 22s linear infinite" }}>
                <Sprite def={BAT} scale={3} className="flap" />
              </div>
              <div
                className="pointer-events-none absolute left-0 top-28"
                style={{ animation: "flyAcross 31s linear infinite", animationDelay: "-12s" }}
              >
                <Sprite def={BAT} scale={2} className="flap" />
              </div>
              {/* pierres tombales */}
              <div className="absolute bottom-[60px] left-[3%]">
                <Sprite def={TOMB} scale={small ? 5 : 7} />
              </div>
              <div className="absolute bottom-[60px] left-[44%] hidden sm:block">
                <Sprite def={TOMB} scale={5} style={{ opacity: 0.7 }} />
              </div>
              <div className="absolute bottom-[60px] right-[4%]">
                <Sprite def={TOMB} scale={small ? 5 : 6} />
              </div>
              <div className="ground absolute inset-x-0 bottom-0 h-[110px]" />

              {/* clients */}
              <div className="absolute inset-x-0 bottom-[50px] top-[56px] z-[5] grid grid-cols-3">
                {g.slots.map((c, i) => (
                  <div key={i} className="relative flex flex-col items-center justify-end">
                    {c && (
                      <CustomerView
                        key={c.id}
                        c={c}
                        g={g}
                        scale={customerScale}
                        small={small}
                        onServe={(candy) => act((gg) => serve(gg, candy, i))}
                      />
                    )}
                    {g.floats
                      .filter((f) => f.slot === i)
                      .map((f) => (
                        <span
                          key={f.id}
                          className={`float-up font-title pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 whitespace-nowrap ${
                            f.kind === "gain"
                              ? "top-[34%] text-sm text-yellow-300"
                              : f.kind === "bad"
                                ? "top-[34%] text-xl"
                                : "top-[44%] text-[9px] text-green-300"
                          }`}
                          style={{ textShadow: "2px 2px 0 #000" }}
                        >
                          {f.text}
                        </span>
                      ))}
                  </div>
                ))}
              </div>

              {/* comptoir */}
              <div className="counter absolute inset-x-0 bottom-0 z-10 h-[56px]">
                <div className="absolute -top-[46px] left-3 flicker" style={{ filter: "drop-shadow(0 0 10px #ff8a2b)" }}>
                  <Sprite def={CANDY_SPRITES.pumpkin} scale={4} />
                </div>
                <div className="font-title absolute left-1/2 top-3 -translate-x-1/2 border-4 border-[#07040f] bg-[#2b1450] px-3 py-1 text-[9px] text-yellow-200 sm:text-[10px]">
                  OUVERT 🌙
                </div>
                <div className="absolute -top-[34px] right-3 flex gap-1">
                  {unlockedCandies(g.night)
                    .slice(0, 4)
                    .map((c) => (
                      <Sprite key={c.id} def={CANDY_SPRITES[c.id]} scale={3} />
                    ))}
                </div>
              </div>

              {/* auvent */}
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20">
                <div className="h-3 border-b-4 border-[#07040f] bg-[#4a2290]" />
                <div className="flex">
                  {Array.from({ length: small ? 10 : 16 }, (_, i) => (
                    <div
                      key={i}
                      className={`h-8 flex-1 rounded-b-full border-x-2 border-b-4 border-[#07040f] ${i % 2 ? "awning-b" : "awning-a"}`}
                    />
                  ))}
                </div>
                <div className="absolute left-[8%] top-10 flex flex-col items-center">
                  <div className="h-3 w-0.5 bg-black/60" />
                  <div className="flicker h-6 w-5 rounded-sm border-2 border-[#07040f] bg-orange-400" style={{ boxShadow: "0 0 18px 6px #ff8a2b88" }} />
                </div>
                <div className="absolute right-[8%] top-10 flex flex-col items-center">
                  <div className="h-3 w-0.5 bg-black/60" />
                  <div className="flicker h-6 w-5 rounded-sm border-2 border-[#07040f] bg-orange-400" style={{ boxShadow: "0 0 18px 6px #ff8a2b88" }} />
                </div>
              </div>

              {/* chauve-souris assistante */}
              {(g.up.bat || 0) > 0 && (
                <div className="absolute left-[46%] top-[58px] z-[15]" title="Ta chauve-souris assistante">
                  <div key={batRecent ? g.batFlash : "idle"} className={batRecent ? "bat-dive" : "bob"}>
                    <Sprite def={BAT} scale={4} className="flap" />
                  </div>
                </div>
              )}

              {/* message */}
              {g.msg && g.phase === "playing" && (
                <div className="font-title pop-in absolute bottom-[66px] left-1/2 z-20 -translate-x-1/2 whitespace-nowrap border-4 border-[#07040f] bg-[#fff8e8] px-3 py-2 text-[9px] text-[#2a1200] sm:text-[10px]">
                  {g.msg.text}
                </div>
              )}

              {/* ----- Overlays ----- */}
              {g.phase === "title" && (
                <Overlay>
                  <div className="mb-3 flex items-end justify-center gap-2">
                    <Sprite def={CUSTOMER_SPRITES.witch} scale={4} className="bob" />
                    <Sprite def={CUSTOMER_SPRITES.skeleton} scale={4} />
                    <Sprite def={CUSTOMER_SPRITES.ghost} scale={4} className="bob" />
                  </div>
                  <h2 className="font-title mb-2 text-sm leading-relaxed text-orange-300 sm:text-base">
                    Le Marchand de Bonbons des Monstres
                  </h2>
                  <p className="mx-auto mb-3 max-w-md text-lg leading-tight text-violet-100">
                    La nuit tombe sur le cimetière… Sers à chaque monstre les bonbons de sa commande avant qu'il ne
                    s'impatiente. Clique sur un bocal (ou touches <b>1 - 6</b>) pour servir !
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      className="px-btn"
                      onClick={() =>
                        act((gg) => {
                          unlockAudio();
                          startNight(gg);
                        })
                      }
                    >
                      {started ? `Continuer · Nuit ${g.night}` : "Ouvrir le stand"}
                    </button>
                    {started && (
                      <button className="px-btn ghost" onClick={resetAll}>
                        Nouvelle partie
                      </button>
                    )}
                  </div>
                </Overlay>
              )}

              {g.phase === "paused" && (
                <Overlay>
                  <h2 className="font-title mb-4 text-lg text-orange-300">PAUSE</h2>
                  <button className="px-btn green" onClick={() => act(togglePause)}>
                    Reprendre
                  </button>
                </Overlay>
              )}

              {g.phase === "summary" && g.summary && (
                <Overlay>
                  <h2 className="font-title mb-2 text-sm text-orange-300 sm:text-base">
                    Nuit {g.summary.night} terminée !
                  </h2>
                  <div className="mb-2 text-2xl">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={i < g.summary!.stars ? "" : "opacity-25 grayscale"}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <div className="mx-auto mb-2 grid max-w-xs grid-cols-2 gap-x-6 text-left text-xl">
                    <span className="text-violet-200">Clients servis</span>
                    <span className="text-right text-green-300">{g.summary.served}</span>
                    <span className="text-violet-200">Clients partis</span>
                    <span className="text-right text-red-300">{g.summary.lost}</span>
                    <span className="text-violet-200">Ventes</span>
                    <span className="text-right text-yellow-300">{g.summary.earned} 🪙</span>
                    <span className="text-violet-200">Bonus de nuit</span>
                    <span className="text-right text-yellow-300">+{g.summary.bonus} 🪙</span>
                  </div>
                  {g.summary.unlocks.length > 0 && (
                    <div className="mb-2 space-y-0.5 text-lg text-fuchsia-300">
                      {g.summary.unlocks.map((u) => (
                        <div key={u}>✨ {u}</div>
                      ))}
                    </div>
                  )}
                  <p className="mb-3 text-lg leading-tight text-violet-300">
                    Remplis tes bocaux et améliore ton stand avant de repartir !
                  </p>
                  <button className="px-btn green" onClick={() => act(startNight)}>
                    Nuit {g.night} →
                  </button>
                </Overlay>
              )}
            </section>

            {/* ============ ÉTAGÈRE ============ */}
            <section className="px-box bg-[#1b1038] p-3">
              <div className="mb-2 flex items-baseline justify-between">
                <h2 className="font-title text-[10px] text-orange-300">🍬 Les bocaux à bonbons</h2>
                <span className="text-base text-violet-300">Clique pour servir le client le plus pressé</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {CANDIES.map((c, idx) => {
                  const unlocked = c.unlock <= g.night;
                  const stock = g.stock[c.id] || 0;
                  const max = maxStock(g);
                  const shaking = g.clock - (g.shake[c.id] ?? -10) < 0.3;
                  if (!unlocked) {
                    return (
                      <div
                        key={c.id}
                        className="px-box flex flex-col items-center justify-center gap-1 bg-[#140b2b] p-3 text-center"
                      >
                        <Sprite def={silhouette(CANDY_SPRITES[c.id])} scale={4} />
                        <div className="font-title text-[8px] text-violet-400">🔒 NUIT {c.unlock}</div>
                        <div className="text-base text-violet-500">???</div>
                      </div>
                    );
                  }
                  return (
                    <div key={c.id} className="px-box flex flex-col gap-2 bg-[#241547] p-2">
                      <button
                        key={shaking ? g.shake[c.id] : "ok"}
                        onClick={() => act((gg) => serve(gg, c.id))}
                        className={`relative flex flex-col items-center gap-1 text-center outline-none ${shaking ? "jar-shake" : ""} ${stock <= 0 ? "opacity-60" : "hover:brightness-110"}`}
                      >
                        <span className="font-title absolute left-0 top-0 border-2 border-[#07040f] bg-[#07040f] px-1 text-[8px] text-violet-300">
                          {idx + 1}
                        </span>
                        <div className="jar-glass flex h-[68px] w-[68px] items-center justify-center">
                          <Sprite def={CANDY_SPRITES[c.id]} scale={4} />
                        </div>
                        <div className="text-lg leading-none text-white">{c.name}</div>
                        <div className="flex items-center gap-1 text-base text-yellow-300">
                          <Sprite def={COIN} scale={2} /> {c.price}
                        </div>
                        <div className="h-2.5 w-full border-2 border-[#07040f] bg-[#0a0620]">
                          <div
                            className="h-full"
                            style={{
                              width: `${(stock / max) * 100}%`,
                              background: stock <= 2 ? "#ff4d4d" : "#b266ff",
                            }}
                          />
                        </div>
                        <div className="text-base leading-none text-violet-200">
                          Stock {stock}/{max}
                        </div>
                      </button>
                      <button
                        className="px-btn purple !px-2 !py-1.5 !text-[8px]"
                        disabled={stock >= max || g.coins < c.cost}
                        onClick={() => act((gg) => restock(gg, c.id))}
                      >
                        Remplir · {Math.min(max - stock, Math.floor(g.coins / c.cost)) > 0 ? "−" : ""}
                        {Math.max(1, Math.min(max - stock, Math.floor(g.coins / c.cost))) * c.cost}🪙
                      </button>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-base text-violet-300">
                Un bocal vide ? Rachète des bonbons (coût d'achat par bonbon : voir bouton). Astuce : clique directement
                sur une bulle de commande pour servir ce client précisément.
              </p>
            </section>
          </div>

          {/* ============ AMÉLIORATIONS ============ */}
          <aside className="min-w-0 space-y-3">
            <section className="px-box bg-[#1b1038] p-3">
              <h2 className="font-title mb-3 text-[10px] text-orange-300">🛠 Améliorations du stand</h2>
              <div className="space-y-2">
                {UPGRADES.map((u) => {
                  const lvl = g.up[u.id] || 0;
                  const maxed = lvl >= u.max;
                  const cost = upgradeCost(u, lvl);
                  return (
                    <div key={u.id} className="px-box flex items-center gap-2 bg-[#241547] p-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center border-4 border-[#07040f] bg-[#140b2b] text-2xl">
                        {u.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-lg leading-none text-white">{u.name}</div>
                        <div className="text-base leading-none text-violet-300">{u.desc}</div>
                        <div className="mt-1 flex gap-0.5">
                          {Array.from({ length: u.max }, (_, i) => (
                            <span
                              key={i}
                              className="h-2 w-3 border border-[#07040f]"
                              style={{ background: i < lvl ? "#ffc531" : "#0a0620" }}
                            />
                          ))}
                        </div>
                      </div>
                      <button
                        className="px-btn green !px-2 !py-2 !text-[8px]"
                        disabled={maxed || g.coins < cost}
                        onClick={() => act((gg) => buyUpgrade(gg, u.id))}
                      >
                        {maxed ? "MAX" : `${cost}🪙`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="px-box bg-[#1b1038] p-3">
              <h2 className="font-title mb-2 text-[10px] text-orange-300">📖 Bestiaire</h2>
              <div className="grid grid-cols-5 gap-1.5">
                {CUSTOMERS.map((c) => {
                  const ok = c.unlock <= g.night;
                  return (
                    <div key={c.id} className="flex flex-col items-center text-center" title={ok ? c.name : `Nuit ${c.unlock}`}>
                      <Sprite
                        def={ok ? CUSTOMER_SPRITES[c.id] : silhouette(CUSTOMER_SPRITES[c.id])}
                        scale={2}
                      />
                      <span className="text-sm leading-none text-violet-300">{ok ? c.name : `Nuit ${c.unlock}`}</span>
                    </div>
                  );
                })}
              </div>
              <ul className="mt-3 space-y-1 text-base leading-tight text-violet-200">
                <li>⏳ Une nuit dure {nightLength(g.night)} s ; les clients restants sont servis avant la fin.</li>
                <li>💜 Servir vite = gros pourboires et meilleure réputation.</li>
                <li>🧛 Vampires : très pressés mais généreux. 🧟 Momies : patientes.</li>
                <li>⌨️ Touches 1-6 : servir · P : pause</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>

      {/* Bouton Infos technique */}
      <button
        onClick={() => setShowInfo(true)}
        className="fixed top-2.5 right-2.5 z-[100] flex items-center gap-1 rounded-lg border border-slate-700/60 bg-slate-900/80 px-2 py-1 text-xs text-amber-200 shadow-md backdrop-blur hover:bg-slate-800 transition cursor-pointer select-none"
        title="Comment ce jeu a été fait"
        aria-label="Infos sur le jeu"
      >
        <span>ℹ️</span>
        <span className="hidden sm:inline">Infos</span>
      </button>
      <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
    </div>
  );
}

/* ============ Sous-composants ============ */
function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-30 flex overflow-y-auto bg-[#07031a]/80 p-3 backdrop-blur-[1px]">
      <div className="pop-in px-box m-auto w-full max-w-lg bg-[#1b1038] p-4 text-center">{children}</div>
    </div>
  );
}

function CustomerView({
  c,
  g,
  scale,
  small,
  onServe,
}: {
  c: Customer;
  g: Game;
  scale: number;
  small: boolean;
  onServe: (candy: string) => void;
}) {
  const def = customerById(c.type);
  const ratio = Math.max(0, c.patience / c.max);
  const anim = c.leaving === "happy" ? "hop-out" : c.leaving === "angry" ? "storm-out" : "walk-in";
  return (
    <div className={`flex flex-col items-center ${anim}`}>
      {!c.leaving && (
        <div className="flex flex-col items-center">
          <div className="bubble flex gap-0.5 p-1">
            {c.order.map((o, i) => {
              const out = !o.done && (g.stock[o.candy] || 0) <= 0;
              return (
                <button
                  key={i}
                  onClick={() => onServe(o.candy)}
                  disabled={o.done}
                  title={candyById(o.candy).name}
                  className={`relative p-0.5 ${out ? "outline outline-2 outline-red-500" : ""} ${o.done ? "" : "hover:bg-orange-200"}`}
                >
                  <Sprite def={CANDY_SPRITES[o.candy]} scale={small ? 2 : 3} className={o.done ? "opacity-25" : ""} />
                  {o.done && (
                    <span className="font-title absolute inset-0 flex items-center justify-center text-sm text-green-700">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="bubble-tail" />
        </div>
      )}
      {!c.leaving && (
        <div className="mb-1 mt-1 h-2.5 w-[72px] border-2 border-[#07040f] bg-[#0a0620] sm:w-20">
          <div className="h-full" style={{ width: `${ratio * 100}%`, background: patienceColor(ratio) }} />
        </div>
      )}
      <div className={!c.leaving && ratio < 0.3 ? "wiggle" : ""} title={def.name}>
        <Sprite def={CUSTOMER_SPRITES[c.type]} scale={scale} style={ratio < 0.3 && !c.leaving ? { filter: "drop-shadow(0 0 6px #ff4d4d)" } : undefined} />
      </div>
    </div>
  );
}

