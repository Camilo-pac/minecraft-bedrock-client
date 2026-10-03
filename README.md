# Minecraft Bedrock Local Resource Pack Manager

A legitimate local-only project for managing resource packs in a Minecraft Bedrock client workflow. This project is designed to help you organize and toggle resource packs on your own machine, without changing other players' experience.

## Scope

This project does not add cheats, ESP, or unfair gameplay advantages. It focuses on:
- local visual customization
- client-side pack management
- settings persistence
- resource pack organization

## How this works

In Bedrock, resource packs are typically applied on the client side. A pack can be enabled locally for your own client view while leaving multiplayer state unchanged. This project models a local manager for that workflow.

## Features

- Store active and disabled local packs
- Toggle packs on or off from a central manager
- Automatically load the selected pack set
- Keep pack metadata and folder structure organized
- Safe, transparent client-side behavior only

## Project structure

```text
minecraft-bedrock-client/
├── README.md
├── package.json
├── tsconfig.json
├── .gitignore
├── src/
│   ├── client/
│   │   ├── main.ts
│   │   ├── resourcePack.ts
│   │   └── ui/
│   │       └── packManager.ts
│   └── config/
│       └── settings.json
└── resourcepacks/
    ├── example-pack/
    │   ├── pack.mcmeta
    │   ├── ui/
    │   └── textures/
    └── example-pack-2/
        ├── pack.mcmeta
        └── textures/
```

## Quick start

```bash
npm install
npm run build
npm run dev
```

## Local pack workflow

1. Add your resource pack folder under `resourcepacks/`
2. Add a valid `pack.mcmeta` file
3. Run the client manager
4. Use the UI or config to enable the pack for your local client
5. Enjoy the pack only on your side

## Notes

- This is a local utility pattern, not a multiplayer exploit
- It does not manipulate other players' clients
- It does not alter the game rules or server state
