import { commands, ExtensionContext, l10n, OpenDialogOptions, Uri, WebviewView, WebviewViewProvider, window } from "vscode";

import { FolderController } from "../ImgList/index";
import { utils } from "../utils/index";
import { BackgroundType, fullscreenOther } from "../ImgList/ElementEditor.base";

export class ReaderViewProvider implements WebviewViewProvider {
    public static readonly viewType = "extension.backimage.readerView";

	constructor(
		private readonly _extensionUri: Uri,
		private readonly _context: ExtensionContext,
		private readonly folder: FolderController,
	) {
    }

	private get imageLists(): string {
		const imgList = this.folder.imgList.data;
		let content = /*html*/`<p>${utils.blockXSS(l10n.t("There are no listings registered"))}</p>`;

		if (imgList.length) {
			const elements: string[] = [];
			for (const img of imgList) {
				const id = utils.blockXSS(img.id);
				const name = utils.blockXSS(img.name);
				const description = utils.blockXSS(img.description);
				const elementType = img.type === "file" ? "files" : "directories";
				const random = this.folder.random.data[img.id] ?? false;
				const interval = this.folder.interval.data[img.id] ?? 10 * 1000;
				elements.push(/*html*/`
					<div class="list">
						<div class="list-infos">
							<input type="hidden" id="element_type_${id}" value="${elementType}">
						</div>
						<div class="list-upper">
							<div>
								<i class="info-buttons codicon codicon-file${img.type === "file" ? "" : "-directory"}"></i>
								<p id="name_${id}" class="inline">${name}</p>
								<i id="edit_name_${id}" class="info-buttons codicon codicon-edit" style="display: none;"></i>
							</div>
							<div>
								<i id="info_${id}" class="info-buttons codicon codicon-list-unordered"></i>
								<i id="delete_${id}" class="info-buttons codicon codicon-trash"></i>
							</div>
						</div>
						<div class="list-lower">
							<div>
								<p id="path_${id}" class="inline break-all">${utils.blockXSS(img.path)}</p>
								<i id="edit_path_${id}" class="info-buttons codicon codicon-edit" style="display: none;"></i>
							</div>
							<div id="more_info_${id}" class="more-info" style="display: none">
								${img.type === "folder" ? /*js*/`
								<div>
									<p class="inline">${l10n.t("Random")}: <input id="random_${id}" type="checkbox" ${random ? "checked" : ""}/></p>
								</div>
								<div>
									<p class="inline">${l10n.t("Interval")}: <strong id="interval_${id}" contenteditable="true">${interval / 1000}</strong>${l10n.t("Seconds")}</p>
									<small class="inline">${l10n.t("*Press enter to save")}</small>
								</div>
								` : ""}
								<p class="inline">${l10n.t("Description")}</p>
								<i id="edit_description_${id}" class="inline info-buttons codicon codicon-edit" style="display: none;"></i>
								<p>${this.descriptionParser(description)}</p>
								<p class="caution break-all">${l10n.t("ID")}: ${id}</p>
							</div>
							<div id="delete_final_confirmation_${id}" class="delete_final_confirmation" style="display: none;">
								<button id="delete_cancel_${id}">${l10n.t("Cancel")}</button>
								<button id="delete_select_${id}">${l10n.t("Delete")}</button>
							</div>
							<div id="name-update-${id}" class="updete-component" style="display: none;">
								<div>
									<p>${l10n.t("Rename")}: (${l10n.t("Now")} <strong id="name_${id}">${name}</strong>)</p>
								</div>
								<div>
									<input type="text" id="update-name-content-${id}" value="${name}"/>
								</div>
								<div class="delete_final_confirmation">
									<button id="update_name_cancel_${id}">${l10n.t("Cancel")}</button>
									<button id="update_name_select_${id}">${l10n.t("Change")}</button>
								</div>
							</div>
							<div id="description-update-${id}" class="updete-component" style="display: none;">
								<div>
									<p>${l10n.t("Change description")}: (${l10n.t("Now")} <strong id="description_${id}">${description}</strong>)</p>
								</div>
								<div>
									<textarea id="update-description-content-${id}" value="${description}"></textarea>
								</div>
								<div class="delete_final_confirmation">
									<button id="update_description_cancel_${id}">${l10n.t("Cancel")}</button>
									<button id="update_description_select_${id}">${l10n.t("Change")}</button>
								</div>
							</div>
						</div>
					</div>
				`);
			}
			content = elements.join("\n");
		}

		return content;
	}

