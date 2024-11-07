import { ExtensionContext } from "vscode";
import { ElementEditor } from "./ElementEditor.base";

export class EnableEditor extends ElementEditor {
    public static readonly _key = "enable";

    constructor(_context: ExtensionContext) {
        super(_context);
    }

    public get data() {
        return this._context.globalState.get<boolean>(EnableEditor._key) ?? false;
    }

    public async update(content: boolean) {
        await this._context.globalState.update(EnableEditor._key, content);
        return this.data;
    }
}
