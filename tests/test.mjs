import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  locale: 'en',
  fallbackFormat: true,
  messages: { en: {} }
});

const t = i18n.global.t;

try {
  console.log("TEST1:", t("Allies in your Presence have 17(17-20)% increased Cast Speed"));
} catch(e) {
  console.log("ERR1:", e.message);
}

try {
  console.log("TEST2:", t("Allies in your Presence have 17% increased Cast Speed"));
} catch(e) {
  console.log("ERR2:", e.message);
}

try {
  console.log("TEST4:", t("{0}({1}-{2})% increased Cast Speed"));
} catch(e) {
  console.log("ERR4:", e.message);
}

try {
  console.log("TEST6:", t('{ Suffix Modifier "of Sortilege" (Tier: 1) — Caster, Speed }'));
} catch(e) {
  console.log("ERR6:", e.message);
}

try {
  console.log("TEST8:", t('{"foo":""}'));
} catch(e) {
  console.log("ERR8:", e.message);
}

try {
  console.log("TEST9:", t('{"foo":"(1)"}'));
} catch(e) {
  console.log("ERR9:", e.message);
}
