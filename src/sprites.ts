export interface SpriteDef {
  rows: string[];
  pal: Record<string, string>;
}

/* ---------- BONBONS (12x12) ---------- */
export const CANDY_SPRITES: Record<string, SpriteDef> = {
  pumpkin: {
    pal: { o: "#ff8a2b", O: "#c2570b", g: "#58c43c", x: "#2a1200" },
    rows: [
      "......gg....",
      ".....gg.....",
      "..oooooooo..",
      ".ooOoooOooo.",
      "ooOooooooOoo",
      "ooxxooooxxoo",
      "ooxxooooxxoo",
      "ooOooooooOoo",
      "ooxooxxooxoo",
      ".ooxxooxxoo.",
      "..oooooooo..",
      "...OOOOOO...",
    ],
  },
  ghost: {
    pal: { w: "#ffffff", k: "#2b2b4a", c: "#ffb3c6" },
    rows: [
      "...wwwwww...",
      "..wwwwwwww..",
      ".wwwwwwwwww.",
      ".wwkkwwkkww.",
      ".wwkkwwkkww.",
      ".wcwwwwwwcw.",
      ".wwwwkkwwww.",
      ".wwwwkkwwww.",
      ".wwwwwwwwww.",
      ".wwwwwwwwww.",
      ".ww.www.www.",
      "..w...w...w.",
    ],
  },
  eye: {
    pal: { w: "#f4f1e8", r: "#e0405a", g: "#7ddc4a", k: "#1a1a2e" },
    rows: [
      "...wwwwww...",
      ".wwwwwwwwww.",
      ".wwrwwwwrww.",
      "wwwwwggwwwww",
      "wwwwgggggwww",
      "wwwgggkkggww",
      "wwwgggkkggww",
      "wwwwgggggwww",
      "wwrwwgggwwww",
      ".wwwwwwwwrw.",
      ".wwwwwwwwww.",
      "...wwwwww...",
    ],
  },
  lolly: {
    pal: { p: "#b266ff", P: "#6b2fb3", s: "#f1ead8" },
    rows: [
      "...pppppp...",
      ".pppppppppp.",
      "ppPPPPPPpppp",
      "pPpppppppPpp",
      "pPpPPPPPpPpp",
      "pPpPpppPpPpp",
      "pPpPPPPPpPpp",
      "ppPpppppPppp",
      ".ppPPPPPPpp.",
      "...pppppp...",
      ".....ss.....",
      ".....ss.....",
    ],
  },
  bone: {
    pal: { w: "#f0e6c8", W: "#cdbf94" },
    rows: [
      "............",
      "............",
      "............",
      ".ww......ww.",
      "wwww....wwww",
      "wwwwwwwwwwww",
      "wwWWWWWWWWww",
      "wwww....wwww",
      ".ww......ww.",
      "............",
      "............",
      "............",
    ],
  },
  wrap: {
    pal: { c: "#ff7ab8", C: "#ffc2e0", b: "#ffd166" },
    rows: [
      "............",
      "............",
      "............",
      "..b......b..",
      ".bb.cccc.bb.",
      "bbbccccccbbb",
      "bbbcCCCccbbb",
      "bbbccccccbbb",
      ".bb.cccc.bb.",
      "..b......b..",
      "............",
      "............",
    ],
  },
};

