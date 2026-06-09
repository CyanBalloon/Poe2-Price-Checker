import { screen, globalShortcut, clipboard, app } from "electron";
import path from "path";
import child_process from "child_process";
import { uIOhook, UiohookKey, UiohookWheelEvent } from "uiohook-napi";
import {
  isModKey,
  KeyToElectron,
  mergeTwoHotkeys,
} from "../../../ipc/KeyToCode";
import { typeInChat, stashSearch } from "./text-box";
import { WidgetAreaTracker } from "../windowing/WidgetAreaTracker";
import { HostClipboard } from "./HostClipboard";
import { OcrWorker } from "../vision/link-main";
import type { ShortcutAction } from "../../../ipc/types";
import type { Logger } from "../RemoteLogger";
import type { OverlayWindow } from "../windowing/OverlayWindow";
import type { GameWindow } from "../windowing/GameWindow";
import type { GameConfig } from "../host-files/GameConfig";
import type { ServerEvents } from "../server";

type UiohookKeyT = keyof typeof UiohookKey;
const UiohookToName = Object.fromEntries(
  Object.entries(UiohookKey).map(([k, v]) => [v, k]),
);

export class Shortcuts {
  private actions: ShortcutAction[] = [];
  private stashScroll = false;
  private logKeys = false;
  private areaTracker: WidgetAreaTracker;
  private clipboard: HostClipboard;
  private clickerProcess: any = null;
  private isCtrlPressed = false;
  private isGameWindowActive = false;
  private gameBounds: { x: number; y: number; width: number; height: number } | null = null;

  static async create(
    logger: Logger,
    overlay: OverlayWindow,
    poeWindow: GameWindow,
    gameConfig: GameConfig,
    server: ServerEvents,
  ) {
    const ocrWorker = await OcrWorker.create();
    const shortcuts = new Shortcuts(
      logger,
      overlay,
      poeWindow,
      gameConfig,
      server,
      ocrWorker,
    );
    return shortcuts;
  }

