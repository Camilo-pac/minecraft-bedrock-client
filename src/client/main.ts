import { LocalResourcePackManager } from "../resourcePack.js";
import { PackManagerUI } from "./packManager.js";

async function main(): Promise<void> {
  const manager = new LocalResourcePackManager("./config/settings.json", "./resourcepacks");
  const ui = new PackManagerUI();

  ui.registerAction("Enable Example Pack", "enable", "example-pack");
  ui.registerAction("Disable Example Pack 2", "disable", "example-pack-2");

  const availablePacks = await manager.listAvailablePacks();
  const activePacks = await manager.getActivePacks();

  console.log("Minecraft Bedrock Local Pack Manager");
  console.log("===================================");
  console.log("Available packs:");
  availablePacks.forEach((pack) => {
    console.log(`- ${pack.name} (${pack.folder}) => ${pack.enabled ? "enabled" : "disabled"}`);
  });

  console.log("\nActive on this client:");
  console.log(activePacks.length > 0 ? activePacks.join(", ") : "No active packs");

  console.log("\nUI actions:");
  console.log(ui.render());
}

main().catch((error: unknown) => {
  console.error("Failed to initialize local pack manager:", error);
  process.exitCode = 1;
});
