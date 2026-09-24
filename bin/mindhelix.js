#!/usr/bin/env node

/**
 * MindHelix AI - CLI Launcher
 * https://github.com/dhyangandhi/MindHelix-AI
 */

const path = require("path");
const fs = require("fs");

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
🧬 MindHelix AI — Next-Gen Multi-Platform AI Suite
Usage:
  mindhelix [options]

Options:
  -p, --port <number>   Specify port (default: 3000)
  -v, --version         Show version
  -h, --help            Show this help message
  --desktop             Launch Electron desktop application

Examples:
  npx @dhyangandhi/mindhelix-ai
  npx @dhyangandhi/mindhelix-ai --port 5000
`);
  process.exit(0);
}

if (args.includes("--version") || args.includes("-v")) {
  const pkg = require("../package.json");
  console.log(`MindHelix AI v${pkg.version}`);
  process.exit(0);
}

// Check custom port
const portIndex = args.findIndex(a => a === "--port" || a === "-p");
if (portIndex !== -1 && args[portIndex + 1]) {
  process.env.PORT = args[portIndex + 1];
}

if (args.includes("--desktop")) {
  const { spawn } = require("child_process");
  const electronPath = require.resolve("electron");
  const mainScript = path.join(__dirname, "..", "main.js");
  const proc = spawn(electronPath, [mainScript], { stdio: "inherit" });
  proc.on("close", (code) => process.exit(code || 0));
} else {
  // Launch server
  require("../server.js");
}
