import { ExtensionContext } from "vscode";

import { BgTypeEditor } from "./ElementEditor.bgType";
import { BgImgEditor } from "./ElementEditor.bgImg";
import { EnableEditor } from "./ElementEditor.enable";
import { ImgListEditor } from "./ElementEditor.imgList";
import { IntervalEditor } from "./ElementEditor.interval";
import { OpacityEditor } from "./ElementEditor.opacity";
import { RandomEditor } from "./ElementEditor.random";
import { RefreshEditor } from "./ElementEditor.refresh";

export class FolderController {
    constructor(private _context: ExtensionContext) {
    }

    public get bgImg() {
        return new BgImgEditor(this._context);
    }

    public get bgType() {
        return new BgTypeEditor(this._context);
    }

    public get enable() {
        return new EnableEditor(this._context);
    }

    public get refresh() {
        return new RefreshEditor(this._context);
    }

    public get imgList() {
        return new ImgListEditor(this._context);
    }

    public get interval() {
        return new IntervalEditor(this._context);
    }

    public get opacity() {
        return new OpacityEditor(this._context);
    }

    public get random() {
        return new RandomEditor(this._context);
    }
}
