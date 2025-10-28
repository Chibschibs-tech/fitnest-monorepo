// Simple build script that just runs Next.js build
const { execSync } = require("child_process")

console.log("Starting Next.js build...")
try {
  execSync("npx next build", { stdio: "inherit" })
  console.log("Build completed successfully!")
} catch (error) {
  console.error("Build failed:", error.message)
  process.exit(1)
}
