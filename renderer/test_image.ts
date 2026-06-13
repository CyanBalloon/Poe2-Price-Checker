import { getDynamicIcon } from "./src/web/background/ImageFetcher";

async function run() {
  const icon = await getDynamicIcon("Uhtred's Rite", "GEM");
  console.log("Dynamic icon:", icon);
}
run();
