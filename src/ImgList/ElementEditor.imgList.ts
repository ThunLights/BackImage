import { ExtensionContext } from "vscode";
import { ElementEditor, Folder } from "./ElementEditor.base";

export class ImgListEditor extends ElementEditor {
    public static readonly _key = "imageLists";

    constructor(_context: ExtensionContext) {
        super(_context);
    }

    get data() {
        return this._context.globalState.get<Folder[]>(ImgListEditor._key) ?? [];
    }

    public async id2data(id: string) {
        const imgs = this.data;
        for (const img of imgs) {
            if (id === img.id) {
                return img;
            }
        }
        return null;
    }

    public async add(folder: Folder) {
        folder.description = folder.description.trim();
        const imgList = this.data;
        imgList.push(folder);
        await this._context.globalState.update(ImgListEditor._key, imgList);
        return imgList;
    }

    public async update(id: string, name?: string, description?: string, path?: string) {
        let imgList = this.data;
        imgList = imgList.map(value => value.id === id ? {
            id: value.id,
            type: value.type,
            path: path ?? value.path,
            name: name ?? value.name,
            description: description ? description.trim() : value.description,
        } : value);
        await this._context.globalState.update(ImgListEditor._key, imgList);
        return imgList;
    }

    public async remove(id: string) {
        let imgList = this.data;
        imgList = imgList.filter(value => value.id !== id);
        await this._context.globalState.update(ImgListEditor._key, imgList);
        return imgList;
    }
}
