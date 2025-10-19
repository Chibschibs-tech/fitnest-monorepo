import path from "path";
import { defineConfig } from "drizzle-kit";

const cwd = process.cwd();

export default defineConfig({
  schema: path.join(cwd, "packages/db/src/schema.ts"),
  out: path.join(cwd, "packages/db/src/migrations"),
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
  casing: "snake_case",
});
