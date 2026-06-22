# Poe2 Price Checker v1.0.6

This release introduces fixes for custom item icon routing and improves developer settings persistence.

### 🐛 Bug Fixes
- **Custom Icons & Image Resolver Fix:** Fixed a development vs. production routing issue that prevented cached unique item icons (such as "The Taming") from loading correctly inside the unidentified unique selection panel.

### 🛠️ Developer Improvements
- **Dev Configuration Persistence:** Separated development settings into a dedicated `config-dev.json` file with fallback loading. This ensures keybinds and settings persist across restarts during development without polluting production configuration files.
