import {
	commands,
	ExtensionContext,
	window,
	l10n
} from "vscode";

import { ReaderViewProvider } from "./activity/index";
import { FileBackuController } from "./BackupFile/index";

export async function activate(context: ExtensionContext) {
	const backup = new FileBackuController();
	const readerViewProvider = new ReaderViewProvider(context.extensionUri);

	await backup.setup();

	context.subscriptions.push(
		window.registerWebviewViewProvider(ReaderViewProvider.viewType, readerViewProvider, {
			webviewOptions: {
				retainContextWhenHidden: true,
			}
		}),
		commands.registerCommand("backimage.refresh", () => {
			window.showInformationMessage("refreshed");
		})
	);
}

export async function deactivate() {}
