import fs from "fs";
import path from "path";
import { IMG_FILE_EXTENSIONS } from "./constants";
import { filename2ext } from "./file";

export async function path2File(fPath: string) {
    if (fs.existsSync(fPath) && fs.statSync(fPath).isFile()) {
        return fPath;
    }
    return null;
}

export async function path2Files(fPath: string) {
    if (fs.existsSync(fPath) && fs.statSync(fPath).isDirectory()) {
        const images: string[] = [];
        const files = await fs.promises.readdir(fPath);
        for (const file of files) {
            const filePath = path.join(fPath, file);
            const fExt = filename2ext(file);
            if (fExt && fs.statSync(filePath).isFile() && IMG_FILE_EXTENSIONS.includes(fExt)) {
                images.push(filePath);
            }
        }
        return images;
    }
    return null;
}
