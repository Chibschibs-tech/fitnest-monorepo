// Metro config for the FitNest Expo app inside the monorepo.
//
// apps/mobile is intentionally OUTSIDE the pnpm workspace (see pnpm-workspace.yaml)
// so its React Native / Expo dependency graph can never destabilize the web build.
// Because of that, @fitnest/core is not symlinked into node_modules here — we point
// Metro at its TypeScript source directly and let babel-preset-expo transpile it.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");
const corePath = path.resolve(monorepoRoot, "packages/core");

const config = getDefaultConfig(projectRoot);

// Watch the shared core package so edits hot-reload in the app.
config.watchFolders = [corePath];

// Resolve modules from the app first, then the monorepo root.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Map the bare specifier to the shared source (single source of truth with web).
config.resolver.extraNodeModules = {
  "@fitnest/core": path.resolve(corePath, "src"),
};

config.resolver.disableHierarchicalLookup = true;

module.exports = config;
