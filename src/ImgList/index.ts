import { ExtensionContext } from "vscode";

type fullscreenOther = "panel" | "side-bar" | "editor";

export type BackgroundType = "fullscreen" | fullscreenOther[] | null;

export type Folder = {
    id: string
    name: string
    description: string
    path: string
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

    public updateBackgroundType(content: BackgroundType) {
        this._context.globalState.update(FolderController._backgroundStateKey, content);
        return this.backgroundType;
    }
}
