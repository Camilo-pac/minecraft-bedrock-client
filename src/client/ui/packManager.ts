import * as readline from "node:readline";
import { BedrockResourcePackManager, type ResourcePackManifest } from "../resourcePack.js";

export class BedrockPackManagerUI {
  private readonly manager: BedrockResourcePackManager;
  private readonly rl: readline.Interface;

  constructor(manager: BedrockResourcePackManager) {
    this.manager = manager;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  private prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  async displayPacks(packs: ResourcePackManifest[]): Promise<void> {
    console.log("\n=== Available Bedrock Resource Packs ===");

    if (packs.length === 0) {
      console.log("No resource packs found.");
      console.log(`Add packs to: ${this.manager.getResourcePacksDirectory()}`);
      return;
    }

    packs.forEach((pack, index) => {
      const status = pack.enabled ? "[ENABLED]" : "[DISABLED]";
      console.log(`${index + 1}. ${pack.name} ${status}`);
      console.log(`   Description: ${pack.description}`);
      console.log(`   Version: ${pack.version}`);
      console.log(`   Folder: ${pack.folder}`);
      console.log("");
    });
  }

  async showMenu(packs: ResourcePackManifest[]): Promise<void> {
    let running = true;

    while (running) {
      await this.displayPacks(packs);

      console.log("Commands:");
      console.log('  "enable <number>" - Enable a pack');
      console.log('  "disable <number>" - Disable a pack');
      console.log('  "list" - List all packs');
      console.log('  "quit" - Exit');
      console.log("");

      const input = await this.prompt("Enter command: ");
      const [command, arg] = input.trim().toLowerCase().split(" ");

      if (command === "quit") {
        running = false;
        console.log("Goodbye!");
      } else if (command === "enable") {
        const idx = parseInt(arg, 10) - 1;
        if (idx >= 0 && idx < packs.length) {
          await this.manager.enablePack(packs[idx].folder);
          packs = await this.manager.listAvailablePacks();
          console.log(`✓ Enabled: ${packs[idx].name}`);
        } else {
          console.log("Invalid pack number.");
        }
      } else if (command === "disable") {
        const idx = parseInt(arg, 10) - 1;
        if (idx >= 0 && idx < packs.length) {
          await this.manager.disablePack(packs[idx].folder);
          packs = await this.manager.listAvailablePacks();
          console.log(`✓ Disabled: ${packs[idx].name}`);
        } else {
          console.log("Invalid pack number.");
        }
      } else if (command === "list") {
        packs = await this.manager.listAvailablePacks();
      } else {
        console.log("Unknown command. Try again.");
      }

      console.log("");
    }
  }

  close(): void {
    this.rl.close();
  }
}
