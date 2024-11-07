import { utils } from "../utils/index";
import { path2File, path2Files } from "../utils/folder";
import { FolderController } from "../ImgList/index";
import { ChecksumsPatchGenerator } from "./PatchGenerator.checksums";
import { FullscreenPatchGenerator } from "./PatchGenerator.fullscreen";
import { PanelPatchGenerator } from "./PatchGenerator.panel";
import { SidebarPatchGenerator } from "./PatchGenerator.sidebar";
import { EditorPatchGenerator } from "./PatchGenerator.editor";

export class PatchGeneratorError {
    public static readonly errorContents: Record<number, string> = {
        401: "Image List Not Found",
        402: "Image File Not Found",
        403: "Generate Patch JavaScript Error",
        404: "Minify Error",
    };
    public readonly content: string;

    constructor (public readonly code: number) {
        this.content = PatchGeneratorError.errorContents[code] ?? "Error Content Not Found";
    }
};

export class PatchGenerator {
    constructor() {}

    public static async exchangeData(id: string, folder: FolderController) {
        const img = await folder.imgList.id2data(id);
        if (!img) {
            return new PatchGeneratorError(401);
        }
        const random = folder.random.data[img.id] ?? false;
        const interval = folder.interval.data[img.id] ?? 10 * 1000;
        const imgContent = img.type === "file" ? await path2File(img.path) : await path2Files(img.path);
        if (!imgContent) {
            return new PatchGeneratorError(402);
        }
        return {
            img,
            random,
            interval,
            imgContent,
        };
    }

    public static async create(folder: FolderController): Promise<string | PatchGeneratorError> {
        try {
            const { minify } = await import("terser");
            const script = [
                new ChecksumsPatchGenerator().create(),
            ];
    
            if (folder.bgType.data === "fullscreen" && folder.bgImg.data.fullscreen) {
                const data = await PatchGenerator.exchangeData(folder.bgImg.data.fullscreen, folder);
                if (data instanceof PatchGeneratorError) {
                    return data;
                }
                const { imgContent, random, interval } = data;
                script.push(new FullscreenPatchGenerator({
                    opacity: folder.opacity.data.fullscreen,
                    content: typeof imgContent === "string" ? imgContent : {
                        images: imgContent,
                        random,
                        interval,
                    },
                }).create());
            }
            if (Array.isArray(folder.bgType.data)) {
                if (folder.bgType.data.includes("panel") && folder.bgImg.data.panel) {
                    const data = await PatchGenerator.exchangeData(folder.bgImg.data.panel, folder);
                    if (data instanceof PatchGeneratorError) {
                        return data;
                    }
                    const { imgContent, random, interval } = data;
                    script.push(new PanelPatchGenerator({
                        opacity: folder.opacity.data.panel,
                        content: typeof imgContent === "string" ? imgContent : {
                            images: imgContent,
                            random,
                            interval,
                        },
                    }).create());
                }
                if (folder.bgType.data.includes("editor") && folder.bgImg.data.editor) {
                    const data = await PatchGenerator.exchangeData(folder.bgImg.data.editor, folder);
                    if (data instanceof PatchGeneratorError) {
                        return data;
                    }
                    const { imgContent, random, interval } = data;
                    script.push(new EditorPatchGenerator({
                        opacity: folder.opacity.data.editor,
                        useFront: true,
                        style: {},
                        styles: [],
                        content: typeof imgContent === "string" ? imgContent : {
                            images: imgContent,
                            random,
                            interval,
                        },
                    }).create());
                }
                if (folder.bgType.data.includes("side-bar") && folder.bgImg.data.sideBar) {
                    const data = await PatchGenerator.exchangeData(folder.bgImg.data.sideBar, folder);
                    console.log(data);
                    if (data instanceof PatchGeneratorError) {
                        return data;
                    }
                    const { imgContent, random, interval } = data;
                    script.push(new SidebarPatchGenerator({
                        opacity: folder.opacity.data.panel,
                        content: typeof imgContent === "string" ? imgContent : {
                            images: imgContent,
                            random,
                            interval,
                        },
                    }).create());
                }
            }
            const content = script.map(value => utils.withIIFE(value)).join(";");
            const result = await minify(content);

            return result.code ?? new PatchGeneratorError(404);
        } catch (error) {
            console.log(error);
            return new PatchGeneratorError(403);
        }
    }
};
