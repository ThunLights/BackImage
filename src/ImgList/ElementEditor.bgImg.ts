import { ExtensionContext } from "vscode";
import { AllBackgroundTypes, BackgroundImg, ElementEditor, StringOrNull } from "./ElementEditor.base";
import { BackgroundImgZod, structChecker } from "../utils/struct";

export class BgImgEditor extends ElementEditor {
    public static readonly _key = "backgroundImg";
    public static readonly _initData = {
        fullscreen: null,
        panel: null,
        sideBar: null,
        editor: null,
    };

    constructor(_context: ExtensionContext) {
        super(_context);
    }

    public get data() {
        const content = this._context.globalState.get<BackgroundImg>(BgImgEditor._key);
        return structChecker(content, BackgroundImgZod) ?? BgImgEditor._initData;
    }

    public async update(id: AllBackgroundTypes, content: StringOrNull) {
        const bgImg = this.data;
        bgImg[id] = content;
        await this._context.globalState.update(BgImgEditor._key, bgImg);
        return this.data;
    }
}
