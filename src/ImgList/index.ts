import { ExtensionContext } from "vscode";
import { z } from "zod";

import { BackgroundImgZod, ElementsOpacityZod, structChecker } from "../utils/struct";
import { formatOpacity } from "../utils/opacity";

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

export type ElementsOpacity = z.infer<typeof ElementsOpacityZod>;

export class FolderController {
    public static readonly _globalStateKey = "imageLists";
    public static readonly _backgroundStateKey = "backgroundType";
    public static readonly _backgroundImgKey = "backgroundImg";
    public static readonly _enableKey = "enable";
    public static readonly _elementsOpacityKey = "elementsOpacity";
    public static readonly _backgroundImgInitData = {
        fullscreen: null,
        panel: null,
        sideBar: null,
        editor: null,
    };
    public static readonly _elementsOpacityInitData = {
        fullscreen: 0.85,
        panel: 0.85,
        sideBar: 0.85,
        editor: 0.85,
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

    public get enable(): boolean {
        return this._context.globalState.get<boolean>(FolderController._enableKey) || false;
    }

    public get elementsOpacity() {
        const content = this._context.globalState.get<ElementsOpacity>(FolderController._elementsOpacityKey);
        return structChecker(content, ElementsOpacityZod) ?? FolderController._elementsOpacityInitData;
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

    public async updateEnable(content: boolean) {
        await this._context.globalState.update(FolderController._enableKey, content);
        return this.enable;
    }

    public async updateOpacity(id: AllBackgroundTypes, content: number) {
        const opacities = this.elementsOpacity;
        opacities[id] = formatOpacity(content);
        await this._context.globalState.update(FolderController._elementsOpacityKey, opacities);
        return this.elementsOpacity;
    }
}
