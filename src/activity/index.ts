import { CancellationToken, Uri, WebviewView, WebviewViewProvider, WebviewViewResolveContext } from "vscode";

export class ReaderViewProvider implements WebviewViewProvider {

    public static readonly viewType = "backimage.readerView";

	constructor(
		private readonly _extensionUri: Uri,
	) {
    }

	public resolveWebviewView(
		webviewView: WebviewView,
		_context: WebviewViewResolveContext,
		_token: CancellationToken,
	) {
		webviewView.webview.options = {
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

        webviewView.webview.html = [
            `<!DOCTYPE html>`,
            `<html lang="ja">`,
            `<meta charset="UTF-8">`,
            `<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport">`,
            `<title>TEST</title>`,
            `<head>`,
            `<h1 style="color: red;">hello world</h1>`,
            `<h2>test</h2>`,
            `</head>`,
            `</html>`,
        ].join("\n");
	}
}
