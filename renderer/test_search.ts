import { searchNinjaItems } from "./src/web/background/Prices";

console.log("Searching for Uhtred in local memory...");
const results = searchNinjaItems("Uhtred");
console.log(results);
