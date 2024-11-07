import { ExtensionContext } from "vscode";
import { ElementEditor } from "./ElementEditor.base";

export class RefreshEditor extends ElementEditor {
    public static readonly _key = "refresh";

    constructor(_context: ExtensionContext) {
        super(_context);
    }

    public get data() {
        return this._context.globalState.get<boolean>(RefreshEditor._key) ?? false;
    }

    public async update(content: boolean) {
        await this._context.globalState.update(RefreshEditor._key, content);
        return this.data;
    }
}
