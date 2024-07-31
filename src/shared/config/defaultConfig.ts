import { IConfig } from "./config_types";

export const defaultConfig: IConfig = {
  authoritativeHostnames: [],
  otaConfigFetchInterval: 120000, // 2 minutes
  otaConfigFetchJitter: 30000, // 30 seconds
};
