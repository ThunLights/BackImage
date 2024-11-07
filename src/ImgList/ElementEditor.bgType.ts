import { ExtensionContext } from "vscode";
import { BackgroundType, ElementEditor } from "./ElementEditor.base";

export class BgTypeEditor extends ElementEditor {
    public static readonly _key = "backgroundType";

    constructor(_context: ExtensionContext) {
        super(_context);
    }

    get data() {
        return this._context.globalState.get<BackgroundType>(BgTypeEditor._key) ?? null;
    }

    public async update(content: BackgroundType) {
        await this._context.globalState.update(BgTypeEditor._key, content);
        return this.data;
    }
}
