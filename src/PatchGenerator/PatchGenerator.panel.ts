import { css } from "../utils/css";
import { FullScreenPatchConfig, FullscreenPatchGenerator } from "./PatchGenerator.fullscreen";

export class PanelPatchGenerator extends FullscreenPatchGenerator<FullScreenPatchConfig> {
    protected readonly cssvariable = "--extension--backimage-panel-img";

    protected getStyle(): string {
        const { opacity } = this.curConfig;

        return css`
            .split-view-view > .part.panel::after {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                background-position: ${this.position};
                background-repeat: no-repeat;
                background-size: ${this.size};
                pointer-events: none;
                opacity: ${opacity.toString()};
                transition: 0.3s;
                background-image: var(${this.cssvariable});
            }
        `;
    }
}
