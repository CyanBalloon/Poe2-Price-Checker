import path from "path";
import { BrowserWindow, dialog, shell, Menu, app, screen } from "electron";
import fs from "fs";
import {
  OverlayController,
} from "electron-overlay-window";
import type { ServerEvents } from "../server";
import type { Logger } from "../RemoteLogger";
import type { GameWindow } from "./GameWindow";

export class OverlayWindow {
  public isInteractable = false;
  public wasUsedRecently = true;
  public window?: BrowserWindow;
  private overlayKey: string = "Shift + Space";
  private isOverlayKeyUsed = false;

  constructor(
    private server: ServerEvents,
    private logger: Logger,
    private poeWindow: GameWindow,
  ) {
    this.server.onEventAnyClient(
      "OVERLAY->MAIN::focus-game",
      this.assertGameActive,
    );
    this.poeWindow.on("active-change", this.handlePoeWindowActiveChange);
    this.poeWindow.onAttach(this.handleOverlayAttached);

    this.server.onEventAnyClient("CLIENT->MAIN::used-recently", (e) => {
      this.wasUsedRecently = e.isOverlay;
    });

    const isStandalone = true;

    const windowState = {
      width: 1280,
      height: 800,
      x: undefined as number | undefined,
      y: undefined as number | undefined,
    };

    const statePath = path.join(
      app.getPath("userData"),
      "apt-data",
      "standalone-window-state.json",
    );

    if (isStandalone) {
      try {
        const data = fs.readFileSync(statePath, "utf8");
        const parsed = JSON.parse(data);
        if (typeof parsed.width === "number" && typeof parsed.height === "number") {
          windowState.width = parsed.width;
          windowState.height = parsed.height;
        }
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          const displays = screen.getAllDisplays();
          const isVisible = displays.some((display) => {
            const bounds = display.bounds;
            return (
              parsed.x >= bounds.x &&
              parsed.x < bounds.x + bounds.width &&
              parsed.y >= bounds.y &&
              parsed.y < bounds.y + bounds.height
            );
          });
          if (isVisible) {
            windowState.x = parsed.x;
            windowState.y = parsed.y;
          }
        }
      } catch {}
    }

    this.window = new BrowserWindow({
      icon: path.join(__dirname, process.env.STATIC!, "icon.png"),
      width: isStandalone ? windowState.width : 800,
      height: isStandalone ? windowState.height : 600,
      x: isStandalone ? windowState.x : undefined,
      y: isStandalone ? windowState.y : undefined,
      frame: isStandalone,
      title: "Poe2 Price Checker",
      show: true,
      webPreferences: {
        allowRunningInsecureContent: false,
        webviewTag: true,
        spellcheck: false,
      },
    });

