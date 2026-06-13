import { parseClipboard } from "./src/parser";
import fs from "fs";

const text = fs.readFileSync("../../test_item.txt", "utf-8");
const parsed = parseClipboard(text);
console.log(JSON.stringify(parsed?.modifiers, null, 2));
