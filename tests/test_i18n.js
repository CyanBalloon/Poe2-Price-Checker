const { createI18n } = require('vue-i18n');
const i18n = createI18n({
  locale: 'en',
  messages: {
    en: {}
  }
});
const t = i18n.global.t;

try {
  console.log("Testing 1:", t("Allies in your Presence have 17(17-20)% increased Cast Speed"));
} catch (e) { console.log("Error 1:", e.message); }

try {
  console.log("Testing 2:", t("Allies in your Presence have 17% increased Cast Speed"));
} catch (e) { console.log("Error 2:", e.message); }

try {
  console.log("Testing 3:", t("Adds 12 to 20 Fire Damage"));
} catch (e) { console.log("Error 3:", e.message); }
