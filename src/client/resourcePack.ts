import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

export interface ResourcePackManifest {
  name: string;
  description: string;
  version: string;
  folder: string;
  enabled: boolean;
  path: string;
  clientOnly: true;
}

export interface ClientSettings {
  activePacks: string[];
  bedrockPath: string;
  lastUpdated: string;
}

const BEDROCK_PATHS: Record<string, string> = {
  win32: path.join(process.env.APPDATA || "", "Microsoft", "Windows", "AppsFolder"),
  darwin: path.join(os.homedir(), "Library", "Application Support", "minecraft"),
  linux: path.join(os.homedir(), ".minecraft"),
};

const RESOURCE_PACK_SUBDIR = "resource_packs";

export class BedrockResourcePackManager {
  private readonly settingsPath: string;
  private readonly bedrockPath: string;
  private readonly resourcePacksPath: string;

  constructor(settingsPath?: string, bedrockPath?: string) {
    this.settingsPath = settingsPath || path.join(os.homedir(), ".bedrock-client", "settings.json");
    this.bedrockPath = bedrockPath || this.detectBedrockPath();
    this.resourcePacksPath = path.join(this.bedrockPath, RESOURCE_PACK_SUBDIR);
  }

  private detectBedrockPath(): string {
    const platform = process.platform as keyof typeof BEDROCK_PATHS;
    const basePath = BEDROCK_PATHS[platform] || BEDROCK_PATHS.linux;

    if (fs.statSync(basePath).isDirectory()) {
      return basePath;
    }

    const fallback = path.join(os.homedir(), ".bedrock");
    console.warn(
      `[bedrock-client] Bedrock path not found. Using fallback: ${fallback}`
    );
    return fallback;
  }

  async listAvailablePacks(): Promise<ResourcePackManifest[]> {
    const activeSettings = await this.loadSettings();

    try {
      await fs.mkdir(this.resourcePacksPath, { recursive: true });
    } catch {
      console.warn(
        `[bedrock-client] Could not ensure resource pack directory exists: ${this.resourcePacksPath}`
      );
    }

    let entries: fs.Dirent[] = [];
    try {
      entries = await fs.readdir(this.resourcePacksPath, { withFileTypes: true });
    } catch {
      console.warn(
        `[bedrock-client] Could not read resource pack directory: ${this.resourcePacksPath}`
      );
      return [];
    }

    const packDirs = entries.filter((entry) => entry.isDirectory());

    const manifests = await Promise.all(
      packDirs.map(async (entry) => {
        const folder = entry.name;
        const packPath = path.join(this.resourcePacksPath, folder);
        const manifestPath = path.join(packPath, "manifest.json");

        let description = "Custom Bedrock resource pack";
        let version = "1.0.0";

        try {
          const manifestData = await fs.readFile(manifestPath, "utf8");
          const json = JSON.parse(manifestData) as {
            header?: { description?: string; version?: number[] };
          };
          const headerInfo = json.header ?? {};

          if (typeof headerInfo.description === "string") {
            description = headerInfo.description;
          }

          if (
            Array.isArray(headerInfo.version) &&
            headerInfo.version.length >= 3
          ) {
            version = headerInfo.version.join(".");
          }
        } catch {
          // Missing or invalid manifest is acceptable for user-defined test packs.
        }

        return {
          name: folder
            .split("-")
            .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
            .join(" "),
          description,
          version,
          folder,
          path: packPath,
          enabled: activeSettings.activePacks.includes(folder),
          clientOnly: true,
        };
      })
    );

    return manifests.sort((a, b) => a.name.localeCompare(b.name));
  }

  async loadSettings(): Promise<ClientSettings> {
    try {
      const raw = await fs.readFile(this.settingsPath, "utf8");
      const parsed = JSON.parse(raw) as Partial<ClientSettings>;

      return {
        activePacks: Array.isArray(parsed.activePacks) ? parsed.activePacks : [],
        bedrockPath: this.bedrockPath,
        lastUpdated:
          typeof parsed.lastUpdated === "string"
            ? parsed.lastUpdated
            : new Date().toISOString(),
      };
    } catch {
      const defaultSettings: ClientSettings = {
        activePacks: [],
        bedrockPath: this.bedrockPath,
        lastUpdated: new Date().toISOString(),
      };

      try {
        await fs.mkdir(path.dirname(this.settingsPath), { recursive: true });
        await fs.writeFile(
          this.settingsPath,
          JSON.stringify(defaultSettings, null, 2)
        );
      } catch (error) {
        console.warn(
          `[bedrock-client] Could not write settings file: ${error}`
        );
      }

      return defaultSettings;
    }
  }

  async saveSettings(settings: ClientSettings): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.settingsPath), { recursive: true });
      await fs.writeFile(
        this.settingsPath,
        JSON.stringify(settings, null, 2)
      );
      console.log(`[bedrock-client] Settings saved to ${this.settingsPath}`);
    } catch (error) {
      console.error(
        `[bedrock-client] Failed to save settings: ${error}`
      );
      throw error;
    }
  }

  async enablePack(packName: string): Promise<void> {
    const settings = await this.loadSettings();
    if (!settings.activePacks.includes(packName)) {
      settings.activePacks.push(packName);
    }

    settings.lastUpdated = new Date().toISOString();
    await this.saveSettings(settings);
    console.log(`[bedrock-client] Enabled pack: ${packName}`);
  }

  async disablePack(packName: string): Promise<void> {
    const settings = await this.loadSettings();
    settings.activePacks = settings.activePacks.filter(
      (name) => name !== packName
    );
    settings.lastUpdated = new Date().toISOString();
    await this.saveSettings(settings);
    console.log(`[bedrock-client] Disabled pack: ${packName}`);
  }

  async getActivePacks(): Promise<string[]> {
    const settings = await this.loadSettings();
    return settings.activePacks;
  }

  getResourcePacksDirectory(): string {
    return this.resourcePacksPath;
  }

  getBedrockDirectory(): string {
    return this.bedrockPath;
  }
}
