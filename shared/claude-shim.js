/* Sustituye las capacidades de claude.ai (db, user, room) por Firebase,
   para que los juegos funcionen fuera de Claude sin tocar su lógica.
   Cada página define window.APP_KEY antes de cargar este archivo. */
(() => {
  "use strict";
  const APP = window.APP_KEY || "app";
  const NICK_KEY = "sala.nick";
  const ls = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} }
  };

  /* ---------- arranque de Firebase ---------- */
  let ready = null;
  function boot() {
    if (ready) return ready;
    ready = (async () => {
      if (!window.firebase || !window.FIREBASE_CONFIG || !window.FIREBASE_CONFIG.apiKey) throw new Error("no-config");
      if (!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
      const auth = firebase.auth();
      const emu = window.FIREBASE_EMULATORS;
      if (emu) {
        auth.useEmulator(`http://${emu}:9099`);
        firebase.firestore().useEmulator(emu, 8080);
        firebase.database().useEmulator(emu, 9000);
      }
      const user = auth.currentUser || await new Promise((res, rej) => {
        const off = auth.onAuthStateChanged(u => { if (u) { off(); res(u); } });
        auth.signInAnonymously().catch(rej);
      });
      const fs = firebase.firestore();
      const nick = ls.get(NICK_KEY);
      if (nick) fs.doc(`profiles/${user.uid}`).set({ name: nick }).catch(() => {});
      const rtdb = firebase.database();
      watchdog(fs, user.uid);
      return { uid: user.uid, fs, rtdb, serverNow: serverClock(rtdb) };
    })();
    return ready;
  }

  /* Vigilante de conexión: en el móvil, al volver de segundo plano o tras un corte, la escucha de
     Firestore puede quedarse colgada sin dar error y el juego se queda con una jugada vieja.
     Si el móvil estuvo un rato en segundo plano, o una lectura de prueba no responde, se reinicia
     la conexión; las escuchas abiertas se reenganchan solas y traen el estado del servidor. */
  function watchdog(fs, uid) {
    let busy = false, last = Date.now(), hiddenAt = 0;
    const reset = async () => { try { await fs.disableNetwork(); await fs.enableNetwork(); } catch {} };
    const probe = async force => {
      if (busy || document.hidden || navigator.onLine === false) return;
      if (!force && Date.now() - last < 25000) return;
      busy = true; last = Date.now();
      try {
        const ok = await Promise.race([
          fs.doc(`profiles/${uid}`).get({ source: "server" }).then(() => true, e => !!e && e.code !== "unavailable"),
          new Promise(res => setTimeout(() => res(false), 6000))
        ]);
        if (!ok && navigator.onLine !== false) await reset();
      } catch {} finally { busy = false; }
    };
    document.addEventListener("visibilitychange", async () => {
      if (document.hidden) { hiddenAt = Date.now(); return; }
      if (hiddenAt && Date.now() - hiddenAt > 15000) { busy = true; await reset(); busy = false; last = Date.now(); }
      else probe(true);
    });
    addEventListener("online", () => probe(true));
    addEventListener("pageshow", e => { if (e.persisted) probe(true); });
    setInterval(() => probe(false), 5000);
  }

  /* Hora del servidor: cada móvil tiene su reloj y pueden ir segundos o minutos desfasados.
     Realtime Database da el desfase respecto a sus servidores, así todos los móviles comparten la misma hora. */
  function serverClock(rtdb) {
    let skew = 0, known = false;
    const first = new Promise(res => {
      const t = setTimeout(res, 4000);
      rtdb.ref(".info/serverTimeOffset").on("value", s => {
        const v = s.val();
        if (typeof v === "number" && isFinite(v)) { skew = v; known = true; clearTimeout(t); res(); }
      }, () => res());
    });
    return async () => { if (!known) await first; return Date.now() + skew; };
  }

  /* ---------- db: API tipo Firestore guardando el JSON tal cual ---------- */
  const isObj = v => v && typeof v === "object" && !Array.isArray(v);
  const clone = v => v === undefined ? undefined : JSON.parse(JSON.stringify(v));
  function deepMerge(base, patch) {
    const out = isObj(base) ? { ...base } : {};
    for (const [k, v] of Object.entries(patch)) out[k] = isObj(v) && isObj(out[k]) ? deepMerge(out[k], v) : clone(v);
    return out;
  }
  const dbErr = (e, fallback = "unavailable") => {
    const err = new Error(e && e.message || fallback);
    err.code = e && e.code === "permission-denied" ? "invalid_argument" : (e && e.code) || fallback;
    return err;
  };
  const segs = p => String(p).split("/").filter(Boolean);
  const fsPath = p => `apps/${APP}/${segs(p).join("/")}`;
  const decode = s => { try { return s && typeof s._j === "string" ? JSON.parse(s._j) : undefined; } catch { return undefined; } };
  const encode = data => ({ _j: JSON.stringify(data), _t: Date.now() });
  const meta = m => ({ fromCache: !!(m && m.fromCache), hasPendingWrites: !!(m && m.hasPendingWrites) });

  function docSnap(id, body, m) {
    const exists = body !== undefined;
    return { id, exists, data: () => exists ? clone(body) : undefined, metadata: meta(m) };
  }

  function makeDoc(core, path) {
    const id = segs(path).slice(-1)[0];
    const ref = () => core.fs.doc(fsPath(path));
    return {
      id, path,
      async get() {
        try { const s = await ref().get(); return docSnap(id, s.exists ? decode(s.data()) : undefined, s.metadata); }
        catch (e) { throw dbErr(e); }
      },
      async set(data) { try { await ref().set(encode(data)); } catch (e) { throw dbErr(e); } },
      async update(data) {
        try {
          await core.fs.runTransaction(async tx => {
            const s = await tx.get(ref());
            if (!s.exists) { const e = new Error("El documento no existe"); e.code = "invalid_argument"; throw e; }
            tx.set(ref(), encode(deepMerge(decode(s.data()), data)));
          });
        } catch (e) { throw dbErr(e, "invalid_argument"); }
      },
      async delete() { try { await ref().delete(); } catch (e) { throw dbErr(e); } },
      async acquire({ holder, ttlMs = 30000, data } = {}) {
        const ttl = Math.min(600000, Math.max(1000, ttlMs || 30000));
        const lease = core.fs.doc(`apps/${APP}/_leases/${segs(path).join("__")}`);
        try {
          const now = await core.serverNow();
          return await core.fs.runTransaction(async tx => {
            const s = await tx.get(lease), cur = s.exists ? s.data() : null;
            if (cur && cur.exp > now && cur.holder !== holder) return { acquired: false, expiresAt: new Date(cur.exp).toISOString() };
            const exp = now + ttl;
            tx.set(lease, { holder, exp });
            if (data) {
              const d = await tx.get(ref());
              tx.set(ref(), encode(deepMerge(d.exists ? decode(d.data()) : {}, data)));
            }
            return { acquired: true, holder, expiresAt: new Date(exp).toISOString() };
          });
        } catch (e) { throw dbErr(e); }
      },
      onSnapshot(next, error) {
        return ref().onSnapshot({ includeMetadataChanges: false },
          s => next(docSnap(id, s.exists ? decode(s.data()) : undefined, s.metadata)),
          e => error ? error(dbErr(e)) : console.error(e));
      },
      collection(sub) { return makeCollection(core, `${path}/${sub}`); }
    };
  }

  const OPS = {
    "==": (a, b) => JSON.stringify(a) === JSON.stringify(b),
    "!=": (a, b) => JSON.stringify(a) !== JSON.stringify(b),
    "<": (a, b) => a < b, "<=": (a, b) => a <= b, ">": (a, b) => a > b, ">=": (a, b) => a >= b,
    "in": (a, b) => Array.isArray(b) && b.some(x => OPS["=="](a, x)),
    "not-in": (a, b) => Array.isArray(b) && !b.some(x => OPS["=="](a, x)),
    "array-contains": (a, b) => Array.isArray(a) && a.some(x => OPS["=="](x, b))
  };

  function makeCollection(core, path, q = { where: [], order: null, limit: 0 }) {
    const ref = () => core.fs.collection(fsPath(path));
    const apply = rows => {
      let r = rows.filter(d => q.where.every(([f, op, v]) => d.body && f in d.body && OPS[op] && OPS[op](d.body[f], v)));
      if (q.order) {
        const [f, dir] = q.order, s = dir === "desc" ? -1 : 1;
        r.sort((a, b) => {
          const x = a.body[f], y = b.body[f];
          if (x === undefined && y === undefined) return a.id < b.id ? -1 : 1;
          if (x === undefined) return 1; if (y === undefined) return -1;
          return x < y ? -s : x > y ? s : (a.id < b.id ? -1 : 1);
        });
      } else r.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
      return q.limit ? r.slice(0, q.limit) : r;
    };
    const rowsOf = s => s.docs.map(d => ({ id: d.id, body: decode(d.data()) })).filter(d => d.body !== undefined);
    const qSnap = (rows, prev, m) => {
      const docs = rows.map(r => docSnap(r.id, r.body, m));
      const prevIdx = new Map((prev || []).map((r, i) => [r.id, { i, j: JSON.stringify(r.body) }]));
      const changes = [];
      rows.forEach((r, i) => {
        const p = prevIdx.get(r.id);
        if (!p) changes.push({ type: "added", doc: docs[i], oldIndex: -1, newIndex: i });
        else if (p.j !== JSON.stringify(r.body) || p.i !== i) changes.push({ type: "modified", doc: docs[i], oldIndex: p.i, newIndex: i });
      });
      const now = new Set(rows.map(r => r.id));
      (prev || []).forEach((r, i) => { if (!now.has(r.id)) changes.push({ type: "removed", doc: docSnap(r.id, r.body, m), oldIndex: i, newIndex: -1 }); });
      return { docs, size: docs.length, empty: !docs.length, docChanges: () => changes, metadata: meta(m) };
    };
    const api = {
      path,
      where(f, op, v) { return makeCollection(core, path, { ...q, where: [...q.where, [f, op, v]] }); },
      orderBy(f, dir = "asc") { return makeCollection(core, path, { ...q, order: [f, dir] }); },
      limit(n) { return makeCollection(core, path, { ...q, limit: n }); },
      async get() { try { const s = await ref().get(); return qSnap(apply(rowsOf(s)), null, s.metadata); } catch (e) { throw dbErr(e); } },
      onSnapshot(next, error) {
        let prev = null;
        return ref().onSnapshot(s => { const rows = apply(rowsOf(s)); next(qSnap(rows, prev, s.metadata)); prev = rows; },
          e => error ? error(dbErr(e)) : console.error(e));
      },
      doc(id) { return makeDoc(core, `${path}/${id || core.fs.collection("x").doc().id}`); },
      async add(data) { const d = api.doc(); await d.set(data); return d; }
    };
    return api;
  }

  const makeDb = core => ({ doc: p => makeDoc(core, p), collection: p => makeCollection(core, p) });

  /* ---------- user: id anónimo + nombre elegido en la Sala ---------- */
  function makeUser(core) {
    const nick = () => ls.get(NICK_KEY) || "";
    return {
      id: async () => core.uid,
      me: async () => ({ id: core.uid, name: nick(), guest: false }),
      name: async () => nick(),
      isOwner: () => false,
      canEdit: () => true,
      can: () => true,
      async profiles(ids) {
        const out = {};
        await Promise.all((ids || []).map(async id => {
          if (id === core.uid) { out[id] = { id, name: nick() }; return; }
          try { const s = await core.fs.doc(`profiles/${id}`).get(); out[id] = { id, name: s.exists ? (s.data().name || "") : "" }; }
          catch { out[id] = { id, name: "" }; }
        }));
        return out;
      },
      async search() { return []; }
    };
  }

  /* ---------- room: presencia y eventos con Realtime Database ---------- */
  function makeRoom(core, name) {
    const base = core.rtdb.ref(`rooms/${APP}/${String(name).replace(/[.#$\[\]\/]/g, "_")}`);
    const peerId = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    const myRef = base.child(`peers/${peerId}`);
    let mine = {}, peers = Object.freeze([]), cache = new Map(), connected = false, alive = true;
    const peerHandlers = new Set(), connHandlers = new Set(), offs = [];
    const toPeer = (id, v) => Object.freeze({
      peer: id, by: v.by || null, isMe: v.by === core.uid, sameTab: id === peerId, kind: "viewer", guest: false,
      presence: Object.freeze(v.p || {}), updatedAt: v.u || Date.now()
    });
    const write = () => myRef.set({ by: core.uid, p: mine, u: firebase.database.ServerValue.TIMESTAMP });
    const connRef = core.rtdb.ref(".info/connected");
    const onConn = connRef.on("value", s => {
      connected = !!s.val();
      if (connected && alive) { myRef.onDisconnect().remove(); write(); }
      connHandlers.forEach(h => { try { h(connected); } catch {} });
    });
    offs.push(() => connRef.off("value", onConn));
    const peersRef = base.child("peers");
    const onPeersVal = peersRef.on("value", s => {
      const val = s.val() || {}, next = [], joined = [], updated = [], left = [], seen = new Set();
      for (const [id, v] of Object.entries(val)) {
        seen.add(id);
        const old = cache.get(id), key = JSON.stringify(v.p || {});
        if (old && old.key === key) { next.push(old.peer); continue; }
        const p = toPeer(id, { ...v, u: Date.now() });
        cache.set(id, { peer: p, key }); next.push(p);
        (old ? updated : joined).push(p);
      }
      for (const [id, o] of cache) if (!seen.has(id)) { left.push(o.peer); cache.delete(id); }
      peers = Object.freeze(next);
      const ch = Object.freeze({ peers, joined, left, updated });
      peerHandlers.forEach(h => { try { h(ch); } catch (e) { console.error(e); } });
    });
    offs.push(() => peersRef.off("value", onPeersVal));
    const since = Date.now();
    return {
      name,
      presence(patch) {
        for (const [k, v] of Object.entries(patch || {})) { if (v === null) delete mine[k]; else mine[k] = clone(v); }
        return alive ? write().then(() => {}, () => {}) : Promise.resolve();
      },
      peers: () => peers,
      onPeers(h) { peerHandlers.add(h); queueMicrotask(() => alive && h(Object.freeze({ peers, joined: peers, left: [], updated: [] }))); return () => peerHandlers.delete(h); },
      onConnection(h) { connHandlers.add(h); queueMicrotask(() => alive && h(connected)); return () => connHandlers.delete(h); },
      connected: () => connected,
      async emit(topic, data) { if (connected) await base.child("events").push({ topic, data: data === undefined ? null : clone(data), peer: peerId, by: core.uid, t: firebase.database.ServerValue.TIMESTAMP }); },
      on(topic, handler) {
        const q = base.child("events").orderByChild("t").startAt(since);
        const cb = q.on("child_added", s => {
          const v = s.val(); if (!v || v.topic !== topic) return;
          handler({ topic, data: v.data === null ? undefined : v.data, peer: v.peer, by: v.by || null, isMe: v.by === core.uid, sameTab: v.peer === peerId, kind: "viewer", guest: false });
        });
        return () => q.off("child_added", cb);
      },
      leave() { if (!alive) return; alive = false; offs.forEach(f => f()); myRef.onDisconnect().cancel(); myRef.remove(); peerHandlers.clear(); connHandlers.clear(); }
    };
  }
  function makeLobby(core) {
    let lobby = null;
    const L = () => lobby || (lobby = makeRoom(core, "_lobby"));
    return {
      join: async name => makeRoom(core, name),
      presence: p => L().presence(p), peers: () => L().peers(), onPeers: h => L().onPeers(h),
      onConnection: h => L().onConnection(h), connected: () => L().connected(),
      emit: (t, d) => L().emit(t, d), on: (t, h) => L().on(t, h), leave: () => lobby && lobby.leave()
    };
  }

  /* ---------- sample: juez IA con Gemini (Firebase AI Logic) ---------- */
  const AI_SDK = window.SALA_IA_SDK || "https://www.gstatic.com/firebasejs/12.3.0";
  // Si un modelo está saturado (429) o retirado (404), se prueba el siguiente: cada uno tiene su propia cuota gratis.
  const AI_MODELS = [...new Set([window.SALA_IA_MODEL, "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest", "gemini-flash-lite-latest"].filter(Boolean))];
  const AI_TIMEOUT = 45000;
  function makeSample() {
    if (!window.SALA_IA) return null;
    let sdk = null, ai = null;
    const models = {}, dead = new Set();
    let pref = 0;
    const getModel = async name => {
      if (models[name]) return models[name];
      if (!sdk) sdk = Promise.all([import(`${AI_SDK}/firebase-app.js`), import(`${AI_SDK}/firebase-ai.js`)]);
      const [{ initializeApp, getApps }, { getAI, getGenerativeModel, GoogleAIBackend }] = await sdk;
      if (!ai) {
        const app = getApps().find(a => a.name === "sala-ia") || initializeApp(window.FIREBASE_CONFIG, "sala-ia");
        ai = getAI(app, { backend: new GoogleAIBackend() });
      }
      return (models[name] = getGenerativeModel(ai, { model: name }));
    };
    const toContents = input => typeof input === "string"
      ? [{ role: "user", parts: [{ text: input }] }]
      : input.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: String(m.content) }] }));
    // Clasifica por el código HTTP, no por palabras sueltas («generateContent» contiene «rate»).
    const statusOf = e => {
      const d = e && e.customErrorData, st = d && (d.status || d.httpStatus);
      if (st) return +st;
      const m = String(e && (e.message || e)).match(/\[(\d{3})\b|\bstatus(?:Code)?[:= ]+(\d{3})/i);
      return m ? +(m[1] || m[2]) : 0;
    };
    const kindOf = e => {
      const st = statusOf(e), msg = String(e && (e.message || e));
      if (e && e.timeout) return "retry";
      if (st === 429 || st >= 500 || /RESOURCE_EXHAUSTED|overloaded|UNAVAILABLE|Failed to fetch|NetworkError|network/i.test(msg)) return "retry";
      if (st === 404 || /not found|is not supported|no longer available|deprecated|retired/i.test(msg)) return "model";
      if (st === 401 || st === 403 || /PERMISSION_DENIED|API has not been used|not enabled|disabled|API key/i.test(msg)) return "denied";
      if (st === 400 && /model/i.test(msg)) return "model";
      return "other";
    };
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const withTimeout = p => Promise.race([p, wait(AI_TIMEOUT).then(() => { const e = new Error("Tiempo de espera agotado"); e.timeout = true; throw e; })]);
    async function run(input, opts = {}, json = false) {
      const req = {
        contents: toContents(input),
        generationConfig: json ? { responseMimeType: "application/json", temperature: 0.2 } : { temperature: 0.7 }
      };
      const order = AI_MODELS.slice(pref).concat(AI_MODELS.slice(0, pref)).filter(n => !dead.has(n));
      let last = null, sawRetry = false;
      for (const name of order) {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const m = await getModel(name);
            const res = await withTimeout(m.generateContent(req));
            const text = res.response.text();
            pref = AI_MODELS.indexOf(name);
            if (opts.onText) try { opts.onText({ text, delta: text }); } catch {}
            return text;
          } catch (e) {
            last = e;
            const k = kindOf(e);
            console.warn("[sala] Gemini", name, k, e);
            if (k === "denied") throw aiErr(e, "not_granted");
            if (k === "model") { dead.add(name); break; }
            if (k === "retry") { sawRetry = true; if (attempt === 0) { await wait(1500 + Math.random() * 1000); continue; } break; }
            break;
          }
        }
      }
      throw aiErr(last, sawRetry ? "rate_limited" : "unavailable");
    }
    function aiErr(e, code) {
      const msg = String(e && (e.message || e) || "sin respuesta"), err = new Error(msg);
      err.code = code; err.status = statusOf(e); err.detail = msg.slice(0, 300);
      return err;
    }
    const sample = async (input, opts) => ({ text: await run(input, opts), truncated: false });
    sample.json = async (input, opts) => {
      const text = await run(input, opts, true);
      try { return JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, "")); }
      catch { const e = new Error("Respuesta no válida"); e.code = "invalid_json"; e.text = text; throw e; }
    };
    sample.limits = async () => ({ images: false });
    return sample;
  }

  /* ---------- window.claude ---------- */
  const memo = {};
  const FACTORIES = { db: makeDb, user: makeUser, room: makeLobby };
  window.claude = Object.freeze({
    use(name) {
      if (name === "sample") return Promise.resolve(memo.sample !== undefined ? memo.sample : (memo.sample = makeSample()));
      if (!FACTORIES[name]) return Promise.resolve(null);
      if (!memo[name]) memo[name] = boot().then(core => FACTORIES[name](core)).catch(e => { console.warn("[sala]", name, e); return null; });
      return memo[name];
    }
  });
})();
