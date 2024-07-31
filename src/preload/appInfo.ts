import { ipcRenderer } from "electron";

function getAppVersion(): Promise<string> {
  return ipcRenderer.invoke("app-info:get-app-version");
}

export const appInfoAPI = {
  getAppVersion,
};
