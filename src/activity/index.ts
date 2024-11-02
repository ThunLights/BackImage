import { commands, ExtensionContext, l10n, OpenDialogOptions, Uri, WebviewView, WebviewViewProvider, window } from "vscode";

import { FolderController } from "../ImgList/index";
import { utils } from "../utils";

export class ReaderViewProvider implements WebviewViewProvider {

    public static readonly viewType = "extension.backimage.readerView";
	private folder: FolderController;

	constructor(
		private readonly _extensionUri: Uri,
		private readonly _context: ExtensionContext,
	) {
		this.folder = new FolderController(_context);
    }

	private get imageLists(): string {
		const imgList = this.folder.imageLists;
		let content = /*html*/`<p>${utils.blockXSS(l10n.t("There are no listings registered"))}</p>`;

		if (imgList.length) {
			const elements: string[] = [];
			for (const img of imgList) {
				elements.push(/*html*/`
					<div class="list">
						<p>${utils.blockXSS(img.name)}</p>
						<small>${utils.blockXSS(img.path)}</small>
					</div>
				`);
			}
			content = elements.join("\n");
		}

		return content;
	}

	private get options(): string {
		const folders = this.folder.imageLists;
		let content = /*html*/`<option value="" selected>${utils.blockXSS(l10n.t("Not Selected"))}</option>`;
		for (const folder of folders) {
			content += `\n` + /*html*/`<option value="${folder.id}">${utils.blockXSS(folder.name)}</option>`;
		}
		return content;
	}

	private enableOrDisable(content: boolean) {
		return content ? "enable" : "disable";
	}

	public resolveWebviewView(
		webviewView: WebviewView,
//		_context: WebviewViewResolveContext,
//		_token: CancellationToken,
	) {
		const { webview } = webviewView;
		const codeIconUri = webview.asWebviewUri(Uri.joinPath(this._extensionUri, "node_modules", "@vscode/codicons", "dist", "codicon.css"));
		const cssUri = webview.asWebviewUri(Uri.joinPath(this._extensionUri, "media", "style.css"));
		const scriptUri = webview.asWebviewUri(Uri.joinPath(this._extensionUri, "media", "script.js"));

		const enable = this._context.globalState.get<boolean>("enable") || false;
		const bgType = this.folder.backgroundType;

		const status = enable ? l10n.t("Enable") : l10n.t("Disable");
		const statusPanel = l10n.t("Current Status");
		const statusColor = enable ? "green" : "red";
		const statusChangerLabel = enable ? l10n.t("BackImage to disable") : l10n.t("BackImage to enable");

		webview.options = {
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webview.html = /*html*/`
			<!DOCTYPE html>
			<html lang="ja">
			<head>
				<meta charset="UTF-8">
				<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport">
				<title>BackImage Controle Panel</title>
				<link href="${cssUri}" rel="stylesheet">
				<link href="${codeIconUri}" rel="stylesheet">
			</head>
			<body>
				<div class="status-list">
					<input type="hidden" id="status" value="${ this.enableOrDisable(enable) }" />
					<input type="hidden" id="switch-fullscreen" value="${this.enableOrDisable(bgType === "fullscreen")}">
					<input type="hidden" id="switch-side-bar" value="${this.enableOrDisable(Boolean(bgType && bgType !== "fullscreen" && bgType.includes("side-bar")))}">
					<input type="hidden" id="switch-editor" value="${this.enableOrDisable(Boolean(bgType && bgType !== "fullscreen" && bgType.includes("editor")))}">
					<input type="hidden" id="switch-panel" value="${this.enableOrDisable(Boolean(bgType && bgType !== "fullscreen" && bgType.includes("panel")))}">
				</div>
				<main>
					<div class="contents-block">
						<button id="apply-settings-button" class="button padding-small-button">${l10n.t("Apply settings")}</button>
					</div>
					<div class="contents-block">
						<p>${statusPanel}: <strong style="color: ${statusColor};" id="status-panel">${status}</strong></p>
						<button id="status-changer" class="button">${statusChangerLabel}</button>
					</div>

					<div class="contents-block margin-top">
						<p class="inline contents-small-title">${l10n.t("Full Screen")}</p>
						<div class="contents-controls">
							<button class="contents-switch">OFF</button>
							<select class="contents-selector" id="full-screen">${this.options}</select>
						</div>
					</div>
					<div class="contents-block margin-top">
						<p class="inline contents-small-title">${l10n.t("Side Bar")}</p>
						<div class="contents-controls">
							<button class="contents-switch">OFF</button>
							<select class="contents-selector" id="side-bar">${this.options}</select>
						</div>
					</div>
					<div class="contents-block margin-top">
						<p class="inline contents-small-title">${l10n.t("Editor")}</p>
						<div class="contents-controls">
							<button class="contents-switch">OFF</button>
							<select class="contents-selector" id="editor">${this.options}</select>
						</div>
					</div>
					<div class="contents-block margin-top">
						<p class="inline contents-small-title">${l10n.t("Panel")}</p>
						<div class="contents-controls">
							<button class="contents-switch">OFF</button>
							<select class="contents-selector" id="panel">${this.options}</select>
						</div>
					</div>

					<div class="contents-block margin-top">
						<p class="contents-title">
							${l10n.t("Image List")}
							<i id="file-plus" class="info-buttons codicon codicon-file-add"></i>
							<i id="dir-plus" class="info-buttons codicon codicon-file-directory-create"></i>
						</p>
						<div class="img-list">${this.imageLists}</div>
					</div>
				</main>
				<script src="${scriptUri}"></script>
			</body>
            </html>
		`;
		webview.onDidReceiveMessage(async (e) => {
			const content = JSON.parse(e);
			if (content.type === "enable") {
				await this._context.globalState.update("enable", true);
				await webview.postMessage(JSON.stringify({
					type: "enable",
					contents: {
						text: l10n.t("Enable"),
						color: "green",
						button: l10n.t("BackImage to disable"),
					},
					status: true,
				}));
			}
			if (content.type === "disable") {
				await this._context.globalState.update("enable", false);
				await webview.postMessage(JSON.stringify({
					type: "enable",
					contents: {
						text: l10n.t("Disable"),
						color: "red",
						button: l10n.t("BackImage to enable"),
					},
					status: false,
				}));
			}
			if (content.type === "update") {
				await commands.executeCommand("extension.backimage.refresh");
			}
			if (content.type === "log") {
				console.log(content.text);
			}
			if (content.type === "getImg") {
				const isGetFile = content.get === "files";
				const options = {
					canSelectMany: false,
					canSelectFiles: isGetFile,
					canSelectFolders: !isGetFile,
				} satisfies OpenDialogOptions;
				const fileUri = await window.showOpenDialog(options) ?? [];
				if (fileUri.length) {
					const { fsPath } = fileUri[0];
					await webview.postMessage(JSON.stringify({
						type: "file",
						id: content.id,
						path: fsPath,
					}));
				} else {
					await webview.postMessage(JSON.stringify({
						type: "folder",
						id: content.id,
						path: null,
					}));
				};
			}
		});
	}
}