  private constructor(
    private logger: Logger,
    private overlay: OverlayWindow,
    private poeWindow: GameWindow,
    private gameConfig: GameConfig,
    private server: ServerEvents,
    private ocrWorker: OcrWorker,
  ) {
    this.areaTracker = new WidgetAreaTracker(server, overlay);
    this.clipboard = new HostClipboard(logger);

    const updateActiveState = () => {
      const isFocused = this.isGameWindowActive || this.poeWindow.isActive || (process.argv.includes("--standalone") && this.overlay.window?.isFocused());
      if (this.clickerProcess && this.clickerProcess.stdin.writable) {
        this.clickerProcess.stdin.write(isFocused ? "active 1\n" : "active 0\n");
      }
    };

    if (process.platform === "win32") {
      const clickerPath = path.join(__dirname, "clicker.exe");
      try {
        this.clickerProcess = child_process.spawn(clickerPath, [], { stdio: ["pipe", "pipe", "ignore"] });
        
        this.clickerProcess.stdout.on("data", (data: Buffer) => {
          const lines = data.toString().split("\n");
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("focus 1")) {
              this.isGameWindowActive = true;
              
              const parts = trimmed.split(" ");
              if (parts.length >= 6) {
                const x = parseInt(parts[2], 10);
                const y = parseInt(parts[3], 10);
                const width = parseInt(parts[4], 10);
                const height = parseInt(parts[5], 10);
                this.gameBounds = { x, y, width, height };
              }

              if (process.argv.includes("--standalone")) {
                this.register();
              }
              updateActiveState();
            } else if (trimmed === "focus 0") {
              this.isGameWindowActive = false;
              if (process.argv.includes("--standalone") && !this.overlay.window?.isFocused()) {
                this.unregister();
              }
              updateActiveState();
            }
          }
        });

        setTimeout(() => {
          updateActiveState();
        }, 100);

        app.on("will-quit", () => {
          if (this.clickerProcess) {
            this.clickerProcess.stdin.write("exit\n");
            this.clickerProcess.kill();
          }
        });
      } catch (err) {
        this.logger.write(`error [Clicker] Failed to start clicker process: ${err}`);
      }
    }

    // Clipboard watcher for standalone auto-paste
    let lastClipboardText = "";
    setInterval(() => {
      try {
        const text = clipboard.readText();
        const trimmed = text.trim();
        if (trimmed && trimmed !== lastClipboardText) {
          lastClipboardText = trimmed;
          if (trimmed.startsWith("Item Class:") || trimmed.startsWith("Rarity:")) {
            this.server.sendEventTo("broadcast", {
              name: "MAIN->CLIENT::item-text",
              payload: {
                target: "price-check",
                clipboard: trimmed,
                position: { x: 0, y: 0 },
                focusOverlay: false,
              },
            });
            if (process.argv.includes("--standalone")) {
              this.overlay.showWindow();
            }
          }
        }
      } catch (err) {
        // ignore
      }
    }, 500);

    this.poeWindow.on("active-change", (isActive) => {
      process.nextTick(() => {
        if (isActive === this.poeWindow.isActive) {
          if (isActive) {
            this.register();
          } else {
            this.unregister();
          }
          updateActiveState();
        }
      });
    });

    if (process.argv.includes("--standalone") && this.overlay.window) {
      this.overlay.window.on("focus", () => {
        this.register();
        updateActiveState();
      });
      this.overlay.window.on("blur", () => {
        this.unregister();
        updateActiveState();
      });

      if (this.overlay.window.isFocused()) {
        this.register();
      }
    }

    this.server.onEventAnyClient("CLIENT->MAIN::user-action", (e) => {
      if (e.action === "stash-search") {
        stashSearch(e.text, this.clipboard, this.overlay);
      }
    });

    this.poeWindow.on("focus-overlay", () => {
      if (this.clickerProcess && this.clickerProcess.stdin.writable) {
        this.clickerProcess.stdin.write("focus-overlay\n");
      }
    });

    uIOhook.on("keydown", (e) => {
      if (e.ctrlKey) {
        this.isCtrlPressed = true;
      }
      const name = UiohookToName[e.keycode];
      if (name === "Ctrl" || name === "CtrlRight") {
        this.isCtrlPressed = true;
      }

      const isCtrlC = e.ctrlKey && !e.altKey && !e.shiftKey && UiohookToName[e.keycode] === "C";
      if (isCtrlC) {
        setTimeout(() => {
          try {
            const text = clipboard.readText();
            const trimmed = text.trim();
            if (trimmed && (trimmed.startsWith("Item Class:") || trimmed.startsWith("Rarity:"))) {
              lastClipboardText = trimmed;
              this.server.sendEventTo("broadcast", {
                name: "MAIN->CLIENT::item-text",
                payload: {
                  target: "price-check",
                  clipboard: trimmed,
                  position: { x: 0, y: 0 },
                  focusOverlay: false,
                },
              });
              if (process.argv.includes("--standalone")) {
                this.overlay.showWindow();
              }
            }
          } catch (err) {
            // ignore
          }
        }, 150);
      }

      if (!this.logKeys) return;
      const pressed = eventToString(e);
      this.logger.write(`debug [Shortcuts] Keydown ${pressed}`);
    });
    uIOhook.on("keyup", (e) => {
      const name = UiohookToName[e.keycode];
      if (name === "Ctrl" || name === "CtrlRight") {
        this.isCtrlPressed = false;
      }
      if (!e.ctrlKey) {
        this.isCtrlPressed = false;
      }

      if (!this.logKeys) return;
      this.logger.write(
        `debug [Shortcuts] Keyup ${
          UiohookToName[e.keycode] || "not_supported_key"
        }`,
      );
    });

    uIOhook.on("wheel", (e) => {
      const isActive = this.isGameWindowActive || this.poeWindow.isActive || (process.argv.includes("--standalone") && this.overlay.window?.isFocused());
      if (!this.isCtrlPressed || !isActive) return;

      if (isMouseOverStash(e, this)) return;

      if (e.rotation > 0) {
        uIOhook.keyTap(UiohookKey.ArrowRight);
      } else if (e.rotation < 0) {
        uIOhook.keyTap(UiohookKey.ArrowLeft);
      }
    });
  }

  updateActions(
    actions: ShortcutAction[],
    stashScroll: boolean,
    logKeys: boolean,
    restoreClipboard: boolean,
    language: string,
  ) {
    this.stashScroll = stashScroll;
    this.logKeys = logKeys;
    this.clipboard.updateOptions(restoreClipboard);
    this.ocrWorker.updateOptions(language);

    const copyItemShortcut = mergeTwoHotkeys(
      "Ctrl + C",
      this.gameConfig.showModsKey,
    );
    if (copyItemShortcut !== "Ctrl + C") {
      actions.push({
        shortcut: copyItemShortcut,
        action: { type: "test-only" },
      });
    }

    const allShortcuts = new Set([
      "Ctrl + C",
      "Ctrl + V",
      "Ctrl + A",
      "Ctrl + F",
      "Ctrl + Enter",
      "Home",
      "Delete",
      "Enter",
      "ArrowUp",
      "ArrowRight",
      "ArrowLeft",
      copyItemShortcut,
    ]);

    for (const action of actions) {
      if (
        allShortcuts.has(action.shortcut) &&
        action.action.type !== "test-only"
      ) {
        this.logger.write(
          `error [Shortcuts] Hotkey "${action.shortcut}" reserved by the game will not be registered.`,
        );
      }
    }
    actions = actions.filter((action) => !allShortcuts.has(action.shortcut));

    const duplicates = new Set<string>();
    for (const action of actions) {
      if (allShortcuts.has(action.shortcut)) {
        this.logger.write(
          `error [Shortcuts] It is not possible to use the same hotkey "${action.shortcut}" for multiple actions.`,
        );
        duplicates.add(action.shortcut);
      } else {
        allShortcuts.add(action.shortcut);
      }
    }
    this.actions = actions.filter(
      (action) =>
        !duplicates.has(action.shortcut) ||
        action.action.type === "toggle-overlay",
    );
  }

  private register() {
    this.logger.write("info [Shortcuts] Registering hotkeys");
    if (!globalShortcut.isRegistered("F5")) {
      globalShortcut.register("F5", () => {
        this.logger.write("info [Shortcuts] F5 pressed, executing /hideout macro");
        typeInChat("/hideout", true, this.clipboard);
      });
    }

    for (const entry of this.actions) {
      if (entry.shortcut === "F5") continue;
      const isOk = globalShortcut.register(
        shortcutToElectron(entry.shortcut),
        () => {
          if (this.logKeys) {
            this.logger.write(
              `debug [Shortcuts] Action type: ${entry.action.type}`,
            );
          }

          if (entry.keepModKeys) {
            const nonModKey = entry.shortcut
              .split(" + ")
              .filter((key) => !isModKey(key))[0];
            uIOhook.keyToggle(UiohookKey[nonModKey as UiohookKeyT], "up");
          } else {
            entry.shortcut
              .split(" + ")
              .reverse()
              .forEach((key) => {
                uIOhook.keyToggle(UiohookKey[key as UiohookKeyT], "up");
              });
          }

          if (entry.action.type === "toggle-overlay") {
            this.areaTracker.removeListeners();
            this.overlay.toggleActiveState();
          } else if (entry.action.type === "paste-in-chat") {
            typeInChat(entry.action.text, entry.action.send, this.clipboard);
          } else if (entry.action.type === "trigger-event") {
            this.server.sendEventTo("broadcast", {
              name: "MAIN->CLIENT::widget-action",
              payload: { target: entry.action.target },
            });
          } else if (entry.action.type === "stash-search") {
            stashSearch(entry.action.text, this.clipboard, this.overlay);
          } else if (entry.action.type === "copy-item") {
            const { action } = entry;

            const pressPosition = screen.getCursorScreenPoint();

            this.clipboard
              .readItemText()
              .then((clipboard) => {
                this.areaTracker.removeListeners();
                this.server.sendEventTo("last-active", {
                  name: "MAIN->CLIENT::item-text",
                  payload: {
                    target: action.target,
                    clipboard,
                    position: pressPosition,
                    focusOverlay: Boolean(action.focusOverlay),
                  },
                });
                if (process.argv.includes("--standalone")) {
                  if (action.target === "price-check") {
                    this.overlay.showWindow();
                  }
                } else if (action.focusOverlay && this.overlay.wasUsedRecently) {
                  this.overlay.assertOverlayActive();
                }
              })
              .catch(() => {});

            pressKeysToCopyItemText(
              entry.keepModKeys
                ? entry.shortcut.split(" + ").filter((key) => isModKey(key))
                : undefined,
              this.gameConfig.showModsKey,
            );
          } else if (
            entry.action.type === "ocr-text" &&
            entry.action.target === "heist-gems"
          ) {
            if (process.platform !== "win32") return;

            const { action } = entry;
            const pressTime = Date.now();
            const imageData = this.poeWindow.screenshot();
            this.ocrWorker
              .findHeistGems({
                width: this.poeWindow.bounds.width,
                height: this.poeWindow.bounds.height,
                data: imageData,
              })
              .then((result) => {
                this.server.sendEventTo("last-active", {
                  name: "MAIN->CLIENT::ocr-text",
                  payload: {
                    target: action.target,
                    pressTime,
                    ocrTime: result.elapsed,
                    paragraphs: result.recognized.map((p) => p.text),
                  },
                });
              })
              .catch(() => {});
          }
        },
      );

      if (!isOk) {
        this.logger.write(
          `error [Shortcuts] Failed to register a shortcut "${entry.shortcut}". It is already registered by another application.`,
        );
      }

      if (entry.action.type === "test-only") {
        globalShortcut.unregister(shortcutToElectron(entry.shortcut));
      }
    }
  }

  getGameBounds() {
    if (this.gameBounds) return this.gameBounds;
    if (this.poeWindow.bounds) {
      return {
        x: this.poeWindow.bounds.x,
        y: this.poeWindow.bounds.y,
        width: this.poeWindow.bounds.width,
        height: this.poeWindow.bounds.height,
      };
    }
    return null;
  }

  private unregister() {
    this.logger.write("info [Shortcuts] Unregistering hotkeys");
    globalShortcut.unregisterAll();
  }
}

