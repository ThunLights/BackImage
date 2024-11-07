import { ExtensionContext } from "vscode";
import { BackgroundImgZod, ElementsOpacityZod } from "../utils/struct";
import { z } from "zod";

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

export abstract class ElementEditor {
    public static readonly _key: string;

    constructor(protected _context: ExtensionContext) {
    }
}
