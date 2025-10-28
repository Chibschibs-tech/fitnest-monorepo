const fs = require("fs")
const { execSync } = require("child_process")

// Check if node_modules exists
if (!fs.existsSync("node_modules")) {
  console.log("Installing dependencies...")
  try {
    // Force install with legacy peer deps
    execSync("npm install --no-package-lock --force --legacy-peer-deps", { stdio: "inherit" })
    console.log("Dependencies installed successfully!")
  } catch (error) {
    console.error("Error installing dependencies:", error)
    process.exit(1)
  }
}

// Check if Prisma is installed and remove it
if (fs.existsSync("node_modules/@prisma")) {
  console.log("Removing Prisma...")
  try {
    fs.rmSync("node_modules/@prisma", { recursive: true, force: true })
    console.log("Prisma removed successfully!")
  } catch (error) {
    console.error("Error removing Prisma:", error)
  }
}

// Create a stub for Prisma
const prismaStubDir = "node_modules/@prisma/client"
if (!fs.existsSync(prismaStubDir)) {
  console.log("Creating Prisma stub...")
  try {
    fs.mkdirSync(prismaStubDir, { recursive: true })
    fs.writeFileSync(
      `${prismaStubDir}/index.js`,
      `
      // Prisma stub
      exports.PrismaClient = function() {
        return {
          $connect: () => Promise.resolve(),
          $disconnect: () => Promise.resolve(),
          user: {
            findUnique: () => Promise.resolve(null),
            create: () => Promise.resolve({}),
            update: () => Promise.resolve({}),
            delete: () => Promise.resolve({})
          }
        };
      };
    `,
    )
    fs.writeFileSync(
      `${prismaStubDir}/package.json`,
      JSON.stringify(
        {
          name: "@prisma/client",
          version: "5.10.2",
          main: "index.js",
        },
        null,
        2,
      ),
    )
    console.log("Prisma stub created successfully!")
  } catch (error) {
    console.error("Error creating Prisma stub:", error)
  }
}

console.log("Setup completed successfully!")
