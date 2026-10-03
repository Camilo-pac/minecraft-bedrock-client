import { LocalResourcePackManager } from "../resourcePack.js";
import { PackManagerUI } from "./ui/packManager.js";

async function main(): Promise<void> {
  const settingsPath = "./config/settings.json";
  const packRoot = "./resourcepacks";
  const manager = new LocalResourcePackManager(settingsPath, packRoot);
  const ui = new PackManagerUI();

  const availablePacks = await manager.listAvailablePacks();
  const activePacks = await manager.getActivePacks();

  ui.clear();

  for (const pack of availablePacks) {
    const action = pack.enabled ? "disable" : "enable";
    ui.registerAction(`${pack.enabled ? "Disable" : "Enable"} ${pack.name}`, action, pack.folder);
  }

  console.log("Minecraft Bedrock Local Resource Pack Manager");
  console.log("===========================================");
  console.log("This manager only changes the local client state for this device.");
  console.log("It does not modify other players or server rules.");
  console.log("");

  console.log("Available packs:");
  if (availablePacks.length === 0) {
    console.log("No resource packs found in ./resourcepacks");
  } else {
    for (const pack of availablePacks) {
      console.log(`- ${pack.name} (${pack.folder}) => ${pack.enabled ? "enabled" : "disabled"}`);
    }
  }

  console.log("");
  console.log("Active on this client:");
  console.log(activePacks.length > 0 ? activePacks.join(", ") : "No active packs");

  console.log("");
  console.log("Client-side toggles:");
  console.log(ui.render());
}

main().catch((error: unknown) => {
  console.error("Failed to initialize local pack manager:", error);
  process.exitCode = 1;
});
