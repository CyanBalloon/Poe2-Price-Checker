# Poe2 Price Checker v1.0.1 Release Notes

This release introduces support for dual packaging targets (Setup installer and Portable versions), an upgraded settings switch toggle, and smart unique item redirection and price checking.

---

### 📥 How to Install
- **Setup Installer (`Poe2 Price Checker Setup X.X.X.exe`)**: Download and run the installer. It will automatically install to your system and handle background auto-updates.
- **Portable Version (`Poe2 Price Checker X.X.X.exe`)**: Download the standalone executable and run it directly from any folder of your choice. No installation is required.

### 📦 Dual packaging targets
We now compile and distribute both executable versions of the application:
1. **Setup Installer** (`Poe2 Price Checker Setup 1.0.1.exe`): Standard installation to Local AppData with background auto-download and update capability.
2. **Portable Version** (`Poe2 Price Checker 1.0.1.exe`): A fully self-contained portable executable.

### 🌐 Smart Portable Updater Behavior
Instead of auto-downloading and overwriting files (which can trigger file locks on Windows), the portable build has specialized updater logic:
- Background auto-downloads are disabled.
- When an update is detected, it automatically opens the project's [GitHub Releases](https://github.com/CyanBalloon/Modern-Exiled-Exchange-2/releases) page on your default web browser for you to download the new version.
- Toggling "Auto Updates" to disabled in settings will correctly prevent startup update checks.

### 📱 Android M3-Style Switch Toggle
We upgraded the settings auto-updates checkbox to a modern **Material Design 3 style toggle switch**:
- It features an expandable knob/thumb that transitions from `h-4 w-4` when unchecked to `h-6 w-6` when checked.
- A micro checkmark icon transitions into view within the knob when enabled.
- Center-aligned layout with modern transition effects and a violet glow effect.

### 🔍 Unique Item Redirect & Exact Price Checking
- **Redirection**: Copying (`Ctrl + D` or pasting) a unique item from the game automatically redirects focus to the **Item Search** tab, showing the item immediately.
- **Ninja Prices**: The estimated `poe.ninja` price is displayed directly on the selected unique item card.
- **Exact Mods Price Checking**: Added a `"Check Rolls"` button on unique item cards to perform a detailed trade search. It preserves the exact modifier values/rolls copied from the game and switches you back to the **Price Check** panel.
