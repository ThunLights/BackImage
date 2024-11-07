import { ExtensionContext } from "vscode";
import { AllBackgroundTypes, ElementEditor, ElementsOpacity } from "./ElementEditor.base";
import { ElementsOpacityZod, structChecker } from "../utils/struct";
import { formatOpacity } from "../utils/opacity";

export class OpacityEditor extends ElementEditor {
    public static readonly _key = "elementsOpacity";
    public static readonly _initData = {
        fullscreen: 0.85,
        editor: 0.85,
        panel: 0.2,
        sideBar: 0.2,
    };

    constructor(_context: ExtensionContext) {
        super(_context);
    }

    public get data() {
        const content = this._context.globalState.get<ElementsOpacity>(OpacityEditor._key);
        return structChecker(content, ElementsOpacityZod) ?? OpacityEditor._initData;
    }

    public async update(id: AllBackgroundTypes, content: number) {
        const opacities = this.data;
        opacities[id] = formatOpacity(content);
        await this._context.globalState.update(OpacityEditor._key, opacities);
        return this.data;
    }
}
