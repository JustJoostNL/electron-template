import { app, ipcMain } from "electron";

function handleGetAppVersion() {
  return app.getVersion();
}

function registerAppInfoIPCHandlers() {
  ipcMain.handle("app-info:get-app-version", handleGetAppVersion);

  return function () {
    ipcMain.removeHandler("appInfo:get-app-version");
  };
}

export { registerAppInfoIPCHandlers };
