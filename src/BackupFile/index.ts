import { tmpdir } from "os";
import fs from "fs";
import path from "path";

import { l10n, window } from "vscode";

import { BACKUP_CSS_PATH, BACKUP_JS_PATH, ENCODING, PKG_NAME, VERSION } from "../utils/constants";
import { basePath, cssPath, jsPath } from "../utils/vscodePath";
import { utils } from "../utils";
import { FolderController } from "../ImgList";
import { PatchGenerator } from "../PatchGenerator/index";

export class FileBackuController {
    constructor() {}

    private get hasBackup(): boolean {
        return fs.existsSync(BACKUP_JS_PATH) && fs.existsSync(BACKUP_CSS_PATH);
    }

    private get getContent() {
        return {
            css: fs.readFileSync(cssPath, ENCODING),
            js: fs.readFileSync(jsPath, ENCODING),
        };
    }

    private async saveContentTo(filePath: string, content: string) {
        try {
            if (fs.existsSync(filePath)) {
                await fs.promises.access(filePath, fs.constants.W_OK);
            };
            await fs.promises.mkdir(basePath, { recursive: true });
            await fs.promises.writeFile(filePath, content, ENCODING);
            return true;
        } catch (e) {
            const retry = "Retry with Admin/Sudo";
            const error = e instanceof Error ? e.message : "Extension Can't writeFileSync";
            const result = await window.showErrorMessage(error, l10n.t(retry));
            if (!result) {
                return false;
            }

            const tempFilePath = path.join(tmpdir(), `vscode-backimage-${Date.now()}.temp`);
            await fs.promises.writeFile(tempFilePath, content, ENCODING);

            try {
                const mvcmd = process.platform === "win32" ? "move /Y" : "mv -f";
                const cmdarg = `${mvcmd} "${utils.escape(tempFilePath)}" "${utils.escape(filePath)}"`;
                await utils.sudoExec(cmdarg, { name: "Background Extension" });
                return true;
            } catch (e) {
                const error = e instanceof Error ? e.message : "Extension Error";
                await window.showErrorMessage(error);
                return false;
            } finally {
                await fs.promises.rm(tempFilePath);
            }
        }
    }

    public async update(folder: FolderController, patch: PatchGenerator): Promise<boolean> {
        if (folder.enable && folder.bgType.data) {
            const base = this.getContent;
            const content = this.getContent;
            const newContent = [
                base,
                `//${PKG_NAME}.${VERSION}`,
                ``,
                `//END.${PKG_NAME}.${VERSION}`
            ].join("\n");
//            if (content.js === newContent) {
//                return false;
//            } else {
//                await this.saveContentTo(jsPath, newContent);
//                return true;
//            };
            return false;
        } else {
            return await this.restore();
        }
    }

    public async setup(): Promise<boolean> {
        if (this.hasBackup) {
            return false;
        }

        const content = this.getContent;

        await this.saveContentTo(BACKUP_JS_PATH, content.js);
        await this.saveContentTo(BACKUP_CSS_PATH, content.css);

        return true;
    }

    public async restore(): Promise<boolean> {
        if (!this.hasBackup) {
            return false;
        }

        const css = fs.readFileSync(BACKUP_CSS_PATH, ENCODING);
        const js = fs.readFileSync(BACKUP_JS_PATH, ENCODING);
        const content = this.getContent;

        if (content.js === js && content.css === css) {
            return false;
        } else {
            await this.saveContentTo(cssPath, css);
            await this.saveContentTo(jsPath, js);
            return true;
        };
    }
};
