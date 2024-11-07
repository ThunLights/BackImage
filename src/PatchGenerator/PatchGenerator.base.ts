import { compile, serialize, stringify } from "stylis";
import { Uri } from "vscode";

import { utils } from "../utils/index";

export class AbsPatchGenerator<T> {
    constructor(protected config: T) {}

    protected normalizeImageUrls<T extends Array<string> | string>(images: T ): T {
        if (Array.isArray(images)) {
            return images.map(imageUrl => {
                if (imageUrl.startsWith("vscode-file://vscode-app/")) {
                    return imageUrl;
                }
                if (!imageUrl.startsWith("file://")) {
                    return "vscode-file://vscode-app/" + imageUrl;
                }
    
                const url = imageUrl.replace("file://", "vscode-file://vscode-app");
                return Uri.parse(url).toString();
            }).map(value => {
                return value.replaceAll("\\", `\\\\`);
            }) as T;
        }

        const image = images.replaceAll("\\", "\\\\");
        if (image.startsWith("vscode-file://vscode-app/")) {
            return image as T;
        }
        if (!images.startsWith("file://")) {
            return ("vscode-file://vscode-app/" + image) as T;
        }
        const url = image.replace("file://", "vscode-file://vscode-app");
        return Uri.parse(url).toString() as T;
    }

    protected compileCSS(source: string) {
        return serialize(compile(source), stringify);
    }

    protected getStyle() {
        return "";
    }

    protected getScript() {
        return "";
    }

    public create() {
        const style = this.compileCSS(this.getStyle());
        const script = this.getScript().trim();

        return [
            /*js*/`
                const style = document.createElement("style");
                style.textContent = ${JSON.stringify(style.replaceAll(`"`, `\"`))};
                document.head.appendChild(style);
            `,
            script
        ].map(n => utils.withIIFE(n)).join(';');
    }
}
