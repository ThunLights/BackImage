import { ExtensionContext } from "vscode";
import z from "zod";
import { BackgroundImgZod, structChecker } from "../utils/struct";

export type StringOrNull = string | null;

export type fullscreenOther = "panel" | "side-bar" | "editor";

export type AllBackgroundTypes = "fullscreen" | "panel" | "sideBar" | "editor";

export type BackgroundType = "fullscreen" | fullscreenOther[] | null;

export type FolderType = "file" | "folder";

export type Folder = {
    id: string
    path: string
    type: FolderType
    name: string
    description: string
};

export type BackgroundImg = z.infer<typeof BackgroundImgZod>;

export class FolderController {
    public static readonly _globalStateKey = "imageLists";
    public static readonly _backgroundStateKey = "backgroundType";
    public static readonly _backgroundImgKey = "backgroundImg";
    public static readonly _backgroundImgInitData = {
        fullscreen: null,
        panel: null,
        sideBar: null,
        editor: null,
    };

    constructor(private _context: ExtensionContext) {
    }

    public get backgroundType(): BackgroundType {
        return this._context.globalState.get<BackgroundType>(FolderController._backgroundStateKey) ?? null;
    }

    public get imageLists(): Folder[] {
        return this._context.globalState.get<Folder[]>(FolderController._globalStateKey) ?? [];
    }

    public get backgroundImg(): BackgroundImg {
        const content = this._context.globalState.get<BackgroundImg>(FolderController._backgroundImgKey);
        return structChecker(content, BackgroundImgZod) ?? FolderController._backgroundImgInitData;
    }

    public async addImgList(folder: Folder) {
        const imgList = this.imageLists;
        imgList.push(folder);
        await this._context.globalState.update(FolderController._globalStateKey, imgList);
        return imgList;
    }

    public async updateImgList(id: string, name?: string, description?: string, path?: string) {
        let imgList = this.imageLists;
        imgList = imgList.map(value => value.id === id ? {
            id: value.id,
            type: value.type,
            path: path ?? value.path,
            name: name ?? value.name,
            description: description ?? value.description,
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

    public async updateBackgroundImg(id: AllBackgroundTypes, content: StringOrNull) {
        const bgImg = this.backgroundImg;
        bgImg[id] = content;
        await this._context.globalState.update(FolderController._backgroundImgKey, bgImg);
        return this.backgroundImg;
    }
}
