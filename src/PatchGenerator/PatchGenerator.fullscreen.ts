import { css } from "../utils/css";
import { AbsPatchGenerator } from "./PatchGenerator.base";

export class FullscreenPatchGeneratorConfig {
    images = [] as string[];
    opacity = 0.91;
    size = 'cover' as 'cover' | 'contain';
    position = 'center';
    interval = 0;
    random = false;
}

export class FullscreenPatchGenerator<T extends FullscreenPatchGeneratorConfig> extends AbsPatchGenerator<T> {
    protected getStyle(): string {
        return css``;
    }

    protected getScript(): string {
        return /*js*/`
        `;
    }
}