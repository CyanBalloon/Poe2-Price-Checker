# Poe2 Price Checker v1.0.5

This release fixes a critical rendering bug in the Price Check overlay window for unidentified unique items.

### 🐛 Bug Fixes
- **Unidentified Unique Layout/listings Fix**: Fixed a bug where price checking unidentified unique items (e.g. Wicker Tiara or Prismatic Ring) would render suggested unique suggestions at the top, but push the actual price listings, filter checkboxes, and search CTA buttons off the bottom of the overlay screen. The layout now correctly shares vertical space, displaying both the variants resolver and the matching trade listings simultaneously.
