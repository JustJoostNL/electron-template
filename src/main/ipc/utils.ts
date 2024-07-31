import { mkdir, writeFile, readFile } from "fs/promises";
import { join, dirname } from "path";
import { app, clipboard, ipcMain, screen, BrowserWindow } from "electron";

async function handleCopyToClipboard(_event, contents: string) {
  clipboard.writeText(contents);
}

async function handleWriteFile(_event, filePath: string, contents: string) {
  const path = join(app.getPath("userData"), filePath);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, contents);
}

async function handlePatchJSON(_event, filePath: string, patch: object) {
  const absoluteFilePath = join(app.getPath("userData"), filePath);
  await mkdir(dirname(absoluteFilePath), { recursive: true });
  const contents = await readFile(absoluteFilePath).catch(() => "{}");
  const data = JSON.parse(contents.toString());
  await writeFile(absoluteFilePath, JSON.stringify({ ...data, ...patch }));
}

function handleGetCursorScreenPoint() {
  return screen.getCursorScreenPoint();
}

function handleRelaunchApp() {
  app.relaunch();
  app.exit();
}

async function handleGetWindowOpacity(event) {
  return BrowserWindow.fromWebContents(event.sender)?.getOpacity();
}

async function handleSetWindowOpacity(event, opacity: number) {
  BrowserWindow.fromWebContents(event.sender)?.setOpacity(opacity);
}

export function registerUtilsIPCHandlers() {
  ipcMain.handle("utils:relaunch-app", handleRelaunchApp);
  ipcMain.handle("utils:get-cursor-screen-point", handleGetCursorScreenPoint);
  ipcMain.handle("utils:patch-json", handlePatchJSON);
  ipcMain.handle("utils:copy-to-clipboard", handleCopyToClipboard);
  ipcMain.handle("utils:write-file", handleWriteFile);
  ipcMain.handle("utils:set-window-opacity", handleSetWindowOpacity);
  ipcMain.handle("utils:get-window-opacity", handleGetWindowOpacity);

  return () => {
    ipcMain.removeHandler("utils:relaunch-app");
    ipcMain.removeHandler("utils:reset-widevine");
    ipcMain.removeHandler("utils:get-cursor-screen-point");
    ipcMain.removeHandler("utils:patch-json");
    ipcMain.removeHandler("utils:copy-to-clipboard");
    ipcMain.removeHandler("utils:write-file");
    ipcMain.removeHandler("utils:set-window-opacity");
    ipcMain.removeHandler("utils:get-window-opacity");
  };
}
