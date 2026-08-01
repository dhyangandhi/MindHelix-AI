const { app, BrowserWindow } = require("electron");
const path = require("path");
const http = require("http");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Try loading local server (localhost:3000); if server is down, load dashbord.html directly
  const req = http.get("http://localhost:3000", () => {
    win.loadURL("http://localhost:3000");
  });

  req.on("error", () => {
    win.loadFile(path.join(__dirname, "www", "home.html"));
  });
}

app.whenReady().then(() => {
  createWindow();
});