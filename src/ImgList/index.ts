import fs from "fs";
import path from "path";

import { ExtensionContext } from "vscode";

export type Folder = {
    id: string
    name: string
    description: string
    path: string
}

export class FolderController {
    public static readonly _globalStateKey = "imageLists";

    constructor(private _context: ExtensionContext) {
    }

    public get imageLists() {
        return this._context.globalState.get<Folder[]>(FolderController._globalStateKey) ?? [];
    }
    public addImgList(folder: Folder) {
        const imgList = this.imageLists;
        imgList.push(folder);
        this._context.globalState.update(FolderController._globalStateKey, imgList);
        return imgList;
    }
    public removeImgList(folder: Folder) {
        let imgList = this.imageLists;
        imgList = imgList.filter(value => value !== folder);
        this._context.globalState.update(FolderController._globalStateKey, imgList);
        return imgList;
    }
}
