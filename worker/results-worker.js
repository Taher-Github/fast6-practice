/**
 * fast6 results relay — Cloudflare Worker
 *
 * Receives one finished attempt from the practice app and commits it into the
 * GitHub repository as results/test-NN/<timestamp>_<student>.json
 *
 * Environment (set in the Cloudflare dashboard, Settings → Variables):
 *   GH_TOKEN   secret   fine-grained PAT, Contents: Read and write, ONLY the fast6-practice repo
 *   GH_REPO    text     Taher-Github/fast6-practice
 *   ORIGIN     text     https://taher-github.github.io
 *
 * The token lives only here, never in the published page.
 */

const MAX_BODY = 250000;      // ~250 KB, one attempt is about 15 KB
const BRANCH = "main";

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
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
    const allowed = env.ORIGIN || "*";
    const cors = {
      "Access-Control-Allow-Origin": allowed,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
    };

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method === "GET") return json({ ok: true, service: "fast6 results relay" }, 200, cors);
    if (request.method !== "POST") return json({ error: "POST only" }, 405, cors);

    const origin = request.headers.get("Origin") || "";
    if (env.ORIGIN && origin && origin !== env.ORIGIN) {
      return json({ error: "origin not allowed" }, 403, cors);
    }

    const body = await request.text();
    if (body.length > MAX_BODY) return json({ error: "payload too large" }, 413, cors);

    let a;
    try { a = JSON.parse(body); } catch (e) { return json({ error: "invalid JSON" }, 400, cors); }
    if (typeof a.test !== "number" || !Array.isArray(a.items) || a.items.length === 0
        || typeof a.pct !== "number") {
      return json({ error: "not an attempt payload" }, 400, cors);
    }

    a.received_at = new Date().toISOString();
    a.ip_country = request.headers.get("CF-IPCountry") || null;

    const stamp = a.received_at.replace(/[:.]/g, "-").slice(0, 19);
    const who = slug(a.student, "student");
    const test = String(Math.max(1, Math.min(99, Math.round(a.test)))).padStart(2, "0");
    const path = `results/test-${test}/${stamp}_${who}.json`;

    const res = await fetch(
      `https://api.github.com/repos/${env.GH_REPO}/contents/${encodeURI(path)}`,
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
    return json({ ok: true, path }, 200, cors);
  },
};