/* ---------- CLIENTS (14x16) ---------- */
export const CUSTOMER_SPRITES: Record<string, SpriteDef> = {
  witch: {
    pal: {
      P: "#6b3fa0",
      y: "#f5c542",
      g: "#8fd36b",
      k: "#1a1a2e",
      r: "#c0304a",
      d: "#3a2766",
    },
    rows: [
      "......PP......",
      ".....PPPP.....",
      ".....PPPP.....",
      "....PPPPPP....",
      "....PyyyyP....",
      "..PPPPPPPPPP..",
      "....gggggg....",
      "...ggkggkgg...",
      "...gggggggg...",
      "...ggggrrgg...",
      "....gggggg....",
      "..dddddddddd..",
      ".dddddddddddd.",
      ".dddddddddddd.",
      ".dddddddddddd.",
      "..dddddddddd..",
    ],
  },
  skeleton: {
    pal: { w: "#f1ead8", s: "#b9b09a", k: "#1a1a2e" },
    rows: [
      "....wwwwww....",
      "...wwwwwwww...",
      "..wwwwwwwwww..",
      "..wwkkwwkkww..",
      "..wwkkwwkkww..",
      "..wwwwkkwwww..",
      "...wwwwwwww...",
      "....wkwkwkw...",
      "......ww......",
      "...wwwwwwww...",
      "..w.wwwwww.w..",
      "..w.wsswssw.w.",
      "..w.wwwwww.w..",
      "....wsswsw....",
      "....ww..ww....",
      "....ww..ww....",
    ],
  },
  ghost: {
    pal: { w: "#d9ecff", c: "#ffb3c6", k: "#2b2b4a" },
    rows: [
      "....wwwwww....",
      "...wwwwwwww...",
      "..wwwwwwwwww..",
      "..wwwwwwwwww..",
      "..wwkkwwwkkw..",
      "..wwkkwwwkkw..",
      "..wcwwwwwwcw..",
      "..wwwwkkwwww..",
      "..wwwwkkwwww..",
      "..wwwwwwwwww..",
      "..wwwwwwwwww..",
      "..wwwwwwwwww..",
      "..wwwwwwwwww..",
      "..wwwwwwwwww..",
      "..ww.www.www..",
      "..w...ww...w..",
    ],
  },
  vampire: {
    pal: {
      h: "#1a1a2e",
      f: "#e8d8e8",
      e: "#e0405a",
      w: "#ffffff",
      r: "#b3203a",
      R: "#7a1226",
    },
    rows: [
      "....hhhhhh....",
      "...hhhhhhhh...",
      "..hhhffffhhh..",
      "..hffffffffh..",
      "..ffeffffeff..",
      "..ffffffffff..",
      "...ffffffff...",
      "....fwrrwf....",
      "....ffffff....",
      "..RRrrrrrrRR..",
      ".RRrrrhhrrrRR.",
      ".RrrrrhhrrrrR.",
      ".RrrrrrrrrrrR.",
      ".RrrrrrrrrrrR.",
      ".RRrrrrrrrrRR.",
      "..RRRRRRRRRR..",
    ],
  },
  mummy: {
    pal: { w: "#e8e0c8", s: "#b8ac88", k: "#1a1a2e", e: "#ffd23f" },
    rows: [
      "....wwwwww....",
      "...wswwwwsw...",
      "..wwwwwwwwww..",
      "..wwwwwwwwww..",
      "..kkkkkkkkkk..",
      "..kkeekkeekk..",
      "..kkkkkkkkkk..",
      "..wwwwwwwwww..",
      "...wswwwwsw...",
      "..wwwwwwwwww..",
      ".swwwwwwwwwws.",
      ".wwssssssssww.",
      ".wwwwwwwwwwww.",
      ".wswwwwwwwwsw.",
      "..wwwwwwwwww..",
      "..ww......ww..",
    ],
  },
};

/* ---------- DÉCOR ---------- */
export const COIN: SpriteDef = {
  pal: { o: "#b8741a", y: "#ffd23f", Y: "#fff1a0" },
  rows: [
    "..oooo..",
    ".oyyyyo.",
    "oyyYYyyo",
    "oyyYyyyo",
    "oyyYyyyo",
    "oyyYYyyo",
    ".oyyyyo.",
    "..oooo..",
  ],
};

export const MOON: SpriteDef = {
  pal: { y: "#fff3c4", Y: "#e6d28f" },
  rows: [
    "....yyyy....",
    "..yyyyyyyy..",
    ".yyyYyyyyyy.",
    ".yyYYyyyyyy.",
    "yyyyyyyyyYyy",
    "yyyyyyyyyyyy",
    "yyyyyYyyyyyy",
    "yyYyyyyyyyyy",
    ".yyyyyyyyyy.",
    ".yyyyyyYyyy.",
    "..yyyyyyyy..",
    "....yyyy....",
  ],
};

export const BAT: SpriteDef = {
  pal: { b: "#150c2b", e: "#ff4d6d" },
  rows: [
    "b...b.b...b",
    "bb.bbbbb.bb",
    "bbbbebebbbb",
    ".bb.bbb.bb.",
    "..b.....b..",
  ],
};

export const TOMB: SpriteDef = {
  pal: { c: "#2a1f45", d: "#43346b" },
  rows: [
    "..cccc..",
    ".cccccc.",
    "cccddccc",
    "ccddddcc",
    "cccddccc",
    "cccddccc",
    "cccccccc",
    "cccccccc",
    "cccccccc",
  ],
};

export function silhouette(def: SpriteDef, color = "#2a2050"): SpriteDef {
  const pal: Record<string, string> = {};
  Object.keys(def.pal).forEach((k) => (pal[k] = color));
  return { rows: def.rows, pal };
}
