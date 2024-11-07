import { css } from "../utils/css";
import { AbsPatchGenerator } from "./PatchGenerator.base";

export type EditorPatchConfig = {
    useFront: boolean
    style: Record<string, string>
    styles: Array<Record<string, string>>
    opacity: number
    content: {
        images: string[]
        random: boolean
        interval: number
    } | string
};

export class EditorPatchGenerator<T extends EditorPatchConfig> extends AbsPatchGenerator<T> {
    protected readonly cssvariable = "--extension-backimage-editor-img";

    protected get curConfig(): T {
        if (typeof this.config.content === "string") {
            this.config.content = this.normalizeImageUrls(this.config.content);
        } else {
            this.config.content.images = this.normalizeImageUrls(this.config.content.images);
        }
        return this.config;
    }

    private getStyleByOptions(style: Record<string, string>, useFront: boolean): string {
        const excludeKeys = useFront ? [] : ["pointer-events", "z-index"];

        return Object.entries(style)
            .filter(([key]) => !excludeKeys.includes(key))
            .map(([key, value]) => `${key}: ${value};`)
            .join("");
    }

    protected getStyle(): string {
        const { content, useFront, style, styles, opacity } = this.curConfig;
        const defStyle = this.getStyleByOptions(style, useFront);
        const frontContent = useFront ? "after" : "before";
        const images = typeof content === "string" ? [ content ] : content.images;
        return css`
            [id='workbench.parts.editor'] .split-view-view {
                .editor-container .overflow-guard > .monaco-scrollable-element > .monaco-editor-background {
                    background: none;
                }
                ${images.map((_img, index) => {
                    const styleContent = defStyle + this.getStyleByOptions(styles[index] || {}, useFront);
                    const nthChild = `${images.length}n + ${index + 1}`;

                    return css`
                        /* code editor */
                        &:nth-child(${nthChild}) .editor-instance>.monaco-editor .overflow-guard > .monaco-scrollable-element::${frontContent},
                        /* home screen */
                        &:nth-child(${nthChild}) .editor-group-container.empty::before {
                            opacity: ${opacity.toString()};
                            content: "";
                            width: 100%;
                            height: 100%;
                            position: absolute;
                            z-index: ${useFront ? 99 : "initial"};
                            pointer-events: ${useFront ? "none" : "initial"};
                            transition: 0.3s;
                            background-image: var(${this.cssvariable + (index % images.length)});
                            background-repeat: no-repeat;
                            ${styleContent}
                        }
                    `;
                })}
            }
        `;
    }

    protected getScript(): string {
        const { content } = this.curConfig;

        if (typeof content === "string") {
            return /*js*/`
                const cssvariable = "${this.cssvariable}";
                function setImg() {
                    document.body.style.setProperty(cssvariable, "url(" + "${content}" + ")");
                }
                setImg();
            `;
        } else {
            const { random, interval, images } = content;
            return /*js*/`
                const cssvariable = "${this.cssvariable}";
                const images = ${JSON.stringify(images)};
                const interval = ${interval};
                const random = ${random};
                let curIndex = -1;

                function getNextImages() {
                    if (random) {
                        return images.slice().sort(function () {
                            return Math.random() > 0.5 ? 1 : -1;
                        });
                    }

                    curIndex++;
                    curIndex = curIndex % images.length;

                    return images.map(function (_img, index) {
                        let imgIndex = curIndex + index;
                        imgIndex = imgIndex % images.length;
                        return images[imgIndex];
                    });
                }

                function setNextImages() {
                    const nextImages = getNextImages();
                    for (let i = 0; i < images.length; i++) {
                        document.body.style.setProperty(cssvariable + i, "url(" + nextImages[i] + ")");
                    }
                }

                if (interval > 0) {
                    setInterval(setNextImages, interval);
                }

                setNextImages();
            `;
        }
    }
}
