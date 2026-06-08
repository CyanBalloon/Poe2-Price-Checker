import type { ServerEvents } from "../server";
import { app } from "electron";
import fs from "fs/promises";
import path from "path";

export class CustomIconsStore {
  private filePath = path.join(
    app.getPath("userData"),
    "apt-data",
    "custom-icons.json",
  );

  constructor(private server: ServerEvents) {
    server.onEventAnyClient("CLIENT->MAIN::save-custom-icon", async (payload) => {
      await this.save(payload.refName, payload.iconUrl);
      server.sendEventTo("broadcast", {
        name: "MAIN->CLIENT::custom-icon-added",
        payload,
      });
    });
  }

  async load(): Promise<string> {
    try {
      const contents = await fs.readFile(this.filePath, "utf8");
      return contents;
    } catch {
      return "{}";
    }
  }

  private async save(refName: string, iconUrl: string) {
    let customIcons: Record<string, string> = {};
    try {
      const contents = await fs.readFile(this.filePath, "utf8");
      customIcons = JSON.parse(contents);
    } catch {}

    customIcons[refName] = iconUrl;

    try {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      await fs.writeFile(this.filePath, JSON.stringify(customIcons, null, 2), "utf8");
    } catch (e) {
      console.error("Failed to write custom-icons.json:", e);
    }

    // In development mode, search and update items.ndjson in the project workspace
    if (process.env.VITE_DEV_SERVER_URL) {
      try {
        // Find public/data directory in the project
        const projectRoot = process.cwd();
        const dataDir = path.join(projectRoot, "renderer", "public", "data");
        
        // Check if directory exists
        const dirExists = await fs.stat(dataDir).then(s => s.isDirectory()).catch(() => false);
        if (dirExists) {
          const subdirs = await fs.readdir(dataDir);
          for (const subdir of subdirs) {
            const subdirPath = path.join(dataDir, subdir);
            const isDir = await fs.stat(subdirPath).then(s => s.isDirectory()).catch(() => false);
            if (isDir) {
              const ndjsonPath = path.join(subdirPath, "items.ndjson");
              const ndjsonExists = await fs.stat(ndjsonPath).then(s => s.isFile()).catch(() => false);
              if (ndjsonExists) {
                await this.updateNdjsonFile(ndjsonPath, refName, iconUrl);
              }
            }
          }
        }
      } catch (e) {
        console.error("Failed to auto-update dev items.ndjson:", e);
      }
    }
  }

  private async updateNdjsonFile(filePath: string, refName: string, iconUrl: string) {
    try {
      const contents = await fs.readFile(filePath, "utf8");
      const lines = contents.split(/\r?\n/);
      let modified = false;

      const updatedLines = lines.map((line) => {
        if (!line.trim()) return line;
        try {
          const record = JSON.parse(line);
          if (record.refName === refName) {
            if (record.icon === "%NOT_FOUND%" || !record.icon || record.icon !== iconUrl) {
              record.icon = iconUrl;
              modified = true;
              return JSON.stringify(record);
            }
          }
        } catch {}
        return line;
      });

      if (modified) {
        await fs.writeFile(filePath, updatedLines.join("\n"), "utf8");
        console.log(`Automatically updated icon for "${refName}" in ${path.basename(filePath)}`);
      }
    } catch (e) {
      console.error(`Failed to update ${filePath}:`, e);
    }
  }
}
