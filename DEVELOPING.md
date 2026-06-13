# Developing Exiled Exchange 2

This document covers how to compile, build, and debug Exiled Exchange 2 from source.

## Prerequisites
- Node.js (v18+)
- Python (for data parsing scripts)
- Git

## Getting Started

1. Clone the repository.
2. Run `npm install` in both the `/main` and `/renderer` directories.

## Developer Workflow (Standalone Mode)

Because Exiled Exchange 2 is a standalone desktop application, the development pipeline consists of two separate processes:

1. **Frontend (Renderer)**:
   In the root directory, run:
   ```bash
   npm run dev:renderer
   ```
   This spins up the Vite development server (usually on `http://localhost:5176`) which powers the UI and features hot-module reloading.

2. **Backend (Main/Standalone)**:
   In a second terminal, run:
   ```bash
   npm run dev:standalone
   ```
   This compiles the C++ shortcut hooks (`clicker.cs`) and launches the Electron application, pointing it directly at your running Vite server.

The standalone application window will pop up immediately. You can make edits to `/renderer/src` and see them instantly reflect in the app.

## Building for Production

We use `electron-builder` to package the application into a single, portable `.exe` file for Windows.

1. Ensure all your changes are saved.
2. Run the provided build script as an administrator (required for `electron-builder` symlinks):
   ```bash
   build_dist.bat
   ```
   
This script will automatically:
- Install all dependencies.
- Rebuild native modules (`npmRebuild: true`) to match the Electron V8 headers.
- Compile the frontend UI.
- Package the application into `/main/dist/Exiled Exchange 2 1.0.0.exe`.

You only need to distribute the single `.exe` file to your testers.
