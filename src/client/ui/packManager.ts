import * as fs from "node:fs/promises";
import * as path from "node:path";

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
  packRoot: string;
  lastUpdated: string;
}

const DEFAULT_SETTINGS: ClientSettings = {
  activePacks: ["example-pack"],
  packRoot: "./resourcepacks",
  lastUpdated: new Date().toISOString(),
};

export class LocalResourcePackManager {
  private readonly settingsPath: string;
  private readonly packRoot: string;

  constructor(settingsPath: string, packRoot: string) {
    this.settingsPath = settingsPath;
    this.packRoot = packRoot;
  }

  async listAvailablePacks(): Promise<ResourcePackManifest[]> {
    const activeSettings = await this.loadSettings();
    const entries = await fs.readdir(this.packRoot, { withFileTypes: true });

    const packDirs = entries.filter((entry) => entry.isDirectory());

    const manifests = await Promise.all(
      packDirs.map(async (entry) => {
        const folder = entry.name;
        const packPath = path.join(this.packRoot, folder);
        const metadataPath = path.join(packPath, "pack.mcmeta");

        let description = "Custom local-only resource pack";
        let version = "1.0.0";

        try {
          const mcmeta = await fs.readFile(metadataPath, "utf8");
          const json = JSON.parse(mcmeta) as { pack?: { description?: string; version?: string[] } };
          const packInfo = json.pack ?? {};

          if (typeof packInfo.description === "string") {
            description = packInfo.description;
          }

          if (Array.isArray(packInfo.version) && packInfo.version.length >= 2) {
            version = packInfo.version.join(".");
          }
        } catch {
          // Missing metadata is acceptable for user-defined test packs.
        }

        return {
          name: folder
            .split("-")
            .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
            .join(" "),
          description,
          version,
          folder,
          enabled: activeSettings.activePacks.includes(folder),
          clientOnly: true,
        };
      }),
    );

    return manifests.sort((a, b) => a.name.localeCompare(b.name));
  }

  async loadSettings(): Promise<ClientSettings> {
    try {
      const raw = await fs.readFile(this.settingsPath, "utf8");
      const parsed = JSON.parse(raw) as Partial<ClientSettings>;

      return {
        activePacks: Array.isArray(parsed.activePacks) ? parsed.activePacks : DEFAULT_SETTINGS.activePacks,
        packRoot: typeof parsed.packRoot === "string" ? parsed.packRoot : this.packRoot,
        lastUpdated: typeof parsed.lastUpdated === "string" ? parsed.lastUpdated : new Date().toISOString(),
      };
    } catch {
      await fs.mkdir(path.dirname(this.settingsPath), { recursive: true });
      await fs.writeFile(this.settingsPath, JSON.stringify(DEFAULT_SETTINGS, null, 2));
      return { ...DEFAULT_SETTINGS, packRoot: this.packRoot };
    }
  }

  async saveSettings(settings: ClientSettings): Promise<void> {
    await fs.mkdir(path.dirname(this.settingsPath), { recursive: true });
    await fs.writeFile(this.settingsPath, JSON.stringify(settings, null, 2));
  }

  async enablePack(packName: string): Promise<void> {
    const settings = await this.loadSettings();
    if (!settings.activePacks.includes(packName)) {
      settings.activePacks.push(packName);
    }

    settings.lastUpdated = new Date().toISOString();
    await this.saveSettings(settings);
    console.log(`[local-client] Enabled pack: ${packName}`);
  }

  async disablePack(packName: string): Promise<void> {
    const settings = await this.loadSettings();
    settings.activePacks = settings.activePacks.filter((name) => name !== packName);
    settings.lastUpdated = new Date().toISOString();
    await this.saveSettings(settings);
    console.log(`[local-client] Disabled pack: ${packName}`);
  }

  async getActivePacks(): Promise<string[]> {
    const settings = await this.loadSettings();
    return settings.activePacks;
  }
}
