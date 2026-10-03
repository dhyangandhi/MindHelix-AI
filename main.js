const { app, BrowserWindow } = require("electron");
const path = require("path");
const http = require("http");

function ensureServerRunning(callback) {
  const req = http.get("http://localhost:3000", () => {
    callback(true);
  });
  req.on("error", () => {
    try {
      // Auto-start embedded server if not already running on port 3000
      require("./server");
      setTimeout(() => callback(true), 600);
    } catch (e) {
      console.warn("Could not auto-start embedded server:", e.message);
      callback(false);
    }
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1320,
    height: 880,
    minWidth: 1024,
    minHeight: 720,
    autoHideMenuBar: true,
    title: "MindHelix AI — Multi-Platform Suite",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  ensureServerRunning((isRunning) => {
    if (isRunning) {
      win.loadURL("http://localhost:3000/home");
    } else {
      win.loadFile(path.join(__dirname, "www", "home.html"));
    }
  });
}

app.whenReady().then(() => {
  createWindow();
});