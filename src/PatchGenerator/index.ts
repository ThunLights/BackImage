import { minify } from "uglify-js";
import { utils } from "../utils/index";
import { ChecksumsPatchGenerator } from "./PatchGenerator.checksums";
import { FolderController } from "../ImgList/index";
import { FullscreenPatchGenerator } from "./PatchGenerator.fullscreen";
import { path2File, path2Files } from "../utils/folder";

export class PatchGeneratorError {
    public static readonly errorContents: Record<number, string> = {
        401: "Image List Not Found",
        402: "Image File Not Found"
    };
    public readonly content: string;

    constructor (public readonly code: number) {
        this.content = PatchGeneratorError.errorContents[code] ?? "Error Content Not Found";
    }
};

export class PatchGenerator {
    constructor(private readonly folder: FolderController) {
    }

    async create(): Promise<string | PatchGeneratorError> {
        const script = [
            new ChecksumsPatchGenerator().create(),
        ];

        if (this.folder.bgType.data === "fullscreen" && this.folder.bgImg.data.fullscreen) {
            const img = await this.folder.imgList.id2data(this.folder.bgImg.data.fullscreen);
            if (!img) {
                return new PatchGeneratorError(401);
            }
            const random = this.folder.random.data[img.id] ?? false;
            const interval = this.folder.interval.data[img.id] ?? 10 * 1000;
            const imgContent = img.type === "file" ? await path2File(img.path) : await path2Files(img.path);
            if (!imgContent) {
                return new PatchGeneratorError(402);
            }
            script.push(new FullscreenPatchGenerator({
                opacity: this.folder.opacity.data.fullscreen,
                content: typeof imgContent === "string" ? imgContent : {
                    images: imgContent,
                    random,
                    interval,
                },
            }).create());
        }
        if (Array.isArray(this.folder.bgType.data)) {
        }

        return minify(script.map(value => utils.withIIFE(value)).join(";")).code;
    }
};
