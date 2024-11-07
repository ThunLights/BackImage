import { ExtensionContext } from "vscode";
import { ElementEditor } from "./ElementEditor.base";
import { z } from "zod";
import { recordChecker } from "../utils/struct";

export class RandomEditor extends ElementEditor {
    public static readonly _key = "elementsRandom";

    constructor(_context: ExtensionContext) {
        super(_context);
    }

    public get data() {
        const content = this._context.globalState.get<Record<string, boolean>>(RandomEditor._key);
        return recordChecker(content, z.record(z.string(), z.boolean())) ?? {};
    }

    public async update(id: string, content?: boolean) {
        let elements = this.data;
        if (content) {
            elements[id] = content;
        } else {
            delete elements[id];
        }
        await this._context.globalState.update(RandomEditor._key, elements);
        return this.data;
    }
}