	private get options(): string {
		const folders = this.folder.imgList.data;
		let content = /*html*/`<option value="" selected>${utils.blockXSS(l10n.t("Not Selected"))}</option>`;
		for (const folder of folders) {
			content += `\n` + /*html*/`<option value="${folder.id}">${utils.blockXSS(folder.name)}</option>`;
		}
		return content;
	}

	private descriptionParser(content: string): string {
		const result: string[] = [];
		const descriptions = content.split("\n");
		for (const description of descriptions) {
			result.push(/*html*/`<p>${utils.blockXSS(description)}</p>`);
		}
		return result.join("\n");
	}

	private enableOrDisable(content: boolean) {
		return content ? "enable" : "disable";
	}

	private onOrOff(content: boolean) {
		return content ? "ON" : "OFF";
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

		const enable = this.folder.enable.data;
		const bgType = this.folder.bgType.data;
		const opacities = this.folder.opacity.data;

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
						<button id="reset-settings-button" class="button padding-small-button">${l10n.t("Disable reflection of settings")}</button>
					</div>
					<div class="contents-block">
						<p>${statusPanel}: <strong style="color: ${statusColor};" id="status-panel">${status}</strong></p>
						<button id="status-changer" class="button">${statusChangerLabel}</button>
					</div>

					<div class="contents-block margin-top">
						<div class="list-upper">
							<p class="inline contents-small-title">${l10n.t("Full Screen")}</p>
							<i id="fullscreen-info" class="info-buttons codicon codicon-symbol-property"></i>
						</div>
						<div class="contents-controls">
							<button class="contents-switch" id="full-screen-button">${this.onOrOff(bgType === "fullscreen")}</button>
							<select class="contents-selector" id="full-screen">${this.options}</select>
						</div>
						<div id="full-screen-settings-panel" class="settings-panel" style="display: none;">
							<div>
								<p>${l10n.t("Transparency")}: <strong
									id="full-screen-opacities-content"
									class="extra-input"
									contenteditable="true"
								>${opacities.fullscreen * 100}</strong>% <small>(${l10n.t("Default")}: 85%)</small></p>
							</div>
							<div>
								<input id="full-screen-opacity-range" type="range" value="${opacities.fullscreen * 100}" min="0" max="100" />
							</div>
						</div>
					</div>
					<div class="contents-block margin-top">
						<div class="list-upper">
							<p class="inline contents-small-title">${l10n.t("Side Bar")}</p>
							<i id="sideBar-info" class="info-buttons codicon codicon-symbol-property"></i>
						</div>
						<div class="contents-controls">
							<button class="contents-switch" id="side-bar-button">${this.onOrOff(Boolean(bgType && bgType !== "fullscreen" && bgType.includes("side-bar")))}</button>
							<select class="contents-selector" id="side-bar">${this.options}</select>
						</div>
						<div id="side-bar-settings-panel" class="settings-panel" style="display: none;">
							<div>
								<p>${l10n.t("Transparency")}: <strong
									id="side-bar-opacities-content"
									class="extra-input"
									contenteditable="true"
								>${opacities.sideBar * 100}</strong>% <small>(${l10n.t("Default")}: 85%)</small></p>
							</div>
							<div>
								<input id="side-bar-opacity-range" type="range" value="${opacities.sideBar * 100}" min="0" max="100" />
							</div>
						</div>
					</div>
					<div class="contents-block margin-top">
						<div class="list-upper">
							<p class="inline contents-small-title">${l10n.t("Editor")}</p>
							<i id="editor-info" class="info-buttons codicon codicon-symbol-property"></i>
						</div>
						<div class="contents-controls">
							<button class="contents-switch" id="editor-button">${this.onOrOff(Boolean(bgType && bgType !== "fullscreen" && bgType.includes("editor")))}</button>
							<select class="contents-selector" id="editor">${this.options}</select>
						</div>
						<div id="editor-settings-panel" class="settings-panel" style="display: none;">
							<div>
								<p>${l10n.t("Transparency")}: <strong
									id="editor-opacities-content"
									class="extra-input"
									contenteditable="true"
								>${opacities.editor * 100}</strong>% <small>(${l10n.t("Default")}: 85%)</small></p>
							</div>
							<div>
								<input id="editor-opacity-range" type="range" value="${opacities.editor * 100}" min="0" max="100" />
							</div>
						</div>
					</div>
					<div class="contents-block margin-top">
						<div class="list-upper">
							<p class="inline contents-small-title">${l10n.t("Panel")}</p>
							<i id="panel-info" class="info-buttons codicon codicon-symbol-property"></i>
						</div>
						<div class="contents-controls">
							<button class="contents-switch" id="panel-button">${this.onOrOff(Boolean(bgType && bgType !== "fullscreen" && bgType.includes("panel")))}</button>
							<select class="contents-selector" id="panel">${this.options}</select>
						</div>
						<div id="panel-settings-panel" class="settings-panel" style="display: none;">
							<div>
								<p>${l10n.t("Transparency")}: <strong
									id="panel-opacities-content"
									class="extra-input"
									contenteditable="true"
								>${opacities.panel * 100}</strong>% <small>(${l10n.t("Default")}: 85%)</small></p>
							</div>
							<div>
								<input id="panel-opacity-range" type="range" value="${opacities.panel * 100}" min="0" max="100" />
							</div>
						</div>
					</div>
					<div class="contents-block">
						<small class="caution">${l10n.t("*Full screen mode must be turned off to turn on other modes")}</small>
					<div>

					<div class="contents-block margin-top">
						<div class="unified-font-size-18">
							<p class="contents-title inline">${l10n.t("Image List")}</p>
							<i id="file-plus" class="info-buttons codicon codicon-file-add"></i>
							<i id="dir-plus" class="info-buttons codicon codicon-file-directory-create"></i>
						</div>
						<div id="img-lists" class="img-list">${this.imageLists}</div>
					</div>
				</main>
				<script src="${scriptUri}"></script>
			</body>
            </html>
		`;
		webview.onDidReceiveMessage(async (e) => {
			const content = JSON.parse(e);
			if (content.type === "enable") {
				await this.folder.enable.update(true);
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
				await this.folder.enable.update(false);
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
			if (content.type === "restore") {
				await this.folder.enable.update(false);
				await commands.executeCommand("extension.backimage.restore");
			}
			if (content.type === "start") {
				await webview.postMessage(JSON.stringify({
					type: "start",
					ids: this.folder.imgList.data.map(value => value.id),
					selects: this.folder.bgImg.data,
				}));
			}
			if (content.type === "updateSelect") {
				await this.folder.bgImg.update(content.id, content.content);
			}
			if (content.type === "updateOpacity") {
				await this.folder.opacity.update(content.id, content.content);
			}
			if (content.type === "updateRandom") {
				await this.folder.random.update(content.id, content.content);
			}
			if (content.type === "updateInterval") {
				await this.folder.interval.update(content.id, content.content);
			}
			if (content.type === "imgList") {
				if (content.action === "add") {
					await this.folder.imgList.add({
						id: Date.now().toString(),
						name: Date.now().toString(),
						type: content.fType,
						path: content.path,
						description: "",
					});
				}
				if (content.action === "update") {
					await this.folder.imgList.update(content.id, content.name, content.description, content.path);
				}
				if (content.action === "remove") {
					await this.folder.imgList.remove(content.id);
					await this.folder.random.update(content.id);
					await this.folder.interval.update(content.id);
				}
				await webview.postMessage(JSON.stringify({
					type: "updateImgList",
					options: this.options,
					imgs: this.imageLists,
					ids: this.folder.imgList.data.map(value => value.id),
					selects: this.folder.bgImg.data,
				}));
			}
			if (content.type === "settingsUpdate") {
				let bgType: BackgroundType = null;
				if (Array.isArray(content.content)) {
					let bgTypes: fullscreenOther[] = [];
					if (content.content.includes("panel")) { bgTypes.push("panel"); }
					if (content.content.includes("side-bar")) { bgTypes.push("side-bar"); }
					if (content.content.includes("editor")) { bgTypes.push("editor"); }
					bgType = bgTypes;
				} else if (content.content === "fullscreen") {
					bgType = "fullscreen";
				}
				await this.folder.bgType.update(bgType);
				await webview.postMessage(JSON.stringify({
					type: "settingsUpdate",
					content: bgType,
				}));
			}
			if (content.type === "getImg") {
				const isGetFile = content.get === "files";
				const responseType = content.get === "files" ? "file" : "folder";
				const options = {
					canSelectMany: false,
					canSelectFiles: isGetFile,
					canSelectFolders: !isGetFile,
				} satisfies OpenDialogOptions;
				const fileUri = await window.showOpenDialog(options) ?? [];
				if (fileUri.length) {
					const { fsPath } = fileUri[0];
					await webview.postMessage(JSON.stringify({
						type: "getImg",
						get: responseType,
						id: content.id,
						path: fsPath,
					}));
				} else {
					await webview.postMessage(JSON.stringify({
						type: "getImg",
						id: content.id,
						path: null,
					}));
				};
			}
		});
	}
}
