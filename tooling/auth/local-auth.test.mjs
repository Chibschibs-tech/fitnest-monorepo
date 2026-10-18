/** Local Supabase fixture qualification only. This does NOT certify Fitnest guards. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const statusFile = process.env.FITNEST_LOCAL_STATUS;
assert.ok(statusFile, "FITNEST_LOCAL_STATUS must point to local supabase status JSON");
const config = JSON.parse(await readFile(statusFile, "utf8"));
assert.equal(config.API_URL, "http://127.0.0.1:54321", "Tests must target the local stack only");
assert.ok(typeof config.ANON_KEY === "string" && config.ANON_KEY.length > 20, "Local anon key required");

async function request(path, body, token) {
  const response = await fetch(`${config.API_URL}/auth/v1/${path}`, {
    method: body ? "POST" : "GET", redirect: "error",
    headers: { apikey: config.ANON_KEY, "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10_000),
  });
  // Never emit provider response bodies or tokens into logs/assertion failures.
  return { status: response.status, data: await response.json() };
}

test("local phone fixtures reject the wrong OTP and create separate authenticated identities", async () => {
  const phone = "+212600000001";
  assert.equal((await request("otp", { phone, create_user: true })).status, 200);
  const wrong = await request("verify", { phone, token: "000000", type: "sms" });
  assert.ok(wrong.status >= 400 && wrong.status < 500, "Wrong OTP must be refused");
  const first = await request("verify", { phone, token: "123456", type: "sms" });
  assert.equal(first.status, 200);
  assert.ok(typeof first.data.access_token === "string", "Access token required");
  assert.ok(typeof first.data.refresh_token === "string", "Refresh token required");
  assert.ok(/^[0-9a-f-]{36}$/.test(first.data.user?.id), "Stable UUID required");
  assert.equal((await request("user", undefined, first.data.access_token)).status, 200);

  const secondPhone = "+212600000002";
  assert.equal((await request("otp", { phone: secondPhone, create_user: true })).status, 200);
  const second = await request("verify", { phone: secondPhone, token: "234567", type: "sms" });
  assert.equal(second.status, 200);
  assert.ok(/^[0-9a-f-]{36}$/.test(second.data.user?.id), "Second UUID required");
  assert.notEqual(first.data.user.id, second.data.user.id);
});
