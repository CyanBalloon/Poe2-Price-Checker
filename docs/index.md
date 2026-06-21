---
layout: home

hero:
  name: "Path of Exile 2 Price Checker"
  text: "The Ultimate Trade Macro"
  tagline: "A standalone, ultra-fast, and safe desktop price checking tool for Path of Exile 2."
  image:
    src: /images/jeweler.png
    alt: Path of Exile 2 Price Checker Logo
  actions:
    - theme: brand
      text: Download Installer
      link: https://github.com/CyanBalloon/Poe2-Price-Checker/releases/download/v1.0.4/Poe2-Price-Checker-Setup-1.0.4.exe
    - theme: alt
      text: View on GitHub
      link: https://github.com/CyanBalloon/Poe2-Price-Checker

features:
  - title: Instant Price Checking
    details: Hover over an item in Path of Exile 2 and press Ctrl+D. The app fetches live market prices instantly, matching exact affixes and rolls.
    icon: ⚡
  - title: Zero Lag & No Overlays
    details: This app is NOT an overlay. It operates entirely as an independent desktop window, meaning it will NEVER affect your in-game FPS. 100% compliant with ToS.
    icon: 🛡️
  - title: Intelligent Parsing
    details: Supports advanced magic item parsing, tier identification, and precise recognition of complex PoE 2 prefixes and suffixes.
    icon: 🧠
---

<script setup>
import { ref } from 'vue'
const activeImage = ref(null)
</script>

<br>

::: tip 🚀 ZERO FPS IMPACT & NO OVERLAYS
**This application is NOT an overlay.** It operates entirely as an independent desktop window, guaranteeing that it will **NEVER affect your in-game FPS** or violate Terms of Service.
:::

<div class="showcase-section">
<h2 class="showcase-title">Showcase</h2>
<p class="showcase-subtitle">Take a closer look at the key interface modes designed for optimal second-monitor usage or fast overlay toggling.</p>

<div class="showcase-grid">
<div class="showcase-card">
<div class="showcase-text">
<span class="showcase-tag">Search & Reference</span>
<h3>Base Types & Uniques Search</h3>
<p>Browse the complete compendium of Wraeclast items. Search for any base item type, inspect league-specific unique variants, check live price conversions, and easily pull up reference requirements without overlay lags.</p>
</div>
<div class="showcase-image-wrapper">
<a href="/images/search.png" @click.prevent="activeImage = '/images/search.png'" title="Click to view full size">
<img src="/images/search.png" alt="Base Types and Uniques Search Screen" class="showcase-img" />
</a>
</div>
</div>
<div class="showcase-card reverse">
<div class="showcase-text">
<span class="showcase-tag">Price Check</span>
<h3>Advanced Affixes & Live Listings</h3>
<p>Analyze live trade listings directly inside the application. View detailed mod breakdowns, adjust exact stat ranges/filters on the fly, and see immediate price statistics with absolute zero impact on your game FPS.</p>
</div>
<div class="showcase-image-wrapper">
<a href="/images/price-check.png" @click.prevent="activeImage = '/images/price-check.png'" title="Click to view full size">
<img src="/images/price-check.png" alt="Advanced Affixes and Live Listings Screen" class="showcase-img" />
</a>
</div>
</div>
</div>
</div>

<Transition name="lightbox">
  <div v-if="activeImage" class="lightbox-overlay" @click="activeImage = null">
    <img :src="activeImage" class="lightbox-img" />
  </div>
</Transition>

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);
}

.VPHero .VPImage, .VPHero img {
  border-radius: 20px;
  box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.showcase-section {
  margin-top: 64px;
  margin-bottom: 64px;
  text-align: center;
}

.showcase-title {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
  color: var(--vp-c-text-1);
}

.showcase-subtitle {
  font-size: 16px;
  color: var(--vp-c-text-2);
  max-width: 600px;
  margin: 0 auto 48px auto;
  line-height: 1.6;
  text-align: center !important;
}

.showcase-grid {
  display: flex;
  flex-direction: column;
  gap: 48px;
  max-width: 1100px;
  margin: 0 auto;
  text-align: left;
}

.showcase-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 48px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.showcase-card:hover {
  transform: translateY(-4px);
  border-color: rgba(189, 52, 254, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.showcase-card.reverse {
  flex-direction: row-reverse;
}

.showcase-text {
  flex: 1;
}

.showcase-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 4px 8px;
  border-radius: 8px;
  background: rgba(189, 52, 254, 0.1);
  color: #bd34fe;
  margin-bottom: 16px;
}

.showcase-card.reverse .showcase-tag {
  background: rgba(65, 209, 255, 0.1);
  color: #41d1ff;
}

.showcase-text h3 {
  font-size: 24px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 12px;
  color: var(--vp-c-text-1);
}

.showcase-text p {
  font-size: 15px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin: 0;
}

.showcase-image-wrapper {
  flex: 1.3;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.showcase-img {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.5s ease;
}

.showcase-card:hover .showcase-img {
  transform: scale(1.02);
}

@media (max-width: 768px) {
  .showcase-card, .showcase-card.reverse {
    flex-direction: column;
    padding: 24px;
    gap: 24px;
  }
}

.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: zoom-out;
}

.lightbox-img {
  max-width: 90%;
  max-height: 90%;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transform: scale(1);
}

.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

.lightbox-enter-active .lightbox-img {
  animation: zoom-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.lightbox-leave-active .lightbox-img {
  animation: zoom-out 0.3s ease;
}

@keyframes zoom-in {
  from {
    transform: scale(0.9);
  }
  to {
    transform: scale(1);
  }
}

@keyframes zoom-out {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(0.9);
  }
}
</style>
