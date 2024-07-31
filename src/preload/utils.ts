import { ipcRenderer } from "electron";

function copyToClipboard(contents: string) {
  return ipcRenderer.invoke("utils:copy-to-clipboard", contents);
}

function writeFile(filePath: string, contents: string) {
  return ipcRenderer.invoke("utils:write-file", filePath, contents);
}

function patchJSON(filePath: string, data: object) {
  return ipcRenderer.invoke("utils:patch-json", filePath, data);
}

function getCursorScreenPoint() {
  return ipcRenderer.invoke("utils:get-cursor-screen-point");
}

function relaunchApp() {
  return ipcRenderer.invoke("utils:relaunch-app");
}

function setWindowOpacity(opacity: number) {
  return ipcRenderer.invoke("utils:set-window-opacity", opacity);
}

function getWindowOpacity() {
  return ipcRenderer.invoke("utils:get-window-opacity");
}

export const utilsAPI = {
  copyToClipboard,
  getCursorScreenPoint,
  writeFile,
  patchJSON,
  relaunchApp,
  setWindowOpacity,
  getWindowOpacity,
};
