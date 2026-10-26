import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseEnv } from "node:util";
import { pathToFileURL } from "node:url";

// Static setup qualification only; runtime Auth, sessions and database acceptance are separate.
export function inspectSetup(files) {
  const failures = [];
  const check = (ok, id) => { if (!ok) failures.push(id); };
  const root = JSON.parse(files["package.json"]);
  const core = JSON.parse(files["packages/core/package.json"]);
  const web = JSON.parse(files["apps/web/package.json"]);
  check(/^\d+\.\d+\.\d+$/.test(root.devDependencies?.vitest ?? ""), "T001_VITEST_PIN");
  check(root.scripts?.test === "vitest run", "T001_ROOT_TEST");
  check(core.scripts?.test === "vitest run --config ../../vitest.config.ts packages/core", "T001_CORE_TEST");
  check(files["vitest.config.ts"].includes("passWithNoTests: false"), "T001_EMPTY_SUITE_FAILS");
  check(files["vitest.config.ts"].includes("**/*.integration.test.ts") && files["vitest.config.ts"].includes("**/*.e2e.test.ts"), "T001_RUNTIME_TESTS_SEPARATE");
  for (const dependency of ["@supabase/supabase-js", "@supabase/ssr"]) {
    check(/^\d+\.\d+\.\d+$/.test(web.dependencies?.[dependency] ?? ""), "T002_PIN:" + dependency);
  }
  const env = parseEnv(files[".env.example"]);
  check(env.NEXT_PUBLIC_SUPABASE_URL === "http://127.0.0.1:54321", "T002_LOCAL_URL");
  check(env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "replace_with_local_anon_key", "T002_ANON_PLACEHOLDER");
  check(env.SUPABASE_SERVICE_ROLE_KEY === "replace_with_local_service_role_key", "T002_SERVER_PLACEHOLDER");
  check(!Object.keys(env).some(key => /^NEXT_PUBLIC_.*(?:SERVICE_ROLE|SECRET|PASSWORD|PRIVATE)/i.test(key)), "T002_NO_PUBLIC_SECRET");
  return failures;
}

export const setupPaths = ["package.json", "packages/core/package.json", "apps/web/package.json", ".env.example", "vitest.config.ts"];
export function readSetup(root) {
  return Object.fromEntries(setupPaths.map(path => [path, readFileSync(resolve(root, path), "utf8")]));
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const failures = inspectSetup(readSetup(process.cwd()));
  for (const id of failures) console.error(id); // identifiers only; no environment values
  if (failures.length) process.exitCode = 1;
  else console.log("T001/T002 static setup checks passed; runtime/acceptance evidence remains separate.");
}

