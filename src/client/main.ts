import { BedrockResourcePackManager } from "../resourcePack.js";
import { BedrockPackManagerUI } from "./ui/packManager.js";

async function main(): Promise<void> {
  console.log("\n=== Minecraft Bedrock Local Resource Pack Manager ===");
  console.log("This tool manages resource packs on your local Bedrock client.");
  console.log("Changes only affect your own device and game experience.\n");

  const manager = new BedrockResourcePackManager();
  const ui = new BedrockPackManagerUI(manager);

  try {
    console.log(`📁 Bedrock Directory: ${manager.getBedrockDirectory()}`);
    console.log(
      `📦 Resource Packs: ${manager.getResourcePacksDirectory()}\n`
    );

    const packs = await manager.listAvailablePacks();
    const activePacks = await manager.getActivePacks();

    console.log(
      `Found ${packs.length} pack(s). ${activePacks.length} active.\n`
    );

    await ui.showMenu(packs);
  } catch (error) {
    console.error("Error:", error);
    process.exitCode = 1;
  } finally {
    ui.close();
  }
}

main();
