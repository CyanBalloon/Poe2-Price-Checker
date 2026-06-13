# Developing Poe2 Price Checker

This document covers how to compile, build, and debug Poe2 Price Checker from source.

## Prerequisites
- Node.js (v18+)
- Python (for data parsing scripts)
- Git

## Getting Started

1. Clone the repository.
2. Run `npm install` in both the `/main` and `/renderer` directories.

## Developer Workflow

Poe2 Price Checker is a standalone desktop application. The development pipeline consists of two separate processes:

1. **Frontend (Renderer)**:
   In the root directory, run:
   ```bash
   npm run dev:renderer
   ```
   This starts the Vite development server (usually on `http://localhost:5176`), which powers the UI and provides hot-module reloading.

2. **Backend (Main)**:
   In a second terminal, run:
   ```bash
   npm run dev:standalone
   ```
   This compiles the C++ shortcut hooks (`clicker.cs`) and launches the Electron application, pointing it directly at the running Vite server.

The application window will open automatically. Edits to `/renderer/src` will be reflected immediately in the application via HMR.

## Building for Production

The project uses `electron-builder` to package the application into a single, portable `.exe` file for Windows.

1. Ensure all changes are saved.
2. Run the provided build script as an administrator (required for `electron-builder` symlinks):
   ```bash
   build_dist.bat
   ```
   
This script will:
- Install all dependencies.
- Rebuild native modules (`npmRebuild: true`) to match the Electron V8 headers.
- Compile the frontend UI.
- Package the application into `/main/dist/Poe2 Price Checker 1.0.0.exe`.

Only the `.exe` file needs to be distributed.
