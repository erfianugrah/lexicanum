/**
 * Purge the Cloudflare zone cache after `wrangler deploy`.
 *
 * Why this exists: erfi.dev is a Workers Static Assets deploy, and the
 * assets platform serves HTML from a per-PoP cache with
 * `cf-cache-status: HIT` even though the HTML carries
 * `max-age=0, must-revalidate`. Most PoPs converge within a minute or
 * two of a deploy, but some hold yesterday's HTML far longer (observed:
 * 24+ minutes on 2026-08-17, when a reviewer read pre-deploy pages on
 * bare URLs while cache-busted URLs already served the new build).
 * Purging the zone right after deploy makes every PoP re-fetch.
 *
 * Auth: CLOUDFLARE_API_TOKEN (Bearer) or CLOUDFLARE_API_KEY +
 * CLOUDFLARE_EMAIL (legacy global key). One of the two must be set.
 */

const ZONE_NAME = "erfi.dev";

const token = process.env.CLOUDFLARE_API_TOKEN;
const key = process.env.CLOUDFLARE_API_KEY;
const email = process.env.CLOUDFLARE_EMAIL;

const headers: Record<string, string> = token
  ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
  : key && email
    ? { "X-Auth-Key": key, "X-Auth-Email": email, "Content-Type": "application/json" }
    : {};

if (Object.keys(headers).length === 0) {
  console.warn(
    "purge-cache: no CF credentials (CLOUDFLARE_API_TOKEN or CLOUDFLARE_API_KEY+CLOUDFLARE_EMAIL) - skipping purge",
  );
  process.exit(0); // never fail a deploy over a purge
}

const api = async (path: string, init?: RequestInit) => {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, { ...init, headers });
  const body = (await res.json()) as { success: boolean; errors: { message: string }[]; result: any };
  if (!body.success) throw new Error(`CF API ${path}: ${body.errors.map((e) => e.message).join(", ")}`);
  return body.result;
};

try {
  const zones = (await api(`/zones?name=${ZONE_NAME}`)) as { id: string }[];
  const zoneId = zones[0]?.id;
  if (!zoneId) throw new Error(`zone ${ZONE_NAME} not visible to these credentials`);

  await api(`/zones/${zoneId}/purge_cache`, {
    method: "POST",
    body: JSON.stringify({ purge_everything: true }),
  });
  console.log(`purge-cache: purged zone ${ZONE_NAME} (${zoneId})`);
} catch (e) {
  // A failed purge (e.g. the deploy token lacks Zone:Cache Purge) must not
  // fail the deploy - the site is already live; the cache ages out on its own.
  console.warn(`purge-cache: ${e instanceof Error ? e.message : e} - continuing without purge`);
}
