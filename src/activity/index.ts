import { ExtensionContext, l10n, Uri, WebviewView, WebviewViewProvider } from "vscode";

//const vscode = acquireVsCodeApi();

export class ReaderViewProvider implements WebviewViewProvider {

    public static readonly viewType = "extension.backimage.readerView";

	constructor(
		private readonly _extensionUri: Uri,
		private readonly _context: ExtensionContext,
	) {
    }

	public resolveWebviewView(
		webviewView: WebviewView,
//		_context: WebviewViewResolveContext,
//		_token: CancellationToken,
	) {
		const { webview } = webviewView;
		const cssUri = webview.asWebviewUri(Uri.joinPath(this._extensionUri, "media", "style.css"));
		const scriptUri = webview.asWebviewUri(Uri.joinPath(this._extensionUri, "media", "script.js"));

		const enable = this._context.globalState.get<boolean>("enable") || false;

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
			</head>
			<body>
				<div class="status-list">
					<input type="hidden" id="status" value="${ enable ? "enable" : "disable" }" />
				</div>
				<main>
					<p>${statusPanel}: <strong style="color: ${statusColor};" id="status-panel">${status}</strong></p>
					<button id="status-changer" class="button">${statusChangerLabel}</button>
				</main>
				<script src="${scriptUri}"></script>
			</body>
            </html>
		`;
		webview.onDidReceiveMessage(async (e) => {
			const content = JSON.parse(e);
			if (content.type === "enable") {
				this._context.globalState.update("enable", true);
				webview.postMessage(JSON.stringify({
					type: "enable",
					contents: {
						text: l10n.t("Enable"),
						color: "green",
						button: l10n.t("BackImage to disable"),
					},
					status: true,
				}));
				console.log(this._context.globalState.get("enable"));
			}
			if (content.type === "disable") {
				this._context.globalState.update("enable", false);
				webview.postMessage(JSON.stringify({
					type: "enable",
					contents: {
						text: l10n.t("Disable"),
						color: "red",
						button: l10n.t("BackImage to enable"),
					},
					status: false,
				}));
				console.log(this._context.globalState.get("enable"));
			}
		});
	}
}
