# Poe2 Price Checker v1.0.3 Release Notes

This release fixes a critical startup crash and resolves a complex modifier lookup issue with Jewel modifiers on the trade API.

---

### 📥 How to Install
- **Setup Installer (`Poe2 Price Checker Setup X.X.X.exe`)**: Download and run the installer. It will automatically install to your system and handle background auto-updates.
- **Portable Version (`Poe2 Price Checker X.X.X.exe`)**: Download the standalone executable and run it directly from any folder of your choice. No installation is required.

### 🐛 Bug Fixes
- **Startup Crash Fixed**: Resolved an issue that caused the application to load a blank white screen upon startup due to a syntax error.
- **Jewel Modifier Detection**: Fixed a critical issue where certain mods on jewels (such as `"Recover #% of maximum Mana on Kill"`) were incorrectly falling back to their "crafted" variants during parsing. This caused the app to search for non-existent explicit trade IDs, breaking the search. The app will now correctly identify these stats and append the `(Jewel)` modifier to ensure accurate price checking on the trade site.
