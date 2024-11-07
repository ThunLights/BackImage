import { css } from '../utils/css';
import { AbsPatchGenerator } from './PatchGenerator.base';

export type FullScreenPatchConfig = {
    opacity: number
    content: {
        images: string[]
        random: boolean
        interval: number
    } | string
}

export class FullscreenPatchGenerator<T extends FullScreenPatchConfig> extends AbsPatchGenerator<T> {
    protected cssvariable = "--extension-backimage-fullscreen-img";

    protected readonly size = "cover";
    protected readonly position = "center";

    protected get curConfig(): T {
        const cur = this.config;
        if (typeof cur.content === "string") {
            cur.content = this.normalizeImageUrls(cur.content);
        } else {
            cur.content.images = this.normalizeImageUrls(cur.content.images);
        }
        return cur;
    }

    protected getStyle(): string {
        const { opacity } = this.curConfig;
        return css`
            body {
                background-size: ${this.size};
                background-repeat: no-repeat;
                background-attachment: fixed;
                background-position: ${this.position};
                opacity: ${opacity.toString()};
                transition: 0.3s;
            }
            body:has([id="workbench.parts.editor"]) {
                background-image: var(${this.cssvariable});
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
                const random = ${random};
                const interval = ${interval};
                let curIndex = -1;

                function getNextImg() {
                    if (random) {
                        return images[Math.floor(Math.random() * images.length)];
                    }

                    curIndex++;
                    curIndex = curIndex % images.length;
                    return images[curIndex];
                }

                function setNextImg() {
                    document.body.style.setProperty(cssvariable, "url(" + getNextImg() + ")");
                }

                if (interval > 0) {
                    setInterval(setNextImg, interval);
                }

                setNextImg();
            `;
        }
    }
}
