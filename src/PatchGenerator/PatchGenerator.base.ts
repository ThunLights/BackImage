import stylis from "stylis";
import { Uri } from "vscode";

import { utils } from "../utils/index";

export class AbsPatchGenerator<T extends { images: string[] }> {
    constructor(protected config: T) {}

    protected normalizeImageUrls(images: string[]) {
        return images.map(imageUrl => {
            if (!imageUrl.startsWith("file://")) {
                return imageUrl;
            }

            const url = imageUrl.replace("file://", "vscode-file://vscode-app");
            return Uri.parse(url).toString();
        });
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
        if (!this.config?.images.length) {
            return "";
        }

        const style = this.compileCSS(this.getStyle());
        const script = this.getScript().trim();

        return [
            `
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
