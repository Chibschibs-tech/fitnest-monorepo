import assert from "node:assert/strict";
import { test } from "node:test";
import { inspectSetup, readSetup } from "./check-setup.mjs";
const source = readSetup(process.cwd());
test("repository setup satisfies T001/T002 static obligations", () => assert.deepEqual(inspectSetup(source), []));
const cases = [
 ["unbounded Vitest", "package.json", value => { const x=JSON.parse(value); x.devDependencies.vitest="latest"; return JSON.stringify(x); }, "T001_VITEST_PIN"],
 ["old broken core runner", "packages/core/package.json", value => { const x=JSON.parse(value); x.scripts.test="node --experimental-strip-types src/__tests__/run.ts"; return JSON.stringify(x); }, "T001_CORE_TEST"],
 ["empty suite treated as success", "vitest.config.ts", value => value.replace("passWithNoTests: false", "passWithNoTests: true"), "T001_EMPTY_SUITE_FAILS"],
 ["unbounded Supabase SDK", "apps/web/package.json", value => { const x=JSON.parse(value); x.dependencies["@supabase/supabase-js"]="^2.110.7"; return JSON.stringify(x); }, "T002_PIN:@supabase/supabase-js"],
 ["cloud fixture URL", ".env.example", value => value.replace("http://127.0.0.1:54321", "https://example.supabase.co"), "T002_LOCAL_URL"],
 ["exposed service role", ".env.example", value => value+"\nNEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=forbidden\n", "T002_NO_PUBLIC_SECRET"],
 ["functional server credential", ".env.example", value => value.replace("replace_with_local_service_role_key", "not-a-placeholder"), "T002_SERVER_PLACEHOLDER"],
];
for (const [name,path,mutate,id] of cases) test("rejects "+name, () => assert.ok(inspectSetup({...source,[path]:mutate(source[path])}).includes(id)));
test("malformed manifests fail closed", () => assert.throws(() => inspectSetup({...source,"package.json":"{"})));

for (const prefix of [" ", "\t", "export ", "  export "]) test("rejects public secret with prefix " + JSON.stringify(prefix), () => assert.ok(inspectSetup({...source, ".env.example": source[".env.example"] + "\n" + prefix + "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=forbidden\n"}).includes("T002_NO_PUBLIC_SECRET")));

