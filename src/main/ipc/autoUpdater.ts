import { ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
import { broadcastToAllWindows } from "../utils/broadcastToAllWindows";

let updateAvailable = false;

async function handleCheckForUpdates() {
  return await autoUpdater.checkForUpdates();
}

async function handleQuitAndInstall() {
  return autoUpdater.quitAndInstall();
}

function handleUpdateAvailable() {
  updateAvailable = true;
  console.log("Update available.");
  autoUpdater.downloadUpdate();
}

function handleUpdateNotAvailable() {
  updateAvailable = false;
  console.log("No update available.");
}

function handleUpdateDownloaded() {
  updateAvailable = true;
  console.log("Update downloaded.");
  broadcastToAllWindows("update-downloaded", null);
}

function handleGetUpdateAvailable() {
  return updateAvailable;
}

function handleUpdateError(error: Error) {
  console.log("An error occurred in the update process: " + error);
  broadcastToAllWindows("update-error", error.message);
}

function registerAutoUpdaterIPCHandlers() {
  autoUpdater.on("error", handleUpdateError);
  autoUpdater.on("update-downloaded", handleUpdateDownloaded);
  autoUpdater.on("update-available", handleUpdateAvailable);
  autoUpdater.on("update-not-available", handleUpdateNotAvailable);
  autoUpdater.on("error", handleUpdateError);

  ipcMain.handle("auto-updater:check-for-updates", handleCheckForUpdates);
  ipcMain.handle("auto-updater:get-update-available", handleGetUpdateAvailable);
  ipcMain.handle("auto-updater:quit-and-install", handleQuitAndInstall);

  return function () {
    autoUpdater.off("error", handleUpdateError);
    autoUpdater.off("update-downloaded", handleUpdateDownloaded);
    autoUpdater.off("update-available", handleUpdateAvailable);
    autoUpdater.off("update-not-available", handleUpdateNotAvailable);
    autoUpdater.off("error", handleUpdateError);

    ipcMain.removeHandler("updater:checkForUpdates");
    ipcMain.removeHandler("updater:getUpdateAvailable");
    ipcMain.removeHandler("updater:quitAndInstall");
  };
}

export { registerAutoUpdaterIPCHandlers };
