export interface PackManagerAction {
  label: string;
  action: "enable" | "disable";
  packName: string;
}

export class PackManagerUI {
  private readonly actions: PackManagerAction[] = [];

  registerAction(label: string, action: PackManagerAction["action"], packName: string): void {
    this.actions.push({ label, action, packName });
  }

  render(): string {
    if (this.actions.length === 0) {
      return "No packs configured.";
    }

    return this.actions
      .map(({ label, action, packName }) => `${label}: ${action.toUpperCase()} ${packName}`)
      .join("\n");
  }

  clear(): void {
    this.actions.length = 0;
  }
}
