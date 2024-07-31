import { ipcRenderer } from "electron";
import { UpdateCheckResult } from "electron-updater";

function checkForUpdates(): Promise<UpdateCheckResult> {
  return ipcRenderer.invoke("auto-updater:check-for-updates");
}
function getUpdateAvailable(): Promise<boolean> {
  return ipcRenderer.invoke("auto-updater:get-update-available");
}
function quitAndInstall(): Promise<void> {
  return ipcRenderer.invoke("auto-updater:quit-and-install");
}

export const autoUpdaterAPI = {
  checkForUpdates,
  getUpdateAvailable,
  quitAndInstall,
};
