# Poe2 Price Checker v1.0.2 Release Notes

This release introduces UI refinements for mod elements and filter widths, text sizing improvements, and an update to the global price checking hotkey registration logic.

---

### 🎨 Beautiful Mod Elements & Visual Overhaul
We redesigned the mod elements on the price check panel:
- **Consistent Theme**: Removed the old legacy app background from mod elements when hovered. They now integrate beautifully with the application's modern visual theme.
- **Improved Readability**: Increased the font size of the mod text, making it clearer and easier to inspect at a glance.

### 📐 Maximized Stat & Category Filters
- **Default Width**: Stat and category filters now default to their maximum horizontal width on launch, optimizing screen space and making checkbox selectors immediately accessible.

### ⌨️ Custom Price Check Hotkey Only
- **Explicit hotkeys**: Removed the default global `Ctrl + C` listener behavior that watched general clipboard changes.
- **No More Accidental Triggers**: The price check window will no longer pop up when you perform a normal copy action inside the game.
- **Configured Hotkey Monitor**: Price checking will now trigger strictly and exclusively on the custom hotkey configured in **Settings -> Hotkeys** (which defaults to `Ctrl + D` or whatever custom key combination you define).
