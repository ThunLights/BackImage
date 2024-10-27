import fs from "fs";
import path from "path";

export const version: string = JSON.parse(fs.readFileSync(path.join(__dirname, "../../package.json"), "utf-8")).version;
