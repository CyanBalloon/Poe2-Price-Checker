import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Poe2 Price Checker",
  description: "A fast, standalone desktop trade macro and price checking tool for Path of Exile 2 (PoE 2).",
  base: "/Poe2-Price-Checker/",
  cleanUrls: true,
  themeConfig: {
    logo: '/images/jeweler.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'GitHub', link: 'https://github.com/CyanBalloon/Modern-Exiled-Exchange-2' }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/CyanBalloon/Modern-Exiled-Exchange-2' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present'
    }
  },
  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ['meta', { property: 'og:title', content: 'Poe2 Price Checker - Trade Macro for Path of Exile 2' }],
    ['meta', { property: 'og:description', content: 'Lightning-fast price checking, accurate item parsing, and live market analysis for Path of Exile 2.' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'Poe2 Price Checker - Trade Macro for Path of Exile 2' }],
    ['meta', { name: 'twitter:description', content: 'Lightning-fast price checking, accurate item parsing, and live market analysis for Path of Exile 2.' }],
    ['meta', { name: 'keywords', content: 'path of exile 2, poe 2, trade macro, price checker, awakened poe trade, poe2 trade, poe2 price check, path of exile 2 trade macro, poe2 companion' }]
  ]
})
