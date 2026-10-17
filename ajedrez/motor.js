/* Motor de ajedrez: reglas completas (enroque, al paso, coronación, jaque mate, tablas)
   y una IA sencilla (alfa-beta con tablas de posición). Sin dependencias.
   Casillas 0..63: índice = fila*8 + columna, fila 0 = fila 1 del tablero (blancas abajo).
   Piezas: P N B R Q K blancas, p n b r q k negras, null = vacía. */
(function (root) {
  "use strict";
  const FILES = "abcdefgh";
  const sqName = s => FILES[s & 7] + ((s >> 3) + 1);
  const sqIdx = n => FILES.indexOf(n[0]) + (parseInt(n[1], 10) - 1) * 8;
  const isW = p => p && p === p.toUpperCase();
  const colorOf = p => (p ? (isW(p) ? "w" : "b") : null);
  const type = p => p && p.toLowerCase();
  const VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

  const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  function fromFEN(fen) {
    const [bd, turn, cas, ep, half, full] = fen.split(" ");
    const b = new Array(64).fill(null);
    bd.split("/").forEach((row, i) => {
      let f = 0; const r = 7 - i;
      for (const ch of row) { if (/\d/.test(ch)) f += +ch; else { b[r * 8 + f] = ch; f++; } }
    });
    return {
      b, turn: turn || "w",
      cas: { K: cas.includes("K"), Q: cas.includes("Q"), k: cas.includes("k"), q: cas.includes("q") },
      ep: ep && ep !== "-" ? sqIdx(ep) : -1, half: +half || 0, full: +full || 1
    };
  }
  function toFEN(pos, forKey) {
    let s = "";
    for (let r = 7; r >= 0; r--) {
      let e = 0;
      for (let f = 0; f < 8; f++) { const p = pos.b[r * 8 + f]; if (!p) e++; else { if (e) s += e; e = 0; s += p; } }
      if (e) s += e; if (r) s += "/";
    }
    const c = (pos.cas.K ? "K" : "") + (pos.cas.Q ? "Q" : "") + (pos.cas.k ? "k" : "") + (pos.cas.q ? "q" : "") || "-";
    let ep = pos.ep >= 0 ? sqName(pos.ep) : "-";
    if (forKey && pos.ep >= 0 && !legalMoves(pos).some(m => m.ep)) ep = "-";
    return `${s} ${pos.turn} ${c} ${ep}` + (forKey ? "" : ` ${pos.half} ${pos.full}`);
  }

  const N_OFF = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
  const K_OFF = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  const DIAG = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  const ORTH = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const on = (f, r) => f >= 0 && f < 8 && r >= 0 && r < 8;

  /* ¿Ataca el bando "by" ("w"/"b") la casilla s? */
  function attacked(b, s, by) {
    const f = s & 7, r = s >> 3, w = by === "w";
    const pr = w ? r - 1 : r + 1, P = w ? "P" : "p";
    if (on(f - 1, pr) && b[pr * 8 + f - 1] === P) return true;
    if (on(f + 1, pr) && b[pr * 8 + f + 1] === P) return true;
    const N = w ? "N" : "n", K = w ? "K" : "k", B = w ? "B" : "b", R = w ? "R" : "r", Q = w ? "Q" : "q";
    for (const [df, dr] of N_OFF) if (on(f + df, r + dr) && b[(r + dr) * 8 + f + df] === N) return true;
    for (const [df, dr] of K_OFF) if (on(f + df, r + dr) && b[(r + dr) * 8 + f + df] === K) return true;
    for (const [df, dr] of DIAG) {
      let x = f + df, y = r + dr;
      while (on(x, y)) { const p = b[y * 8 + x]; if (p) { if (p === B || p === Q) return true; break; } x += df; y += dr; }
    }
    for (const [df, dr] of ORTH) {
      let x = f + df, y = r + dr;
      while (on(x, y)) { const p = b[y * 8 + x]; if (p) { if (p === R || p === Q) return true; break; } x += df; y += dr; }
    }
    return false;
  }
  const kingSq = (b, c) => b.indexOf(c === "w" ? "K" : "k");
  const inCheck = (pos, c = pos.turn) => { const k = kingSq(pos.b, c); return k >= 0 && attacked(pos.b, k, c === "w" ? "b" : "w"); };

  function pseudo(pos) {
    const { b, turn } = pos, out = [], w = turn === "w", them = w ? "b" : "w";
    const add = (f, t, p, extra) => {
      const c = b[t];
      if (type(p) === "p" && ((t >> 3) === 7 || (t >> 3) === 0)) {
        for (const pr of ["q", "r", "b", "n"]) out.push({ f, t, p, c, cs: t, pr, ...extra });
      } else out.push({ f, t, p, c, cs: t, pr: null, ...extra });
    };
    for (let s = 0; s < 64; s++) {
      const p = b[s]; if (!p || colorOf(p) !== turn) continue;
      const f = s & 7, r = s >> 3, tp = type(p);
      if (tp === "p") {
        const dir = w ? 1 : -1, r1 = r + dir;
        if (on(f, r1) && !b[r1 * 8 + f]) {
          add(s, r1 * 8 + f, p);
          const home = w ? 1 : 6, r2 = r + 2 * dir;
          if (r === home && !b[r2 * 8 + f]) out.push({ f: s, t: r2 * 8 + f, p, c: null, cs: r2 * 8 + f, pr: null, dbl: true });
        }
        for (const df of [-1, 1]) {
          if (!on(f + df, r1)) continue;
          const t = r1 * 8 + f + df;
          if (b[t] && colorOf(b[t]) === them) add(s, t, p);
          else if (t === pos.ep) out.push({ f: s, t, p, c: w ? "p" : "P", cs: t - 8 * dir, pr: null, ep: true });
        }
      } else if (tp === "n" || tp === "k") {
        for (const [df, dr] of tp === "n" ? N_OFF : K_OFF) {
          if (!on(f + df, r + dr)) continue;
          const t = (r + dr) * 8 + f + df;
          if (!b[t] || colorOf(b[t]) === them) add(s, t, p);
        }
        if (tp === "k") {
          const home = w ? 4 : 60;
          if (s === home && !attacked(b, s, them)) {
            const KS = w ? pos.cas.K : pos.cas.k, QS = w ? pos.cas.Q : pos.cas.q, R = w ? "R" : "r";
            if (KS && b[s + 3] === R && !b[s + 1] && !b[s + 2] && !attacked(b, s + 1, them) && !attacked(b, s + 2, them))
              out.push({ f: s, t: s + 2, p, c: null, cs: s + 2, pr: null, k: "K" });
            if (QS && b[s - 4] === R && !b[s - 1] && !b[s - 2] && !b[s - 3] && !attacked(b, s - 1, them) && !attacked(b, s - 2, them))
              out.push({ f: s, t: s - 2, p, c: null, cs: s - 2, pr: null, k: "Q" });
          }
        }
      } else {
        const dirs = tp === "b" ? DIAG : tp === "r" ? ORTH : DIAG.concat(ORTH);
        for (const [df, dr] of dirs) {
          let x = f + df, y = r + dr;
          while (on(x, y)) {
            const t = y * 8 + x, q = b[t];
            if (!q) add(s, t, p);
            else { if (colorOf(q) === them) add(s, t, p); break; }
            x += df; y += dr;
          }
        }
      }
    }
    return out;
  }

  function make(pos, m) {
    const b = pos.b.slice(), w = pos.turn === "w";
    b[m.f] = null;
    if (m.ep) b[m.cs] = null;
    b[m.t] = m.pr ? (w ? m.pr.toUpperCase() : m.pr) : m.p;
    if (m.k === "K") { b[m.t + 1] = null; b[m.t - 1] = w ? "R" : "r"; }
    if (m.k === "Q") { b[m.t - 2] = null; b[m.t + 1] = w ? "R" : "r"; }
    const cas = { ...pos.cas };
    if (m.p === "K") cas.K = cas.Q = false;
    if (m.p === "k") cas.k = cas.q = false;
    for (const s of [m.f, m.t]) {
      if (s === 0) cas.Q = false; if (s === 7) cas.K = false;
      if (s === 56) cas.q = false; if (s === 63) cas.k = false;
    }
    return {
      b, turn: w ? "b" : "w", cas,
      ep: m.dbl ? (m.f + m.t) >> 1 : -1,
      half: type(m.p) === "p" || m.c ? 0 : pos.half + 1,
      full: pos.full + (w ? 0 : 1)
    };
  }

  function legalMoves(pos) {
    const me = pos.turn, them = me === "w" ? "b" : "w";
    return pseudo(pos).filter(m => { const n = make(pos, m); return !attacked(n.b, kingSq(n.b, me), them); });
  }

  const uciOf = m => sqName(m.f) + sqName(m.t) + (m.pr || "");
  function findMove(pos, uci, legal) {
    return (legal || legalMoves(pos)).find(m => uciOf(m) === uci) || null;
  }

  function san(pos, m, legal) {
    let s;
    if (m.k) s = m.k === "K" ? "O-O" : "O-O-O";
    else {
      const tp = type(m.p);
      if (tp === "p") s = (m.c ? FILES[m.f & 7] + "x" : "") + sqName(m.t) + (m.pr ? "=" + m.pr.toUpperCase() : "");
      else {
        const others = (legal || legalMoves(pos)).filter(o => o.p === m.p && o.t === m.t && o.f !== m.f);
        let dis = "";
        if (others.length) {
          const sameFile = others.some(o => (o.f & 7) === (m.f & 7)), sameRank = others.some(o => (o.f >> 3) === (m.f >> 3));
          dis = !sameFile ? FILES[m.f & 7] : !sameRank ? String((m.f >> 3) + 1) : sqName(m.f);
        }
        s = tp.toUpperCase() + dis + (m.c ? "x" : "") + sqName(m.t);
      }
    }
    const n = make(pos, m);
    if (inCheck(n)) s += legalMoves(n).length ? "+" : "#";
    return s;
  }

  function insufficient(b) {
    const ps = [];
    for (let s = 0; s < 64; s++) if (b[s] && type(b[s]) !== "k") ps.push({ p: type(b[s]), s });
    if (!ps.length) return true;
    if (ps.length === 1 && (ps[0].p === "n" || ps[0].p === "b")) return true;
    if (ps.every(x => x.p === "b")) { const c = ps.map(x => ((x.s & 7) + (x.s >> 3)) & 1); return c.every(v => v === c[0]); }
    return false;
  }

  /* Reproduce una partida a partir de la lista de jugadas UCI. */
  function replay(moves) {
    let pos = fromFEN(START);
    const hist = [], keys = [toFEN(pos, true)];
    for (const u of moves || []) {
      const legal = legalMoves(pos), m = findMove(pos, u, legal);
      if (!m) break;
      const s = san(pos, m, legal);
      hist.push({ uci: u, san: s, f: m.f, t: m.t, p: m.p, c: m.c, cs: m.cs, pr: m.pr, k: m.k || null, ep: !!m.ep, by: pos.turn });
      pos = make(pos, m);
      keys.push(toFEN(pos, true));
    }
    return { pos, hist, keys };
  }

  function outcome(game) {
    const { pos, keys } = game, legal = legalMoves(pos);
    const chk = inCheck(pos);
    if (!legal.length) return chk ? { over: true, winner: pos.turn === "w" ? "b" : "w", reason: "mate" } : { over: true, winner: null, reason: "ahogado" };
    if (insufficient(pos.b)) return { over: true, winner: null, reason: "material" };
    if (pos.half >= 100) return { over: true, winner: null, reason: "50" };
    const last = keys[keys.length - 1];
    if (keys.filter(k => k === last).length >= 3) return { over: true, winner: null, reason: "repeticion" };
    return { over: false, check: chk };
  }

  /* Material capturado por cada bando (para mostrar los escombros). */
  function captured(hist) {
    const out = { w: [], b: [] };
    for (const h of hist) if (h.c) out[h.by].push(type(h.c));
    const order = "qrbnp";
    out.w.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    out.b.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    return out;
  }
  function material(b) {
    let w = 0, k = 0;
    for (const p of b) if (p) { if (isW(p)) w += VAL[type(p)]; else k += VAL[type(p)]; }
    return w - k;
  }

  /* ================= IA ================= */
  const PST = {
    p: [0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, -20, -20, 10, 10, 5, 5, -5, -10, 0, 0, -10, -5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, 5, 10, 25, 25, 10, 5, 5, 10, 10, 20, 30, 30, 20, 10, 10, 50, 50, 50, 50, 50, 50, 50, 50, 0, 0, 0, 0, 0, 0, 0, 0],
    n: [-50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 5, 5, 0, -20, -40, -30, 5, 10, 15, 15, 10, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 10, 15, 15, 10, 0, -30, -40, -20, 0, 0, 0, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50],
    b: [-20, -10, -10, -10, -10, -10, -10, -20, -10, 5, 0, 0, 0, 0, 5, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 0, 0, 0, 0, 0, 0, -10, -20, -10, -10, -10, -10, -10, -10, -20],
    r: [0, 0, 0, 5, 5, 0, 0, 0, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 5, 10, 10, 10, 10, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0],
    q: [-20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 5, 0, 0, 0, 0, -10, -10, 5, 5, 5, 5, 5, 0, -10, 0, 0, 5, 5, 5, 5, 0, -5, -5, 0, 5, 5, 5, 5, 0, -5, -10, 0, 5, 5, 5, 5, 0, -10, -10, 0, 0, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10, -20],
    k: [20, 30, 10, 0, 0, 10, 30, 20, 20, 20, 0, 0, 0, 0, 20, 20, -10, -20, -20, -20, -20, -20, -20, -10, -20, -30, -30, -40, -40, -30, -30, -20, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30],
    ke: [-50, -30, -30, -30, -30, -30, -30, -50, -30, -30, 0, 0, 0, 0, -30, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -20, -10, 0, 0, -10, -20, -30, -50, -40, -30, -20, -20, -30, -40, -50]
  };
  function evaluate(pos) {
    const b = pos.b;
    let nonPawn = 0;
    for (const p of b) if (p && type(p) !== "p" && type(p) !== "k") nonPawn += VAL[type(p)];
    const endgame = nonPawn <= 2600;
    let sc = 0;
    for (let s = 0; s < 64; s++) {
      const p = b[s]; if (!p) continue;
      const t = type(p), w = isW(p), idx = w ? s : (7 - (s >> 3)) * 8 + (s & 7);
      const v = VAL[t] + (t === "k" && endgame ? PST.ke : PST[t])[idx];
      sc += w ? v : -v;
    }
    return pos.turn === "w" ? sc : -sc;
  }
  const MATE = 100000;
  function search(pos, opts) {
    const deadline = Date.now() + (opts.ms || 800), maxD = opts.depth || 3;
    let nodes = 0, stop = false;
    const order = ms => ms.sort((a, b) => (b.c ? VAL[type(b.c)] * 10 - VAL[type(b.p)] : 0) + (b.pr ? 800 : 0) - ((a.c ? VAL[type(a.c)] * 10 - VAL[type(a.p)] : 0) + (a.pr ? 800 : 0)));
    function quiesce(p, a, be, d) {
      if ((++nodes & 1023) === 0 && Date.now() > deadline) stop = true;
      const st = evaluate(p);
      if (st >= be) return be;
      if (st > a) a = st;
      if (d > 6) return a;
      const ms = order(legalMoves(p).filter(m => m.c || m.pr));
      for (const m of ms) {
        const v = -quiesce(make(p, m), -be, -a, d + 1);
        if (stop) return a;
        if (v >= be) return be;
        if (v > a) a = v;
      }
      return a;
    }
    function nega(p, d, a, be, ply, first) {
      if ((++nodes & 1023) === 0 && Date.now() > deadline) stop = true;
      const ms = legalMoves(p);
      if (!ms.length) return inCheck(p) ? -MATE + ply : 0;
      if (p.half >= 100) return 0;
      if (d <= 0) return quiesce(p, a, be, 0);
      order(ms);
      if (first) { const i = ms.findIndex(m => uciOf(m) === first); if (i > 0) ms.unshift(ms.splice(i, 1)[0]); }
      for (const m of ms) {
        const v = -nega(make(p, m), d - 1, -be, -a, ply + 1);
        if (stop) return a;
        if (v >= be) return be;
        if (v > a) a = v;
      }
      return a;
    }
    const root = legalMoves(pos);
    if (!root.length) return null;
    let best = root[0], bestScore = -Infinity, scores = [];
    for (let d = 1; d <= maxD; d++) {
      order(root);
      if (best) { const i = root.indexOf(best); if (i > 0) root.unshift(root.splice(i, 1)[0]); }
      let a = -Infinity, cur = null; const sc = [];
      for (const m of root) {
        const v = -nega(make(pos, m), d - 1, -Infinity, opts.noise ? Infinity : -a, 1);
        if (stop) break;
        sc.push({ m, v });
        if (v > a) { a = v; cur = m; }
      }
      if (stop && !cur) break;
      if (cur) { best = cur; bestScore = a; scores = sc; }
      if (stop || Math.abs(a) > MATE - 100) break;
    }
    /* Nivel bajo: a veces elige una jugada razonable que no es la mejor */
    if (opts.noise && scores.length > 1) {
      const ok = scores.filter(x => x.v >= bestScore - opts.noise);
      best = ok[Math.floor(Math.random() * ok.length)].m;
    }
    return { uci: uciOf(best), score: bestScore, nodes };
  }
  const LEVELS = { 1: { depth: 1, ms: 300, noise: 180 }, 2: { depth: 3, ms: 900, noise: 25 }, 3: { depth: 6, ms: 1800, noise: 0 } };
  function bestMove(moves, level) { return search(replay(moves).pos, LEVELS[level] || LEVELS[2]); }

  const api = { START, FILES, VAL, sqName, sqIdx, isW, colorOf, type, fromFEN, toFEN, legalMoves, make, san, uciOf, findMove, inCheck, attacked, replay, outcome, captured, material, evaluate, bestMove, pseudo };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Chess = api;
  /* Como Web Worker: piensa la jugada de la máquina sin congelar la pantalla */
  if (typeof importScripts === "function" && typeof document === "undefined") {
    root.onmessage = e => { const { id, moves, level } = e.data || {}; let r = null; try { r = bestMove(moves, level); } catch (err) { r = null; } root.postMessage({ id, r }); };
  }
})(typeof self !== "undefined" ? self : this);
