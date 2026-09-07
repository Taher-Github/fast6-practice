/**
 * fast6 results relay — Cloudflare Worker
 *
 *   POST /              a finished attempt  → committed to the repo as
 *                       results/test-NN/<timestamp>_<student>.json
 *   POST /progress      a live progress ping while a test is being taken
 *                       → kept in Workers KV for 3 hours (no commits, no history noise)
 *   GET  /progress?k=…  the admin dashboard reads the live pings (needs ADMIN_KEY)
 *   GET  /              health check
 *
 * Environment (Cloudflare dashboard → the Worker → Settings → Variables and Secrets):
 *   GH_TOKEN    Secret   fine-grained PAT, Contents: Read and write, ONLY fast6-practice
 *   GH_REPO     Text     Taher-Github/fast6-practice
 *   ORIGIN      Text     https://taher-github.github.io
 *   ADMIN_KEY   Secret   any password you choose; the dashboard asks for it once
 * Binding (Settings → Bindings → KV namespace):
 *   PROGRESS             a KV namespace, e.g. fast6_progress   (live monitoring only —
 *                        without it results still save, progress pings are ignored)
 *
 * The GitHub token lives only here, never in the published page.
 */

const MAX_BODY = 250000;      // one attempt is about 15 KB
const BRANCH = "main";
const PROGRESS_TTL = 60 * 60 * 3;

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function b64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function slug(s, fallback) {
  const out = String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "").slice(0, 24);
  return out || fallback;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const cors = {
      "Access-Control-Allow-Origin": env.ORIGIN || "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    const origin = request.headers.get("Origin") || "";
    if (env.ORIGIN && origin && origin !== env.ORIGIN) {
      return json({ error: "origin not allowed" }, 403, cors);
    }

    /* ---------------- live progress ---------------- */
    if (path === "/progress") {
      if (!env.PROGRESS) return json({ error: "no KV namespace bound", live: false }, 501, cors);

      if (request.method === "GET") {
        if (!env.ADMIN_KEY || url.searchParams.get("k") !== env.ADMIN_KEY) {
          return json({ error: "admin key required" }, 401, cors);
        }
        const list = await env.PROGRESS.list({ prefix: "p:" });
        const out = [];
        for (const k of list.keys) {
          const v = await env.PROGRESS.get(k.name, { type: "json" });
          if (v) out.push(v);
        }
        out.sort((a, b) => String(b.updated || "").localeCompare(String(a.updated || "")));
        return json({ ok: true, active: out, at: new Date().toISOString() }, 200, cors);
      }

      if (request.method !== "POST") return json({ error: "POST or GET" }, 405, cors);
      let p;
      try { p = JSON.parse(await request.text()); } catch (e) { return json({ error: "bad JSON" }, 400, cors); }
      if (typeof p.test !== "number") return json({ error: "bad ping" }, 400, cors);
      const key = `p:${slug(p.student, "student")}:${String(p.test).padStart(2, "0")}`;
      if (p.done) {
        await env.PROGRESS.delete(key);
        return json({ ok: true, cleared: key }, 200, cors);
      }
      p.updated = new Date().toISOString();
      await env.PROGRESS.put(key, JSON.stringify(p), { expirationTtl: PROGRESS_TTL });
      return json({ ok: true }, 200, cors);
    }

    /* ---------------- finished attempt ---------------- */
    if (request.method === "GET") {
      return json({ ok: true, service: "fast6 results relay", live: !!env.PROGRESS }, 200, cors);
    }
    if (request.method !== "POST") return json({ error: "POST only" }, 405, cors);

    const body = await request.text();
    if (body.length > MAX_BODY) return json({ error: "payload too large" }, 413, cors);

    let a;
    try { a = JSON.parse(body); } catch (e) { return json({ error: "invalid JSON" }, 400, cors); }
    if (typeof a.test !== "number" || !Array.isArray(a.items) || a.items.length === 0
        || typeof a.pct !== "number") {
      return json({ error: "not an attempt payload" }, 400, cors);
    }

    a.received_at = new Date().toISOString();
    const stamp = a.received_at.replace(/[:.]/g, "-").slice(0, 19);
    const who = slug(a.student, "student");
    const test = String(Math.max(1, Math.min(99, Math.round(a.test)))).padStart(2, "0");
    const path2 = `results/test-${test}/${stamp}_${who}.json`;

    const res = await fetch(
      `https://api.github.com/repos/${env.GH_REPO}/contents/${encodeURI(path2)}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${env.GH_TOKEN}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "fast6-results-relay",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `result: test ${a.test} — ${a.pct}% (${who})`,
          content: b64(JSON.stringify(a, null, 1)),
          branch: BRANCH,
        }),
      }
    );

    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
      return json({ error: "github rejected the write", status: res.status, detail }, 502, cors);
    }
    if (env.PROGRESS) {
      await env.PROGRESS.delete(`p:${who}:${test}`);      // the test is over
    }
    return json({ ok: true, path: path2 }, 200, cors);
  },
};
