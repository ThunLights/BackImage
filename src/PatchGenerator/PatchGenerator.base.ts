import stylis from "stylis";
import { Uri } from "vscode";

import { utils } from "../utils/index";

export class AbsPatchGenerator<T> {
    constructor(protected config: T) {}

    protected normalizeImageUrls<T extends Array<string> | string>(images: T ): T {
        if (Array.isArray(images)) {
            return images.map(imageUrl => {
                if (!imageUrl.startsWith("file://")) {
                    return imageUrl;
                }
    
                const url = imageUrl.replace("file://", "vscode-file://vscode-app");
                return Uri.parse(url).toString();
            }) as T;
        }

        if (!images.startsWith("file://")) {
            return images;
        }
        const url = images.replace("file://", "vscode-file://vscode-app");
        return Uri.parse(url).toString() as T;
    }

    protected compileCSS(source: string) {
        return stylis.serialize(stylis.compile(source), stylis.stringify);
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
                var style = document.createElement("style");
                style.textContent = ${JSON.stringify(style)};
                document.head.appendChild(style);
            `,
            script
        ]
            .map(n => utils.withIIFE(n))
            .join(';');
    }
}
