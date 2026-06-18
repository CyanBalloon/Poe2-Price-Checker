# Poe2 Price Checker v1.0.4

This release brings massive codebase cleanups and stability fixes for the new standalone architecture.

### 🚀 Improvements
- **Under The Hood Cleanups:** Completely removed thousands of lines of legacy transparent overlay code that was bloating the application. The app is now strictly a standalone desktop client.
- **Improved Start Reliability:** Fixed a race condition where the Electron backend could attempt to boot faster than the frontend UI server, resulting in an `ERR_CONNECTION_REFUSED` blank white screen.

### 🐛 Bug Fixes
- **Config Migration Crash:** Fixed a critical bug where users migrating from very old configurations would experience a hard crash (and a blank screen) because the app tried to migrate widgets that no longer exist (e.g. `image-strip`, `delve-grid`).
