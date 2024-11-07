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
    protected readonly cssvariable = "--extension-backimage-fullscreen-img";

    protected get curConfig(): T {
        if (typeof this.config.content === "string") {
            this.config.content = this.normalizeImageUrls(this.config.content);
        } else {
            this.config.content.images = this.normalizeImageUrls(this.config.content.images);
        }
        return this.config;
    }

    protected getStyle(): string {
        const { opacity } = this.curConfig;
        return css`
            body {
                background-size: cover;
                background-repeat: no-repeat;
                background-attachment: fixed;
                background-position: center;
                opacity: ${opacity.toString()};
                transition: 0.3s;
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
                    setInterval(setNextImg, interval * 1000);
                }

                setNextImg();
            `;
        }
    }
}
