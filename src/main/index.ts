import { release } from "node:os";
import path, { join } from "node:path";
import http from "http";
import { app, BrowserWindow, shell } from "electron";
import portfinder from "portfinder";
import handler from "serve-handler";
import { autoUpdater } from "electron-updater";
import {
  fetchAuthoritativeConfig,
  globalConfig,
  registerConfigIPCHandlers,
} from "./ipc/config";
import { registerAutoUpdaterIPCHandlers } from "./ipc/autoUpdater";
import { registerAppInfoIPCHandlers } from "./ipc/appInfo";
import { registerUtilsIPCHandlers } from "./ipc/utils";
import { registerDeepLink } from "./deeplinking";

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

process.env.DIST_ELECTRON = join(__dirname, "../");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, "../public")
  : process.env.DIST;

// Remove electron security warnings
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

export let mainWindow: BrowserWindow | null = null;
export let availablePort: number | null = null;
export const preload = path.join(__dirname, "../preload/index.js");
export const devServerUrl = process.env.VITE_DEV_SERVER_URL as string;

export async function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "App",
    icon: join(process.env.PUBLIC, "favicon.ico"),
    width: 1100,
    height: 800,
    webPreferences: {
      preload,
      backgroundThrottling: false,
      nodeIntegration: true,
      contextIsolation: false,
    },
    resizable: true,
    maximizable: true,
    minimizable: true,
    minWidth: 900,
    minHeight: 750,
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    // electron-vite-vue#298
    await mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools({ mode: "detach" });
    mainWindow.setMenuBarVisibility(false);
  } else {
    mainWindow.setMenuBarVisibility(false);
    availablePort = await portfinder.getPortPromise({
      port: 90909,
      host: "localhost",
    });
    const server = http.createServer((request, response) => {
      return handler(request, response, {
        public: process.env.DIST,
      });
    });
    server.listen(availablePort, () => {
      mainWindow?.loadURL(`http://localhost:${availablePort}/index.html`);
    });
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:" || "http:")) shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on(
    "will-navigate",
    (event: Electron.Event, url: string) => {
      if (url.startsWith("https:" || "http:") && !url.includes("localhost")) {
        event.preventDefault();
        shell.openExternal(url);
      }
    },
  );

  mainWindow.webContents.setZoomLevel(0);
}

let _configIPCCleanup: () => void;
let _autoUpdaterIPCCleanup: () => void;
let _utilsIPCCleanup: () => void;
let _appInfoIPCCleanup: () => void;

app.whenReady().then(onReady);

function onReady() {
  createMainWindow();

  _configIPCCleanup = registerConfigIPCHandlers();
  _autoUpdaterIPCCleanup = registerAutoUpdaterIPCHandlers();
  _utilsIPCCleanup = registerUtilsIPCHandlers();
  _appInfoIPCCleanup = registerAppInfoIPCHandlers();
  autoUpdater.forceDevUpdateConfig = false;
  autoUpdater.autoDownload = false;
  autoUpdater.disableWebInstaller = true;
  autoUpdater.allowDowngrade = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.autoRunAppAfterInstall = true;

  console.log("App starting...");
  mainWindow?.webContents.setZoomLevel(0);
  mainWindow?.webContents.setZoomFactor(1);

  registerDeepLink();
  fetchAuthoritativeConfig();
  setInterval(
    () => {
      fetchAuthoritativeConfig();
    },
    globalConfig.otaConfigFetchInterval +
      Math.random() * globalConfig.otaConfigFetchJitter,
  );
}

app.on("window-all-closed", async () => {
  mainWindow = null;

  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createMainWindow();
  }
});
