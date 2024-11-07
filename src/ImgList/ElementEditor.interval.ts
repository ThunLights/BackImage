import { ExtensionContext } from "vscode";
import { z } from "zod";

import { ElementEditor } from "./ElementEditor.base";
import { recordChecker } from "../utils/struct";

export class IntervalEditor extends ElementEditor {
    public static readonly _key = "elementsInterval";

    constructor(_context: ExtensionContext) {
        super(_context);
    }

    public get data() {
        const content = this._context.globalState.get<Record<string, number>>(IntervalEditor._key);
        return recordChecker(content, z.record(z.string(), z.number())) ?? {};
    }

    public async update(id: string, content?: number) {
        let elements = this.data;
        if (content) {
            elements[id] = content;
        } else {
            delete elements[id];
        }
        await this._context.globalState.update(IntervalEditor._key, elements);
        return this.data;
    }
}
