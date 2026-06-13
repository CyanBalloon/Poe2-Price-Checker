# ![Icon](./renderer/public/images/jeweler.png) Exiled Exchange 2 (Standalone Edition)

A fully standalone desktop application for **Path of Exile 2**, designed to make price checking, item parsing, and market analysis faster and cleaner than ever. 

Unlike previous tools, Exiled Exchange 2 has been surgically stripped of invasive game-overlay hooks and completely rebuilt as a pristine, independent desktop application that safely runs on your second monitor or alongside your game.

## Features

### 💻 True Standalone Desktop Window
- **No Overlays**: Runs as a normal, framable desktop window. You can drag it, resize it, and put it on your second monitor. 
- **Zero Game Hooking**: Doesn't aggressively inject transparent windows over Path of Exile, preventing game crashes and performance dips.
- **System Tray Integration**: Quietly minimizes to your system tray. Just right click and select "Show Window" to bring it back.

### 🔍 Instant Price Checking Macros
Even though the app runs standalone, it safely monitors Path of Exile's window focus in the background. 
Simply hover over an item in Path of Exile 2 and press `Ctrl + D`! The standalone window will instantly populate with the parsed item details and automatically pull live market prices.

### 🧠 Intelligent Item Parsing
- Automatically parses copied items directly from your clipboard.
- Supports advanced magic item parsing (e.g., explicitly recognizing `+3 to Level of all Projectile Skills` on Magic bows).
- Displays clear, easy-to-read modifier breakdowns.

## Installation

1. Download the latest `Exiled Exchange 2 1.0.0.exe` from the Releases page.
2. Run the `.exe` file. It's a completely self-contained portable executable.
3. The standalone window will instantly appear on your desktop.
4. Launch **Path of Exile 2** and start playing! Hover over an item and press `Ctrl+D` to price check.

## Usage & Settings
- To completely close the application, right-click the `Exiled Exchange 2` icon in your Windows System Tray and select **Quit**.
- Clicking the `X` on the window will simply hide it to the system tray for convenience.
- Settings can be accessed via the gear icon within the app's UI.

## Migrating from POE1 / Awakened PoE Trade
To migrate your old configuration files:
1. Close Exiled Exchange 2.
2. Copy the `apt-data` folder from `%APPDATA%\awakened-poe-trade` to `%APPDATA%\exiled-exchange-2`.
3. Open `config.json` inside that folder and ensure `"windowTitle": "Path of Exile 2"`.
4. Relaunch the app.
