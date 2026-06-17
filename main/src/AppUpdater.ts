import { app, shell } from "electron";
import { autoUpdater } from "electron-updater";
import type { ServerEvents } from "./server";
import type { UpdateInfo } from "../../ipc/types";

export class AppUpdater {
  private _checkedAtStartup = false;
  private _info: UpdateInfo = { state: "initial" };

  public noAutoUpdatesReason: Extract<
    UpdateInfo,
    { state: "update-available" }
  >["noDownloadReason"] = null;

  get info() {
    return this._info;
  }

  set info(info: UpdateInfo) {
    this._info = info;
    this.server.sendEventTo("broadcast", {
      name: "MAIN->CLIENT::updater-state",
      payload: info,
    });
  }

  constructor(private server: ServerEvents) {
    setInterval(this.check, 16 * 60 * 60 * 1000);

    this.server.onEventAnyClient("CLIENT->MAIN::user-action", ({ action }) => {
      if (action === "check-for-update") {
        this.check();
      } else if (action === "update-and-restart") {
        autoUpdater.quitAndInstall(false);
      }
    });

    // https://www.electron.build/configuration/nsis.html#portable
    autoUpdater.autoDownload = !process.env.PORTABLE_EXECUTABLE_DIR;

    if (!autoUpdater.autoDownload || process.platform === "darwin") {
      this.noAutoUpdatesReason = "not-supported";
    } else if (process.argv.includes("--no-updates")) {
      autoUpdater.autoDownload = false;
      this.noAutoUpdatesReason = "disabled-by-flag";
    }

    autoUpdater.on("checking-for-update", () => {
      this.info = { state: "checking-for-update" };
    });
    autoUpdater.on("update-available", (info: { version: string }) => {
      this.info = {
        state: "update-available",
        version: info.version,
        noDownloadReason: this.noAutoUpdatesReason,
      };
      if (process.env.PORTABLE_EXECUTABLE_DIR) {
        shell.openExternal("https://github.com/CyanBalloon/Modern-Exiled-Exchange-2/releases");
      }
    });
    autoUpdater.on("update-not-available", () => {
      this.info = { state: "update-not-available", checkedAt: Date.now() };
    });
    autoUpdater.on("error", () => {
      this.info = { state: "error", checkedAt: Date.now() };
    });
    autoUpdater.on("update-downloaded", (info: { version: string }) => {
      this.info = { state: "update-downloaded", version: info.version };
    });
    // on('download-progress') https://github.com/electron-userland/electron-builder/issues/2521
  }

  updateSettings(enableAutoUpdater: boolean) {
    if (enableAutoUpdater) {
      autoUpdater.autoDownload = !process.env.PORTABLE_EXECUTABLE_DIR;
      if (autoUpdater.autoDownload) {
        this.noAutoUpdatesReason = null;
      } else {
        this.noAutoUpdatesReason = "not-supported";
      }
    } else {
      autoUpdater.autoDownload = false;
      this.noAutoUpdatesReason = "disabled-by-flag";
    }

    if (process.argv.includes("--no-updates")) {
      autoUpdater.autoDownload = false;
      this.noAutoUpdatesReason = "disabled-by-flag";
    }
  }

  checkAtStartup() {
    if (this.noAutoUpdatesReason === "disabled-by-flag") {
      return;
    }
    if (!this._checkedAtStartup) {
      this._checkedAtStartup = true;
      this.check();
    }
  }

  private check = async () => {
    if (!app.isPackaged) {
      this.info = { state: "checking-for-update" };
      setTimeout(() => {
        this.info = { state: "update-not-available", checkedAt: Date.now() };
      }, 1000);
      return;
    }

    try {
      await autoUpdater.checkForUpdates();
    } catch {
      // handled by event
    }
  };
}
