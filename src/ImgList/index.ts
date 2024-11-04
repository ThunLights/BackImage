import { ExtensionContext } from "vscode";

export type fullscreenOther = "panel" | "side-bar" | "editor";

export type BackgroundType = "fullscreen" | fullscreenOther[] | null;

export type FolderType = "file" | "folder";

export type Folder = {
    id: string
    path: string
    type: FolderType
    name: string
    description: string
};

export class FolderController {
    public static readonly _globalStateKey = "imageLists";
    public static readonly _backgroundStateKey = "backgroundType";

    constructor(private _context: ExtensionContext) {
    }

    public get backgroundType() {
        return this._context.globalState.get<BackgroundType>(FolderController._backgroundStateKey) ?? null;
    }

    public get imageLists() {
        return this._context.globalState.get<Folder[]>(FolderController._globalStateKey) ?? [];
    }

    public async addImgList(folder: Folder) {
        const imgList = this.imageLists;
        imgList.push(folder);
        await this._context.globalState.update(FolderController._globalStateKey, imgList);
        return imgList;
    }

    public async updateImgList(id: string, name: string, description: string) {
        let imgList = this.imageLists;
        imgList = imgList.map(value => value.id === id ? {
            id,
            type: value.type,
            path: value.path,
            name,
            description,
        } : value);
        await this._context.globalState.update(FolderController._globalStateKey, imgList);
        return imgList;
    }

    public async removeImgList(id: string) {
        let imgList = this.imageLists;
        imgList = imgList.filter(value => value.id !== id);
        await this._context.globalState.update(FolderController._globalStateKey, imgList);
        return imgList;
    }

    public async updateBackgroundType(content: BackgroundType) {
        await this._context.globalState.update(FolderController._backgroundStateKey, content);
        return this.backgroundType;
    }
}