function pressKeysToCopyItemText(
  pressedModKeys: string[] = [],
  showModsKey: string,
) {
  let keys = mergeTwoHotkeys("Ctrl + C", showModsKey).split(" + ");
  keys = keys.filter((key) => key !== "C");
  if (process.platform !== "darwin") {
    // On non-Mac platforms, don't toggle keys that are already being pressed.
    //
    // For unknown reasons, we need to toggle pressed keys on Mac for advanced
    // mod descriptions to be copied. You can test this by setting the shortcut
    // to "Alt + any letter". They'll work with this line, but not if it's
    // commented out.
    keys = keys.filter((key) => !pressedModKeys.includes(key));
  }

  for (const key of keys) {
    uIOhook.keyToggle(UiohookKey[key as UiohookKeyT], "down");
  }

  // finally press `C` to copy text
  uIOhook.keyTap(UiohookKey.C);

  // Timeout to enforce release of keys
  // Game was dropping the release inputs for some reason
  setTimeout(() => {
    keys.reverse();
    for (const key of keys) {
      uIOhook.keyToggle(UiohookKey[key as UiohookKeyT], "up");
    }
  }, 10);
}

function isMouseOverStash(mouse: UiohookWheelEvent, shortcuts: Shortcuts): boolean {
  const bounds = shortcuts.getGameBounds();
  if (!bounds) return false;

  const sidebarWidth = Math.round(bounds.height * (370 / 600));
  return (
    mouse.x >= bounds.x &&
    mouse.x <= bounds.x + sidebarWidth &&
    mouse.y >= bounds.y &&
    mouse.y <= bounds.y + bounds.height
  );
}

function eventToString(e: {
  keycode: number;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
}) {
  const { ctrlKey, shiftKey, altKey } = e;

  let code = UiohookToName[e.keycode];
  if (!code) return "not_supported_key";

  if (code === "Shift" || code === "Alt" || code === "Ctrl") return code;

  if (ctrlKey && shiftKey && altKey) code = `Ctrl + Shift + Alt + ${code}`;
  else if (shiftKey && altKey) code = `Shift + Alt + ${code}`;
  else if (ctrlKey && shiftKey) code = `Ctrl + Shift + ${code}`;
  else if (ctrlKey && altKey) code = `Ctrl + Alt + ${code}`;
  else if (altKey) code = `Alt + ${code}`;
  else if (ctrlKey) code = `Ctrl + ${code}`;
  else if (shiftKey) code = `Shift + ${code}`;

  return code;
}

function shortcutToElectron(shortcut: string) {
  return shortcut
    .split(" + ")
    .map((k) => KeyToElectron[k as keyof typeof KeyToElectron])
    .join("+");
}
