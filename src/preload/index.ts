import { configAPI } from "./config";
import { utilsAPI } from "./utils";
import { appInfoAPI } from "./appInfo";
import { autoUpdaterAPI } from "./autoUpdater";

export const app = {
  config: configAPI,
  autoUpdater: autoUpdaterAPI,
  appInfo: appInfoAPI,
  utils: utilsAPI,
  platform: process.platform,
  arch: process.arch,
};

window.app = app;
