#!/usr/bin/env node

/**
 * 🧬 MindHelix AI — Universal Cross-Platform 1-Command Launcher
 * Runs on any device: Windows, macOS, Linux, Docker, or Cloud VM
 * Usage:
 *   npx @dhyangandhi/mindhelix-ai
 *   node bin/mindhelix.js [--port 3000] [--desktop] [--no-open]
 */

const path = require("path");
const fs = require("fs");
const { exec, spawn } = require("child_process");

const args = process.argv.slice(2);

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  magenta: "\x1b[35m",
  red: "\x1b[31m",
  blue: "\x1b[34m"
};

function printBanner(port) {
  console.log(`
${colors.cyan}${colors.bright}======================================================================${colors.reset}
${colors.magenta}${colors.bright}   🧬  M I N D H E L I X   A I   —   U N I V E R S A L   E N G I N E   ${colors.reset}
${colors.cyan}${colors.bright}======================================================================${colors.reset}
  ${colors.green}✔ Operating System:${colors.reset}   ${process.platform} (${process.arch})
  ${colors.green}✔ Node.js Runtime:${colors.reset}    ${process.version}
  ${colors.green}✔ Active Port:${colors.reset}        ${port}
  ${colors.green}✔ Security Firewall:${colors.reset}  4-Layer WAF Active & Enforced
  ${colors.green}✔ Live Sandbox:${colors.reset}       HTML/JS/Python/Bash Multi-Runtime Ready
${colors.cyan}----------------------------------------------------------------------${colors.reset}
  ${colors.bright}🚀 Live Access Points:${colors.reset}
  • Web Interface:    ${colors.cyan}http://localhost:${port}/home${colors.reset}
  • AI Studio:        ${colors.cyan}http://localhost:${port}/ai${colors.reset}
  • Live Sandbox:     ${colors.cyan}http://localhost:${port}/ai (Click "Live Sandbox")${colors.reset}
  • Telemetry:        ${colors.cyan}http://localhost:${port}/dashboard${colors.reset}
  • Security Center:  ${colors.cyan}http://localhost:${port}/firewall${colors.reset}
${colors.cyan}======================================================================${colors.reset}
  ${colors.yellow}Press [Ctrl + C] anytime to gracefully stop the platform.${colors.reset}
`);
}

function openBrowser(url) {
  const plat = process.platform;
  try {
    if (plat === "win32") {
      exec(`start "" "${url}"`);
    } else if (plat === "darwin") {
      exec(`open "${url}"`);
    } else {
      exec(`xdg-open "${url}" || sensible-browser "${url}" || x-www-browser "${url}"`);
    }
  } catch (e) {
    // Silent fallback if desktop environment is headless
  }
}

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
🧬 MindHelix AI — Next-Gen Multi-Platform AI Suite

Usage:
  mindhelix [options]
  npx @dhyangandhi/mindhelix-ai [options]

Options:
  -p, --port <number>   Specify custom port (default: 3000)
  --desktop             Launch native Electron desktop application
  --no-open             Do not automatically open default web browser
  -v, --version         Display MindHelix AI version
  -h, --help            Show this help reference

Examples:
  npx @dhyangandhi/mindhelix-ai
  npx @dhyangandhi/mindhelix-ai --port 8080
  npx @dhyangandhi/mindhelix-ai --desktop
`);
  process.exit(0);
}

if (args.includes("--version") || args.includes("-v")) {
  try {
    const pkg = require("../package.json");
    console.log(`MindHelix AI v${pkg.version}`);
  } catch (e) {
    console.log("MindHelix AI v2.5.0");
  }
  process.exit(0);
}

// Parse custom port
let chosenPort = process.env.PORT || 3000;
const portIndex = args.findIndex(a => a === "--port" || a === "-p");
if (portIndex !== -1 && args[portIndex + 1]) {
  chosenPort = parseInt(args[portIndex + 1], 10) || 3000;
  process.env.PORT = String(chosenPort);
}

const shouldOpenBrowser = !args.includes("--no-open");

if (args.includes("--desktop")) {
  console.log(`${colors.cyan}Launching MindHelix AI Desktop Application (Electron)...${colors.reset}`);
  const electronPath = require.resolve("electron");
  const mainScript = path.join(__dirname, "..", "main.js");
  const proc = spawn(electronPath, [mainScript], { stdio: "inherit" });
  proc.on("close", (code) => process.exit(code || 0));
} else {
  // Start server
  printBanner(chosenPort);

  try {
    require("../server.js");

    if (shouldOpenBrowser) {
      setTimeout(() => {
        openBrowser(`http://localhost:${chosenPort}/home`);
      }, 1000);
    }
  } catch (err) {
    console.error(`${colors.red}Error starting MindHelix AI:${colors.reset}`, err.message);
    process.exit(1);
  }
}