    if (isStandalone) {
      let isQuitting = false;
      app.on("before-quit", () => {
        isQuitting = true;
      });

      let saveTimeout: NodeJS.Timeout | undefined;
      const saveState = () => {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          if (!this.window) return;
          try {
            const bounds = this.window.getBounds();
            fs.writeFileSync(statePath, JSON.stringify({
              width: bounds.width,
              height: bounds.height,
              x: bounds.x,
              y: bounds.y,
            }), "utf8");
          } catch {}
        }, 500);
      };

      this.window.on("resize", saveState);
      this.window.on("move", saveState);
      this.window.on("close", (e) => {
        if (!isQuitting) {
          e.preventDefault();
          this.window!.hide();
        }
        if (saveTimeout) clearTimeout(saveTimeout);
        if (!this.window) return;
        try {
          const bounds = this.window.getBounds();
          fs.writeFileSync(statePath, JSON.stringify({
            width: bounds.width,
            height: bounds.height,
            x: bounds.x,
            y: bounds.y,
          }), "utf8");
        } catch {}
      });
    }

    this.window.setMenu(
      Menu.buildFromTemplate([
        { role: "editMenu" },
        { role: "reload" },
        { role: "toggleDevTools" },
      ]),
    );

    this.window.webContents.on("before-input-event", this.handleExtraCommands);
    this.window.webContents.on(
      "did-attach-webview",
      (_, webviewWebContents) => {
        webviewWebContents.on("before-input-event", this.handleExtraCommands);
      },
    );

    this.window.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url);
      return { action: "deny" };
    });
  }

  loadAppPage(port: number) {
    const isStandalone = true;
    const baseUrl =
      process.env.VITE_DEV_SERVER_URL || `http://localhost:${port}/index.html`;
    const url = isStandalone ? `${baseUrl}?mode=standalone` : baseUrl;

    if (!this.window) {
      shell.openExternal(url);
      return;
    }

    if (process.env.VITE_DEV_SERVER_URL) {
      this.window.loadURL(url);
      this.window.webContents.openDevTools({ mode: "detach", activate: false });
    } else {
      this.window.loadURL(url);
    }
  }

  assertOverlayActive = () => {
    if (this.window) {
      this.window.show();
      this.window.focus();
    }
  };

  assertGameActive = () => {
    OverlayController.focusTarget();
  };

  toggleActiveState = () => {
      if (this.window) {
        if (this.window.isVisible()) {
          this.window.hide();
          this.assertGameActive();
        } else {
          this.window.setAlwaysOnTop(true);
          this.window.show();
          this.window.focus();
          setTimeout(() => {
            this.window?.setAlwaysOnTop(false);
          }, 50);
        }
      }
  };

  updateOpts(overlayKey: string, windowTitle: string) {
    this.overlayKey = overlayKey;
    const isStandalone = true;
    this.poeWindow.attach(undefined, windowTitle);
  }

  showWindow() {
    if (this.window) {
      if (this.window.isMinimized()) {
        this.window.restore();
      }
      this.window.setAlwaysOnTop(true);
      this.window.show();
      this.window.focus();
      app.focus();
      setTimeout(() => {
        this.window?.setAlwaysOnTop(false);
      }, 500);

      this.poeWindow.emit("focus-overlay");
    }
  }

  private handleExtraCommands = (
    event: Electron.Event,
    input: Electron.Input,
  ) => {
    if (input.type !== "keyDown") return;

    let { code, control: ctrlKey, shift: shiftKey, alt: altKey } = input;

    if (code.startsWith("Key")) {
      code = code.slice("Key".length);
    } else if (code.startsWith("Digit")) {
      code = code.slice("Digit".length);
    }

    if (shiftKey && altKey) code = `Shift + Alt + ${code}`;
    else if (ctrlKey && shiftKey) code = `Ctrl + Shift + ${code}`;
    else if (ctrlKey && altKey) code = `Ctrl + Alt + ${code}`;
    else if (altKey) code = `Alt + ${code}`;
    else if (ctrlKey) code = `Ctrl + ${code}`;
    else if (shiftKey) code = `Shift + ${code}`;

    switch (code) {
      case "Escape":
      case "Ctrl + W": {
        break;
      }
      case this.overlayKey: {
        event.preventDefault();
        process.nextTick(this.toggleActiveState);
        break;
      }
    }
  };

  private handleOverlayAttached = (hasAccess?: boolean) => {
    if (hasAccess === false) {
      this.logger.write(
        "error [Overlay] PoE2 is running with administrator rights",
      );

      dialog.showErrorBox(
        "PoE2 window - No access",
        // ----------------------
        "Path of Exile 2 is running with administrator rights.\n" +
          "\n" +
          "You need to restart Poe2 Price Checker with administrator rights.",
      );
    } else {
      this.server.sendEventTo("broadcast", {
        name: "MAIN->OVERLAY::overlay-attached",
        payload: undefined,
      });
    }
  };

  private handlePoeWindowActiveChange = (isActive: boolean) => {
    if (isActive && this.isInteractable) {
      this.isInteractable = false;
    }
    this.server.sendEventTo("broadcast", {
      name: "MAIN->OVERLAY::focus-change",
      payload: {
        game: isActive,
        overlay: this.isInteractable,
        usingHotkey: this.isOverlayKeyUsed,
      },
    });
    this.isOverlayKeyUsed = false;
  };
}
