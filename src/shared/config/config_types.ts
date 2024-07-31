export interface IConfig {
  authoritativeHostnames: string[];
  otaConfigFetchInterval: number;
  otaConfigFetchJitter: number;
}

export interface IOTAConfigPayload {
  default_config: Partial<IConfig>;
  override_config: Partial<IConfig>;
}
