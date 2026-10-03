# Minecraft Bedrock Local Resource Pack Manager

**Client-side only. No server manipulation. Fair play guaranteed.**

A local resource pack manager for Minecraft Bedrock Edition. This tool helps you organize and toggle resource packs on your own device without affecting other players or server state.

## What This Does

- Discovers resource packs in your Bedrock installation
- Lists available packs with metadata
- Enables/disables packs locally via interactive CLI
- Stores active pack preferences in a local config file
- Works on Windows, macOS, and Linux

## What This Does NOT Do

- ❌ Cheats or exploits
- ❌ Affects other players
- ❌ Modifies server state
- ❌ Gives unfair gameplay advantages
- ❌ Manipulates any multiplayer mechanics

## Installation

```bash
git clone https://github.com/Camilo-pac/minecraft-bedrock-client.git
cd minecraft-bedrock-client
npm install
npm run build
```

## Usage

```bash
npm run dev
```

The tool will:
1. Detect your Bedrock installation
2. Scan for resource packs
3. Display an interactive menu
4. Let you enable/disable packs

### Commands

- `enable <number>` - Enable a pack by its number
- `disable <number>` - Disable a pack by its number
- `list` - Refresh the pack list
- `quit` - Exit the tool

## Adding Resource Packs

1. Place your Bedrock-format resource pack in the detected packs directory
2. Each pack must have a `manifest.json` file:

```json
{
  "header": {
    "description": "My Custom Pack",
    "version": [1, 0, 0]
  },
  "modules": [
    {
      "version": [1, 0, 0],
      "type": "resources"
    }
  ]
}
```

3. Run the manager and enable the pack

## Pack Directory Structure

```
resource_packs/
├── my-texture-pack/
│   ├── manifest.json
│   ├── textures/
│   ├── ui/
│   └── shaders/
└── my-other-pack/
    ├── manifest.json
    └── textures/
```

## Configuration

Settings are stored in: `~/.bedrock-client/settings.json`

This file tracks which packs are enabled for your client.

## Platform Support

- **Windows**: Reads from Minecraft app data folder
- **macOS**: Reads from `~/Library/Application Support/minecraft`
- **Linux**: Reads from `~/.minecraft`

## Building

```bash
npm run build  # Compile TypeScript
npm run dev    # Run with tsx
```

## Notes

- All changes are local to your machine
- Your enabled packs only load on your client
- Other players will not see any visual changes from your packs
- This is a utility for personal resource pack management, not a multiplayer feature
