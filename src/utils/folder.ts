import fs from "fs";
import path from "path";

import { IMG_FILE_EXTENSIONS } from "./constants";
import { filename2ext } from "./file";

export async function path2File(fPath: string) {
    try {
        if (fs.existsSync(fPath) && (await fs.promises.stat(fPath)).isFile()) {
            return fPath;
        }
        return null;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function path2Files(fPath: string) {
    try {
        if (fs.existsSync(fPath) && (await fs.promises.stat(fPath)).isDirectory()) {
            const images: string[] = [];
            const files = await fs.promises.readdir(fPath);
            for (const file of files) {
                const filePath = path.join(fPath, file);
                const fExt = filename2ext(file);
                if (fExt && IMG_FILE_EXTENSIONS.includes(fExt) && (await fs.promises.stat(filePath)).isFile()) {
                    images.push(filePath);
                }
            }
            return images;
        }
        return null;
    } catch (error) {
        console.log(error);
        return null;
    }
}
