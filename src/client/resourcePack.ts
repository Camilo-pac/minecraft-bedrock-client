export interface ResourcePackManifest {
  name: string;
  description: string;
  version: string;
  folder: string;
  enabled: boolean;
  clientOnly: true;
}

export interface ClientSettings {
  activePacks: string[];
  lastUpdated: string;
}

export class LocalResourcePackManager {
  private settingsPath: string;
  private packRoot: string;

  constructor(settingsPath: string, packRoot: string) {
    this.settingsPath = settingsPath;
    this.packRoot = packRoot;
  }

  async listAvailablePacks(): Promise<ResourcePackManifest[]> {
    return [
      {
        name: "Example Pack",
        description: "A sample local resource pack for testing visuals",
        version: "1.0.0",
        folder: "example-pack",
        enabled: true,
        clientOnly: true,
      },
      {
        name: "Example Pack 2",
        description: "Another visual-only pack for your own client",
        version: "1.1.0",
        folder: "example-pack-2",
        enabled: false,
        clientOnly: true,
      },
    ];
  }

  async loadSettings(): Promise<ClientSettings> {
    return {
      activePacks: ["example-pack"],
      lastUpdated: new Date().toISOString(),
    };
  }

  async enablePack(packName: string): Promise<void> {
    const settings = await this.loadSettings();
    if (!settings.activePacks.includes(packName)) {
      settings.activePacks.push(packName);
      settings.lastUpdated = new Date().toISOString();
    }

    console.log(`[local-client] Enabled pack: ${packName}`);
  }

  async disablePack(packName: string): Promise<void> {
    const settings = await this.loadSettings();
    settings.activePacks = settings.activePacks.filter((name) => name !== packName);
    settings.lastUpdated = new Date().toISOString();

    console.log(`[local-client] Disabled pack: ${packName}`);
  }

  async getActivePacks(): Promise<string[]> {
    const settings = await this.loadSettings();
    return settings.activePacks;
  }
}
